use crate::artifact::builtins;
use crate::model::{CompiledFootprint, FootprintGeometry, PadShape, PartDefinition, Side, Vec2};
use serde_json::Value;
use std::collections::{BTreeMap, BTreeSet};

/// Compile the checked-in default library geometry for both board sides.
pub fn builtin_catalogue() -> Result<Vec<CompiledFootprint>, String> {
    let mut compiled = Vec::with_capacity(12);
    for definition in builtins::builtin_definitions() {
        for side in [Side::Front, Side::Back] {
            compiled.push(compile_builtin(&definition, &BTreeMap::new(), side)?);
        }
    }
    Ok(compiled)
}

/// Compile one authored or built-in footprint without process-local caching.
pub fn compile_builtin(
    definition: &PartDefinition,
    parameters: &BTreeMap<String, Value>,
    side: Side,
) -> Result<CompiledFootprint, String> {
    if definition.kicad_source.is_some() {
        return Err(format!(
            "Footprint '{}' has authoritative KiCad source and must use source projection",
            definition.id
        ));
    }

    let generated = if let Some(generator) = &definition.generator {
        if generator.source.starts_with("builtin:") {
            if generator.version != builtins::BUILTIN_VERSION {
                return Err(format!(
                    "Unsupported built-in footprint version: {}",
                    generator.version
                ));
            }
            let mut effective = generator.parameters.clone();
            effective.extend(parameters.clone());
            Some(
                builtins::generate(&generator.source, &effective)?
                    .ok_or_else(|| format!("Unknown built-in footprint: {}", generator.source))?,
            )
        } else {
            None
        }
    } else {
        None
    };

    let mut geometry = FootprintGeometry {
        side,
        courtyard: if definition
            .envelope_source
            .as_ref()
            .and_then(|source| source.courtyard)
            == Some(crate::model::EnvelopeOrigin::Authored)
        {
            definition.courtyard.clone()
        } else {
            generated
                .as_ref()
                .map(|geometry| geometry.courtyard.clone())
                .unwrap_or_else(|| definition.courtyard.clone())
        },
        pads: generated
            .as_ref()
            .map(|geometry| geometry.pads.clone())
            .unwrap_or_else(|| definition.pads.clone()),
        traces: generated
            .as_ref()
            .map(|geometry| geometry.traces.clone())
            .unwrap_or_default(),
        vias: generated
            .as_ref()
            .map(|geometry| geometry.vias.clone())
            .unwrap_or_default(),
    };
    for pad in &mut geometry.pads {
        pad.net_id = None;
    }
    validate_geometry(definition, &geometry)?;
    let preview_svg = Some(preview_svg(&geometry)?);
    Ok(CompiledFootprint {
        definition: definition.clone(),
        geometry,
        diagnostics: vec![],
        preview_svg,
    })
}

pub fn validate_geometry(
    definition: &PartDefinition,
    geometry: &FootprintGeometry,
) -> Result<(), String> {
    if geometry.courtyard.len() < 3 {
        return Err(format!(
            "Footprint {} needs a courtyard polygon",
            definition.id
        ));
    }
    if geometry.courtyard.iter().any(|point| !finite_point(*point)) {
        return Err(format!("Invalid courtyard coordinate: {}", definition.id));
    }

    let mut ids = BTreeSet::new();
    let mut numbers = BTreeSet::new();
    for pad in &geometry.pads {
        if !ids.insert(pad.id.as_str()) {
            return Err(format!("Duplicate footprint pad id: {}", pad.id));
        }
        if (pad.number.trim().is_empty() && pad.plated != Some(false))
            || (!pad.number.trim().is_empty() && !numbers.insert(pad.number.as_str()))
        {
            return Err(format!("Duplicate or empty pad number: {}", pad.number));
        }
        if !finite_point(pad.at)
            || !finite_point(pad.size)
            || pad.size.x <= 0.0
            || pad.size.y <= 0.0
            || pad
                .drill
                .is_some_and(|drill| !drill.is_finite() || drill <= 0.0)
            || pad.rotation.is_some_and(|rotation| !rotation.is_finite())
        {
            return Err(format!("Invalid pad geometry: {}", pad.id));
        }
    }

    for trace in &geometry.traces {
        if !finite_point(trace.start)
            || !finite_point(trace.end)
            || !trace.width.is_finite()
            || trace.width <= 0.0
            || trace
                .pad_id
                .as_ref()
                .is_some_and(|id| !ids.contains(id.as_str()))
        {
            return Err(format!("Invalid footprint trace: {}", trace.id));
        }
    }
    for via in &geometry.vias {
        if !finite_point(via.at)
            || !via.size.is_finite()
            || !via.drill.is_finite()
            || via.size <= 0.0
            || via.drill <= 0.0
            || via.drill >= via.size
            || via
                .pad_id
                .as_ref()
                .is_some_and(|id| !ids.contains(id.as_str()))
        {
            return Err(format!("Invalid footprint via: {}", via.id));
        }
    }
    Ok(())
}

pub fn preview_svg(geometry: &FootprintGeometry) -> Result<String, String> {
    validate_geometry_for_preview(geometry)?;
    let mut points = geometry.courtyard.clone();
    for pad in &geometry.pads {
        points.push(Vec2 {
            x: pad.at.x - pad.size.x / 2.0,
            y: pad.at.y - pad.size.y / 2.0,
        });
        points.push(Vec2 {
            x: pad.at.x + pad.size.x / 2.0,
            y: pad.at.y + pad.size.y / 2.0,
        });
    }
    for trace in &geometry.traces {
        points.extend([trace.start, trace.end]);
    }
    for via in &geometry.vias {
        points.push(Vec2 {
            x: via.at.x - via.size / 2.0,
            y: via.at.y - via.size / 2.0,
        });
        points.push(Vec2 {
            x: via.at.x + via.size / 2.0,
            y: via.at.y + via.size / 2.0,
        });
    }

    let min_x = points.iter().map(|point| point.x).fold(0.0_f64, f64::min) - 1.0;
    let max_x = points.iter().map(|point| point.x).fold(0.0_f64, f64::max) + 1.0;
    let min_y = points.iter().map(|point| point.y).fold(0.0_f64, f64::min) - 1.0;
    let max_y = points.iter().map(|point| point.y).fold(0.0_f64, f64::max) + 1.0;
    let courtyard = geometry
        .courtyard
        .iter()
        .map(|point| format!("{},{}", number(point.x), number(-point.y)))
        .collect::<Vec<_>>()
        .join(" ");
    let pads = geometry.pads.iter().map(|pad| {
        let x = pad.at.x - pad.size.x / 2.0;
        let y = -pad.at.y - pad.size.y / 2.0;
        let radius = match &pad.shape {
            PadShape::Circle => pad.size.x / 2.0,
            PadShape::Oval => pad.size.x.min(pad.size.y) / 2.0,
            PadShape::Roundrect => pad.size.x.min(pad.size.y) / 4.0,
            PadShape::Rect => 0.0,
        };
        format!(
            "<rect x=\"{}\" y=\"{}\" width=\"{}\" height=\"{}\" rx=\"{}\" fill=\"#bd8e52\"/><title>{}</title>",
            number(x), number(y), number(pad.size.x), number(pad.size.y), number(radius), escape_xml(&pad.number)
        )
    }).collect::<String>();
    let traces = geometry.traces.iter().map(|trace| format!(
        "<line x1=\"{}\" y1=\"{}\" x2=\"{}\" y2=\"{}\" stroke=\"#bd8e52\" stroke-width=\"{}\"/>",
        number(trace.start.x), number(-trace.start.y), number(trace.end.x), number(-trace.end.y), number(trace.width)
    )).collect::<String>();
    let vias = geometry.vias.iter().map(|via| format!(
        "<circle cx=\"{}\" cy=\"{}\" r=\"{}\" fill=\"none\" stroke=\"#bd8e52\" stroke-width=\"0.2\"/>",
        number(via.at.x), number(-via.at.y), number(via.size / 2.0)
    )).collect::<String>();
    Ok(format!(
        "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"{} {} {} {}\" role=\"img\" aria-label=\"Footprint preview\"><polygon points=\"{}\" fill=\"none\" stroke=\"#527d76\" stroke-width=\"0.2\"/>{traces}{vias}{pads}</svg>",
        number(min_x),
        number(-max_y),
        number(max_x - min_x),
        number(max_y - min_y),
        courtyard
    ))
}

fn validate_geometry_for_preview(geometry: &FootprintGeometry) -> Result<(), String> {
    if geometry.courtyard.len() < 3 || geometry.courtyard.iter().any(|point| !finite_point(*point))
    {
        return Err("Footprint preview needs a finite courtyard polygon".into());
    }
    if geometry.pads.iter().any(|pad| {
        !finite_point(pad.at) || !finite_point(pad.size) || pad.size.x <= 0.0 || pad.size.y <= 0.0
    }) || geometry.traces.iter().any(|trace| {
        !finite_point(trace.start)
            || !finite_point(trace.end)
            || !trace.width.is_finite()
            || trace.width <= 0.0
    }) || geometry
        .vias
        .iter()
        .any(|via| !finite_point(via.at) || !via.size.is_finite() || via.size <= 0.0)
    {
        return Err("Footprint preview contains invalid geometry".into());
    }
    Ok(())
}

fn finite_point(point: Vec2) -> bool {
    point.x.is_finite() && point.y.is_finite()
}

fn number(value: f64) -> String {
    if value == 0.0 {
        "0".into()
    } else {
        value.to_string()
    }
}

fn escape_xml(value: &str) -> String {
    value
        .chars()
        .map(|character| match character {
            '&' => "&amp;".to_owned(),
            '<' => "&lt;".to_owned(),
            '>' => "&gt;".to_owned(),
            '"' => "&quot;".to_owned(),
            '\'' => "&apos;".to_owned(),
            _ => character.to_string(),
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::artifact::builtins::builtin_definitions;
    use crate::model::{EnvelopeOrigin, EnvelopeSource, PartKind, Vec2};

    fn params(entries: &[(&str, Value)]) -> BTreeMap<String, Value> {
        entries
            .iter()
            .map(|(key, value)| ((*key).into(), value.clone()))
            .collect()
    }

    fn definition(source: &str) -> PartDefinition {
        builtin_definitions()
            .into_iter()
            .find(|definition| {
                definition
                    .generator
                    .as_ref()
                    .is_some_and(|generator| generator.source == source)
            })
            .unwrap()
    }

    #[test]
    fn builtins_compile_with_defaults_and_repeat_without_cache_state() {
        let ids = builtin_definitions()
            .into_iter()
            .map(|definition| definition.id)
            .collect::<Vec<_>>();
        assert_eq!(
            ids,
            [
                "mx-switch",
                "choc-switch",
                "mx-hotswap",
                "choc-hotswap",
                "rgb-led",
                "matrix-diode"
            ]
        );
        let definition = definition("builtin:rgb-led");
        for compiled in builtin_catalogue().unwrap() {
            assert!(compiled.preview_svg.as_deref().unwrap().starts_with("<svg"));
        }
        let first = compile_builtin(&definition, &BTreeMap::new(), Side::Front).unwrap();
        let second = compile_builtin(&definition, &BTreeMap::new(), Side::Front).unwrap();
        assert_eq!(first, second);
        assert_eq!(first.geometry.pads.len(), 4);
        assert_eq!(first.geometry.side, Side::Front);
        assert!(first.preview_svg.as_deref().unwrap().starts_with("<svg"));
    }

    #[test]
    fn builtin_parameters_override_generator_defaults() {
        let definition = definition("builtin:rgb-led");
        let defaults = compile_builtin(&definition, &BTreeMap::new(), Side::Front).unwrap();
        assert_eq!(defaults.geometry.pads[0].at.x, 2.7);
        let customized = compile_builtin(
            &definition,
            &params(&[
                ("padSpacing", Value::from(6.0)),
                ("padSize", Value::from(1.25)),
            ]),
            Side::Back,
        )
        .unwrap();
        assert_eq!(customized.geometry.side, Side::Back);
        assert_eq!(customized.geometry.pads[0].at.x, 3.0);
        assert_eq!(customized.geometry.pads[0].size.x, 1.25);
    }

    #[test]
    fn generated_builtin_geometry_preserves_an_authored_courtyard() {
        let mut definition = definition("builtin:mx-hotswap");
        let authored = vec![
            Vec2 { x: -11.0, y: -8.0 },
            Vec2 { x: 9.0, y: -8.0 },
            Vec2 { x: 12.0, y: 0.0 },
            Vec2 { x: 9.0, y: 8.0 },
            Vec2 { x: -11.0, y: 8.0 },
        ];
        definition.courtyard = authored.clone();
        definition.envelope_source = Some(EnvelopeSource {
            courtyard: Some(EnvelopeOrigin::Authored),
            keycap: None,
        });
        let compiled = compile_builtin(
            &definition,
            &params(&[
                ("reversible", Value::Bool(true)),
                ("includeTracesVias", Value::Bool(true)),
            ]),
            Side::Front,
        )
        .unwrap();

        assert_eq!(compiled.geometry.courtyard, authored);
        assert_eq!(compiled.geometry.pads.len(), 7);
        assert_eq!(compiled.geometry.traces.len(), 2);
        assert_eq!(compiled.geometry.vias.len(), 2);
        assert_eq!(compiled.geometry.pads[0].shape, PadShape::Rect);
    }

    #[test]
    fn reversible_settings_generate_front_traces_and_vias_on_supported_builtins() {
        let definition = definition("builtin:mx-hotswap");
        let geometry = compile_builtin(
            &definition,
            &params(&[
                ("reversible", Value::Bool(true)),
                ("includeTracesVias", Value::Bool(true)),
            ]),
            Side::Back,
        )
        .unwrap()
        .geometry;
        assert_eq!(geometry.side, Side::Back);
        assert_eq!(geometry.traces.len(), 2);
        assert_eq!(geometry.vias.len(), 2);
        assert!(
            geometry
                .traces
                .iter()
                .all(|trace| trace.layer == Side::Front)
        );
        assert!(geometry.traces.iter().all(|trace| trace.pad_id.is_some()));
    }

    #[test]
    fn rgb_reversible_copper_and_via_dimensions_follow_parameters() {
        let definition = definition("builtin:rgb-led");
        let geometry = compile_builtin(
            &definition,
            &params(&[
                ("reversible", Value::Bool(true)),
                ("includeTracesVias", Value::Bool(true)),
                ("traceWidth", Value::from(0.3)),
                ("viaSize", Value::from(0.8)),
                ("viaDrill", Value::from(0.4)),
            ]),
            Side::Front,
        )
        .unwrap()
        .geometry;
        assert_eq!(geometry.traces.len(), 4);
        assert_eq!(geometry.vias.len(), 4);
        assert!(geometry.traces.iter().all(|trace| trace.width == 0.3));
        assert!(
            geometry
                .vias
                .iter()
                .all(|via| via.size == 0.8 && via.drill == 0.4)
        );
    }

    #[test]
    fn mechanical_holes_are_unplated_and_empty_numbered() {
        for source in ["builtin:mx-switch", "builtin:choc-hotswap"] {
            let geometry = compile_builtin(&definition(source), &BTreeMap::new(), Side::Front)
                .unwrap()
                .geometry;
            assert!(
                geometry
                    .pads
                    .iter()
                    .filter(|pad| pad.plated == Some(false))
                    .all(|pad| pad.number.is_empty() && pad.drill.is_some())
            );
        }
    }

    #[test]
    fn rejects_invalid_builtin_parameters_and_source_authoritative_definitions() {
        let mx = definition("builtin:mx-switch");
        assert!(
            compile_builtin(
                &mx,
                &params(&[("padSpacing", Value::String("wide".into()))]),
                Side::Front
            )
            .unwrap_err()
            .contains("Invalid padSpacing")
        );
        let bad_hole = definition("builtin:mx-switch");
        assert!(
            compile_builtin(
                &bad_hole,
                &params(&[("padSpacing", Value::from(1.0))]),
                Side::Front
            )
            .unwrap_err()
            .contains("overlaps mounting hole")
        );
        let mut source = mx;
        source.kicad_source = Some(crate::model::KicadSource {
            format_version: 1,
            source: "(footprint)".into(),
        });
        assert!(
            compile_builtin(&source, &BTreeMap::new(), Side::Front)
                .unwrap_err()
                .contains("authoritative KiCad source")
        );
        let choc = definition("builtin:choc-hotswap");
        assert!(
            compile_builtin(
                &choc,
                &params(&[
                    ("reversible", Value::Bool(true)),
                    ("includeTracesVias", Value::Bool(true)),
                    ("viaSize", Value::from(0.4)),
                    ("viaDrill", Value::from(0.4)),
                ]),
                Side::Front,
            )
            .unwrap_err()
            .contains("Via drill must be smaller")
        );
    }

    #[test]
    fn preview_svg_matches_expected_orientation_and_escapes_pad_numbers() {
        let mut definition = definition("builtin:matrix-diode");
        definition.generator = None;
        definition.pads[0].number = "1<&".into();
        let output = compile_builtin(&definition, &BTreeMap::new(), Side::Back).unwrap();
        let svg = output.preview_svg.unwrap();
        assert!(svg.contains("viewBox=\"-4 -2.5 8 5\""));
        assert!(svg.contains("<polygon points=\"-3,1.5 3,1.5 3,-1.5 -3,-1.5\""));
        assert!(svg.contains("<title>1&lt;&amp;</title>"));
    }

    #[test]
    fn net_label_changes_do_not_change_compiled_geometry() {
        let mut definition = definition("builtin:matrix-diode");
        let without_net = compile_builtin(&definition, &BTreeMap::new(), Side::Front)
            .unwrap()
            .geometry;
        definition.pads[0].net_id = Some("row".into());
        let with_net = compile_builtin(&definition, &BTreeMap::new(), Side::Front)
            .unwrap()
            .geometry;
        assert_eq!(without_net, with_net);
    }

    #[test]
    fn arbitrary_authored_geometry_can_be_compiled_without_builtin_generator() {
        let mut definition = definition("builtin:matrix-diode");
        definition.generator = None;
        definition.courtyard = vec![
            Vec2 { x: -4.0, y: -4.0 },
            Vec2 { x: 4.0, y: -4.0 },
            Vec2 { x: 4.0, y: 4.0 },
        ];
        assert!(compile_builtin(&definition, &BTreeMap::new(), Side::Back).is_ok());
        assert_eq!(PartKind::Passive, definition.kind);
    }
}
