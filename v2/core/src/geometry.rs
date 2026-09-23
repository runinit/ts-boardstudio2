use crate::model::{
    Contour, Finding, Operation, OutlineFeature, Part, ProjectDoc, Scope, Severity, Vec2,
};
use i_overlay::core::fill_rule::FillRule;
use i_overlay::core::overlay_rule::OverlayRule;
use i_overlay::float::single::SingleFloatOverlay;
use std::collections::{BTreeMap, BTreeSet};

// Millimetre coordinates are quantized to a micrometre before clipping.
const SCALE: f64 = 1_000.0;
const MAX_CHORD_ERROR_MM: f64 = 0.05;
const MAX_ARC_SEGMENTS: usize = 1024;
type Path = Vec<[f64; 2]>;
type Shapes = Vec<Vec<Path>>;

fn snap(value: f64) -> f64 {
    (value * SCALE).round() / SCALE
}
fn point(p: Vec2) -> [f64; 2] {
    [snap(p.x), snap(p.y)]
}

fn rect(center: Vec2, size: Vec2, radius: f64) -> Path {
    let hx = size.x / 2.0;
    let hy = size.y / 2.0;
    let r = radius.max(0.0).min(hx).min(hy);
    if r == 0.0 {
        return vec![
            point(Vec2 {
                x: center.x - hx,
                y: center.y - hy,
            }),
            point(Vec2 {
                x: center.x + hx,
                y: center.y - hy,
            }),
            point(Vec2 {
                x: center.x + hx,
                y: center.y + hy,
            }),
            point(Vec2 {
                x: center.x - hx,
                y: center.y + hy,
            }),
        ];
    }
    let corners = [
        (center.x + hx - r, center.y + hy - r, 0.0),
        (center.x - hx + r, center.y + hy - r, 90.0),
        (center.x - hx + r, center.y - hy + r, 180.0),
        (center.x + hx - r, center.y - hy + r, 270.0),
    ];
    let max_angle = 2.0 * (1.0 - MAX_CHORD_ERROR_MM / r).clamp(-1.0, 1.0).acos();
    let segments =
        ((std::f64::consts::FRAC_PI_2 / max_angle).ceil() as usize).clamp(1, MAX_ARC_SEGMENTS);
    let mut path = Vec::with_capacity((segments + 1) * 4);
    for (cx, cy, start) in corners {
        for step in 0..=segments {
            let angle = (start + step as f64 * 90.0 / segments as f64).to_radians();
            path.push([snap(cx + r * angle.cos()), snap(cy + r * angle.sin())]);
        }
    }
    path
}

fn envelope(doc: &ProjectDoc, ids: &[String], margin: f64) -> Option<Path> {
    let member_ids: BTreeSet<_> = ids.iter().map(String::as_str).collect();
    let definitions: BTreeMap<_, _> = doc
        .definitions
        .iter()
        .map(|def| (def.id.as_str(), def))
        .collect();
    let mut min = Vec2 {
        x: f64::INFINITY,
        y: f64::INFINITY,
    };
    let mut max = Vec2 {
        x: f64::NEG_INFINITY,
        y: f64::NEG_INFINITY,
    };
    let mut found = false;
    for part in doc
        .parts
        .iter()
        .filter(|part| member_ids.contains(part.id.as_str()))
    {
        let Some(def) = definitions.get(part.definition_id.as_str()) else {
            continue;
        };
        for corner in &def.courtyard {
            let angle = part.pose.rotation.to_radians();
            let (sin, cos) = angle.sin_cos();
            let x = part.pose.at.x + corner.x * cos - corner.y * sin;
            let y = part.pose.at.y + corner.x * sin + corner.y * cos;
            min.x = min.x.min(x);
            min.y = min.y.min(y);
            max.x = max.x.max(x);
            max.y = max.y.max(y);
            found = true;
        }
    }
    if !found {
        return None;
    }
    let center = Vec2 {
        x: (max.x + min.x) / 2.0,
        y: (max.y + min.y) / 2.0,
    };
    let size = Vec2 {
        x: max.x - min.x + margin * 2.0,
        y: max.y - min.y + margin * 2.0,
    };
    Some(rect(center, size, 0.0))
}

fn feature_path(doc: &ProjectDoc, feature: &OutlineFeature) -> Option<Path> {
    match feature {
        OutlineFeature::Polygon { points, .. } => Some(points.iter().copied().map(point).collect()),
        OutlineFeature::Rect {
            center,
            size,
            radius,
            ..
        } => Some(rect(*center, *size, *radius)),
        OutlineFeature::PartEnvelope {
            part_ids, margin, ..
        } => envelope(doc, part_ids, *margin),
    }
}

fn valid(path: &Path) -> bool {
    path.len() >= 3 && path.iter().all(|p| p[0].is_finite() && p[1].is_finite())
}

#[derive(Clone, Default)]
pub struct OutlineCache {
    paths: BTreeMap<String, (OutlineFeature, Option<Path>)>,
}

pub fn outlines(
    doc: &ProjectDoc,
    previous: Option<&OutlineCache>,
    moved: &[String],
) -> (OutlineCache, Vec<Contour>, Vec<Finding>) {
    let mut cache = OutlineCache::default();
    for feature in &doc.outline {
        let path = previous
            .and_then(|old| old.paths.get(feature.id()))
            .filter(|(old_feature, _)| old_feature == feature && !depends_on(feature, moved))
            .map(|(_, path)| path.clone())
            .unwrap_or_else(|| feature_path(doc, feature));
        cache
            .paths
            .insert(feature.id().into(), (feature.clone(), path));
    }
    let (contours, findings) = compose(doc.outline.iter(), &cache);
    (cache, contours, findings)
}

fn depends_on(feature: &OutlineFeature, moved: &[String]) -> bool {
    match feature {
        OutlineFeature::PartEnvelope { part_ids, .. } => {
            part_ids.iter().any(|id| moved.contains(id))
        }
        _ => false,
    }
}

fn compose<'a>(
    features: impl Iterator<Item = &'a OutlineFeature>,
    cache: &OutlineCache,
) -> (Vec<Contour>, Vec<Finding>) {
    let mut shapes: Shapes = vec![];
    let mut findings = vec![];
    for feature in features {
        let Some((_, Some(path))) = cache.paths.get(feature.id()) else {
            findings.push(Finding {
                id: format!("outline:{}:missing", feature.id()),
                severity: Severity::Error,
                scope: Scope::Outline,
                message: "Outline feature has no resolved parts".into(),
                target_ids: vec![feature.id().into()],
            });
            continue;
        };
        if !valid(&path) {
            findings.push(Finding {
                id: format!("outline:{}:invalid", feature.id()),
                severity: Severity::Error,
                scope: Scope::Outline,
                message: "Outline requires three finite points".into(),
                target_ids: vec![feature.id().into()],
            });
            continue;
        }
        let rule = match feature.operation() {
            Operation::Add => OverlayRule::Union,
            Operation::Subtract => OverlayRule::Difference,
        };
        shapes = shapes.overlay(&path, rule, FillRule::EvenOdd);
    }
    let contours = shapes
        .into_iter()
        .flat_map(|shape| {
            shape.into_iter().enumerate().map(|(index, path)| Contour {
                points: path
                    .into_iter()
                    .map(|p| Vec2 { x: p[0], y: p[1] })
                    .collect(),
                hole: index > 0,
            })
        })
        .collect();
    (contours, findings)
}

pub fn board_contours(
    doc: &ProjectDoc,
    cache: &OutlineCache,
) -> (Vec<crate::model::BoardContours>, Vec<Finding>) {
    let mut boards = Vec::with_capacity(doc.boards.len());
    let mut findings = vec![];
    for board in &doc.boards {
        let features = board
            .outline_ids
            .iter()
            .filter_map(|id| doc.outline.iter().find(|feature| feature.id() == id));
        let (contours, problems) = compose(features, cache);
        for problem in problems {
            findings.push(Finding {
                id: format!("board:{}:feature:{}", board.id, problem.id),
                severity: Severity::Error,
                scope: Scope::Pcb,
                message: problem.message,
                target_ids: vec![board.id.clone()]
                    .into_iter()
                    .chain(problem.target_ids)
                    .collect(),
            });
        }
        boards.push(crate::model::BoardContours {
            board_id: board.id.clone(),
            contours,
        });
    }
    (boards, findings)
}

pub fn part_valid(part: &Part, doc: &ProjectDoc) -> bool {
    doc.definitions
        .iter()
        .any(|def| def.id == part.definition_id)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::model::{PartDefinition, PartKind, Pose2, Side};
    use std::time::Instant;

    const SAMPLES: usize = 100;
    const WARMUP: usize = 10;
    const PITCH: f64 = 19.05;

    fn fixture(keys: usize) -> ProjectDoc {
        let mut doc = ProjectDoc::empty("bench", "Benchmark");
        doc.definitions.push(PartDefinition {
            id: "switch".into(),
            name: "Switch".into(),
            kind: PartKind::Switch,
            courtyard: vec![
                Vec2 { x: -7.0, y: -7.0 },
                Vec2 { x: 7.0, y: -7.0 },
                Vec2 { x: 7.0, y: 7.0 },
                Vec2 { x: -7.0, y: 7.0 },
            ],
            pads: vec![],
            model: None,
            generator: None,
        });
        for index in 0..keys {
            let id = format!("key-{index}");
            doc.parts.push(Part {
                id: id.clone(),
                definition_id: "switch".into(),
                reference: format!("SW{}", index + 1),
                pose: Pose2 {
                    at: Vec2 {
                        x: (index % 20) as f64 * PITCH,
                        y: (index / 20) as f64 * PITCH,
                    },
                    rotation: 0.0,
                },
                side: Side::Front,
                locked: None,
                properties: None,
            });
            doc.outline.push(OutlineFeature::PartEnvelope {
                id: format!("edge-{index}"),
                part_ids: vec![id],
                margin: 1.0,
                operation: Operation::Add,
            });
        }
        doc
    }

    #[test]
    fn rounded_rect_uses_physical_chord_tolerance() {
        let small = rect(Vec2 { x: 0.0, y: 0.0 }, Vec2 { x: 2.0, y: 2.0 }, 0.5);
        let large = rect(Vec2 { x: 0.0, y: 0.0 }, Vec2 { x: 200.0, y: 200.0 }, 50.0);
        assert!(large.len() > small.len());
        assert!(large.len() <= (MAX_ARC_SEGMENTS + 1) * 4);
        for (radius, path) in [(0.5, small), (50.0, large)] {
            let segments = path.len() / 4 - 1;
            let sagitta =
                radius * (1.0 - (std::f64::consts::FRAC_PI_2 / segments as f64 / 2.0).cos());
            assert!(sagitta <= MAX_CHORD_ERROR_MM);
        }
    }

    #[test]
    fn cached_move_matches_full_and_reuses_paths() {
        let mut doc = fixture(4);
        let (old, _, _) = outlines(&doc, None, &[]);
        doc.parts[0].pose.at.x += 3.0;
        let (cached, contours, findings) = outlines(&doc, Some(&old), &["key-0".into()]);
        let (full, expected, expected_findings) = outlines(&doc, None, &[]);
        assert_eq!(contours, expected);
        assert_eq!(findings, expected_findings);
        assert_ne!(cached.paths["edge-0"].1, old.paths["edge-0"].1);
        assert_eq!(cached.paths["edge-1"].1, old.paths["edge-1"].1);
        assert_eq!(cached.paths["edge-0"].1, full.paths["edge-0"].1);
    }

    fn percentile(samples: &mut [u128], percent: usize) -> u128 {
        samples.sort_unstable();
        samples[samples.len() * percent / 100]
    }

    fn compare(keys: usize) {
        let mut doc = fixture(keys);
        let (mut cache, _, _) = outlines(&doc, None, &[]);
        let moved = vec!["key-0".into()];
        let mut full = Vec::with_capacity(SAMPLES);
        let mut cached = Vec::with_capacity(SAMPLES);
        for index in 0..SAMPLES + WARMUP {
            doc.parts[0].pose.at.x = index as f64 * 0.01;
            let start = Instant::now();
            let (_, full_contours, _) = outlines(&doc, None, &[]);
            let full_time = start.elapsed().as_micros();
            let start = Instant::now();
            let (next, cached_contours, _) = outlines(&doc, Some(&cache), &moved);
            let cached_time = start.elapsed().as_micros();
            assert_eq!(full_contours, cached_contours);
            cache = next;
            if index >= WARMUP {
                full.push(full_time);
                cached.push(cached_time);
            }
        }
        println!(
            "{keys} features: full p50={}µs p95={}µs; cached p50={}µs p95={}µs",
            percentile(&mut full, 50),
            percentile(&mut full, 95),
            percentile(&mut cached, 50),
            percentile(&mut cached, 95)
        );
    }

    #[test]
    #[ignore = "Run with cargo test --release --lib -- --ignored --nocapture"]
    fn compare_100() {
        compare(100);
    }

    #[test]
    #[ignore = "Run with cargo test --release --lib -- --ignored --nocapture"]
    fn compare_200() {
        compare(200);
    }
}
