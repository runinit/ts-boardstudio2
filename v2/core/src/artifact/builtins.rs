use crate::model::{
    LocalTrace, LocalVia, Pad, PadShape, PartDefinition, PartGenerator, PartKind, Side, Vec2,
};
use serde_json::Value;
use std::collections::BTreeMap;

pub const BUILTIN_VERSION: &str = "1";
const MIN_HOLE_CLEARANCE: f64 = 0.2;

#[derive(Clone, Debug, PartialEq)]
pub struct BuiltinGeometry {
    pub pads: Vec<Pad>,
    pub courtyard: Vec<Vec2>,
    pub traces: Vec<LocalTrace>,
    pub vias: Vec<LocalVia>,
}

fn point(x: f64, y: f64) -> Vec2 {
    Vec2 { x, y }
}

fn box_courtyard(half: f64) -> Vec<Vec2> {
    vec![
        point(-half, -half),
        point(half, -half),
        point(half, half),
        point(-half, half),
    ]
}

fn number_param(params: &BTreeMap<String, Value>, key: &str, fallback: f64) -> Result<f64, String> {
    match params.get(key).map_or(Some(fallback), Value::as_f64) {
        Some(value) if value.is_finite() && value > 0.0 => Ok(value),
        _ => Err(format!("Invalid {key} footprint setting")),
    }
}

fn bool_param(params: &BTreeMap<String, Value>, key: &str, fallback: bool) -> Result<bool, String> {
    match params.get(key) {
        None => Ok(fallback),
        Some(Value::Bool(value)) => Ok(*value),
        _ => Err(format!("Invalid {key} footprint setting")),
    }
}

fn pad(id: &str, number: &str, x: f64, y: f64, size: f64, drill: Option<f64>) -> Pad {
    Pad {
        id: id.into(),
        number: number.into(),
        at: point(x, y),
        size: point(size, size),
        shape: PadShape::Circle,
        drill,
        plated: None,
        side: None,
        rotation: None,
        net_id: None,
    }
}

fn assert_mount_clearance(pads: &[Pad]) -> Result<(), String> {
    let holes = pads
        .iter()
        .filter(|entry| entry.plated == Some(false) && entry.drill.is_some())
        .collect::<Vec<_>>();
    for contact in pads.iter().filter(|entry| !entry.number.is_empty()) {
        for hole in &holes {
            let dx = (contact.at.x - hole.at.x).abs();
            let dy = (contact.at.y - hole.at.y).abs();
            let half_x = contact.size.x / 2.0;
            let half_y = contact.size.y / 2.0;
            let distance = match &contact.shape {
                PadShape::Circle => dx.hypot(dy) - half_x.max(half_y),
                _ => (dx - half_x).max(0.0).hypot((dy - half_y).max(0.0)),
            };
            if distance - hole.drill.expect("mount hole has drill") / 2.0 < MIN_HOLE_CLEARANCE {
                return Err(format!(
                    "Pad {} overlaps mounting hole {}",
                    contact.number, hole.id
                ));
            }
        }
    }
    Ok(())
}

fn switch_geometry(
    family: &str,
    hotswap: bool,
    params: &BTreeMap<String, Value>,
) -> Result<BuiltinGeometry, String> {
    let mx = family == "mx";
    let nominal_spacing = if mx {
        if hotswap { 12.952 } else { 6.35 }
    } else if hotswap {
        11.55
    } else {
        5.0
    };
    let spacing = number_param(params, "padSpacing", nominal_spacing)?;
    let drill = number_param(params, "padDrill", if mx { 1.4986 } else { 1.27 })?;
    let size = number_param(
        params,
        "padSize",
        if hotswap {
            2.6
        } else if mx {
            2.286
        } else {
            2.032
        },
    )?;
    if !hotswap && size <= drill {
        return Err("Switch pad size must exceed its drill".into());
    }
    let reversible = bool_param(params, "reversible", false)?;
    let include_copper = bool_param(params, "includeTracesVias", false)?;
    let mut contacts = if mx {
        if hotswap {
            vec![point(7.11, -2.54), point(-5.842, -5.08)]
        } else {
            vec![point(-2.54, -5.08), point(3.81, -2.54)]
        }
    } else if hotswap {
        vec![point(3.275, -5.95), point(-8.275, -3.75)]
    } else {
        vec![point(-5.0, -3.8), point(0.0, -5.9)]
    };
    let offset = spacing - nominal_spacing;
    contacts[1].x += (contacts[1].x - contacts[0].x).signum() * offset;
    let mut pads = contacts
        .iter()
        .enumerate()
        .map(|(index, at)| Pad {
            id: if index == 0 { "one" } else { "two" }.into(),
            number: (index + 1).to_string(),
            at: *at,
            size: point(
                size,
                if hotswap {
                    if mx { 2.5 } else { 2.6 }
                } else {
                    size
                },
            ),
            shape: if hotswap {
                PadShape::Rect
            } else {
                PadShape::Circle
            },
            drill: if hotswap { None } else { Some(drill) },
            plated: None,
            side: None,
            rotation: None,
            net_id: None,
        })
        .collect::<Vec<_>>();
    let center = if mx { 4.1 } else { 3.4 };
    let stabilizer = if mx { 1.9 } else { 1.5 };
    let stabilizer_x = if mx { 5.08 } else { 5.5 };
    let mut center_pad = pad("center", "", 0.0, 0.0, center, Some(center));
    center_pad.plated = Some(false);
    let mut left = pad(
        "left-stabilizer",
        "",
        -stabilizer_x,
        0.0,
        stabilizer,
        Some(stabilizer),
    );
    left.plated = Some(false);
    let mut right = pad(
        "right-stabilizer",
        "",
        stabilizer_x,
        0.0,
        stabilizer,
        Some(stabilizer),
    );
    right.plated = Some(false);
    pads.extend([center_pad, left, right]);
    if hotswap {
        let holes = if mx {
            vec![point(-2.54, -5.08), point(3.81, -2.54)]
        } else {
            vec![point(0.0, -5.95), point(-5.0, -3.75)]
        };
        for (index, at) in holes.iter().enumerate() {
            let mut hole = pad(
                &format!("socket-hole-{index}"),
                "",
                at.x,
                at.y,
                3.0,
                Some(3.0),
            );
            hole.plated = Some(false);
            pads.push(hole);
        }
    }
    assert_mount_clearance(&pads)?;
    let mut traces = Vec::new();
    let mut vias = Vec::new();
    if reversible && hotswap && include_copper {
        let width = number_param(params, "traceWidth", 0.25)?;
        let via_size = number_param(params, "viaSize", 0.8)?;
        let via_drill = number_param(params, "viaDrill", 0.4)?;
        if via_drill >= via_size {
            return Err("Via drill must be smaller than via size".into());
        }
        for source in pads.iter().filter(|entry| !entry.number.is_empty()) {
            let at = point(source.at.x + source.at.x.signum() * 1.8, source.at.y);
            traces.push(LocalTrace {
                id: format!("route-{}", source.id),
                start: source.at,
                end: at,
                width,
                pad_id: Some(source.id.clone()),
                layer: Side::Front,
            });
            vias.push(LocalVia {
                id: format!("via-{}", source.id),
                at,
                size: via_size,
                drill: via_drill,
                pad_id: Some(source.id.clone()),
            });
        }
    }
    Ok(BuiltinGeometry {
        pads,
        courtyard: if !mx && hotswap {
            vec![
                point(-10.0, -8.0),
                point(8.0, -8.0),
                point(8.0, 8.0),
                point(-10.0, 8.0),
            ]
        } else {
            box_courtyard(if mx { 9.0 } else { 8.0 })
        },
        traces,
        vias,
    })
}

fn diode_geometry() -> BuiltinGeometry {
    BuiltinGeometry {
        pads: vec![
            Pad {
                id: "anode".into(),
                number: "1".into(),
                at: point(-2.0, 0.0),
                size: point(1.2, 1.4),
                shape: PadShape::Rect,
                drill: None,
                plated: None,
                side: None,
                rotation: None,
                net_id: None,
            },
            Pad {
                id: "cathode".into(),
                number: "2".into(),
                at: point(2.0, 0.0),
                size: point(1.2, 1.4),
                shape: PadShape::Rect,
                drill: None,
                plated: None,
                side: None,
                rotation: None,
                net_id: None,
            },
        ],
        courtyard: vec![
            point(-3.0, -1.5),
            point(3.0, -1.5),
            point(3.0, 1.5),
            point(-3.0, 1.5),
        ],
        traces: vec![],
        vias: vec![],
    }
}

fn rgb_geometry(params: &BTreeMap<String, Value>) -> Result<BuiltinGeometry, String> {
    let spacing = number_param(params, "padSpacing", 5.4)?;
    let width = number_param(params, "padSize", 1.1)?;
    let reversible = bool_param(params, "reversible", false)?;
    let include_copper = bool_param(params, "includeTracesVias", false)?;
    let pads = vec![
        pad("vdd", "1", spacing / 2.0, 0.7, width, None),
        pad("dout", "2", spacing / 2.0, -0.7, width, None),
        pad("gnd", "3", -spacing / 2.0, -0.7, width, None),
        pad("din", "4", -spacing / 2.0, 0.7, width, None),
    ];
    let mut traces = Vec::new();
    let mut vias = Vec::new();
    if reversible && include_copper {
        let trace_width = number_param(params, "traceWidth", 0.25)?;
        let via_size = number_param(params, "viaSize", 0.8)?;
        let via_drill = number_param(params, "viaDrill", 0.4)?;
        if via_drill >= via_size {
            return Err("Via drill must be smaller than via size".into());
        }
        for source in &pads {
            let at = point(source.at.x + source.at.x.signum() * 1.8, source.at.y);
            traces.push(LocalTrace {
                id: format!("route-{}", source.id),
                start: source.at,
                end: at,
                width: trace_width,
                pad_id: Some(source.id.clone()),
                layer: Side::Front,
            });
            vias.push(LocalVia {
                id: format!("via-{}", source.id),
                at,
                size: via_size,
                drill: via_drill,
                pad_id: Some(source.id.clone()),
            });
        }
    }
    Ok(BuiltinGeometry {
        pads,
        courtyard: box_courtyard(4.5),
        traces,
        vias,
    })
}

pub fn generate(
    source: &str,
    params: &BTreeMap<String, Value>,
) -> Result<Option<BuiltinGeometry>, String> {
    match source {
        "builtin:mx-switch" => switch_geometry("mx", false, params).map(Some),
        "builtin:choc-switch" => switch_geometry("choc", false, params).map(Some),
        "builtin:mx-hotswap" => switch_geometry("mx", true, params).map(Some),
        "builtin:choc-hotswap" => switch_geometry("choc", true, params).map(Some),
        "builtin:rgb-led" => rgb_geometry(params).map(Some),
        "builtin:matrix-diode" => Ok(Some(diode_geometry())),
        _ => Ok(None),
    }
}

pub fn builtin_definitions() -> Vec<PartDefinition> {
    [
        (
            "mx-switch",
            "MX switch",
            "builtin:mx-switch",
            PartKind::Switch,
        ),
        (
            "choc-switch",
            "Choc switch",
            "builtin:choc-switch",
            PartKind::Switch,
        ),
        (
            "mx-hotswap",
            "MX hotswap socket",
            "builtin:mx-hotswap",
            PartKind::Connector,
        ),
        (
            "choc-hotswap",
            "Choc hotswap socket",
            "builtin:choc-hotswap",
            PartKind::Connector,
        ),
        ("rgb-led", "RGB LED", "builtin:rgb-led", PartKind::Passive),
        (
            "matrix-diode",
            "Matrix diode",
            "builtin:matrix-diode",
            PartKind::Passive,
        ),
    ]
    .into_iter()
    .map(|(id, name, source, kind)| {
        let geometry = generate(source, &BTreeMap::new())
            .expect("built-in defaults validate")
            .expect("known built-in source");
        PartDefinition {
            id: id.into(),
            name: name.into(),
            kind,
            keycap: if id.ends_with("switch") {
                Some(point(18.0, 18.0))
            } else {
                None
            },
            envelope_source: None,
            kicad_source: None,
            terminals: BTreeMap::new(),
            matrix_terminals: None,
            envelope_notice: None,
            courtyard: geometry.courtyard,
            pads: geometry.pads,
            model: None,
            models: None,
            generator: Some(PartGenerator {
                source: source.into(),
                version: BUILTIN_VERSION.into(),
                parameters: BTreeMap::new(),
            }),
        }
    })
    .collect()
}
