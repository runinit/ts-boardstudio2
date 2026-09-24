use super::{ArtifactError, ArtifactErrorCode, sexpr};
use crate::artifact::{compile, source};
use crate::model::*;
use kiutils_sexpr::{Atom, CstDocument, Node};
use std::collections::{BTreeMap, HashMap, HashSet};

const FILE_VERSION: u32 = 20241229;
const EDGE_WIDTH: f64 = 0.05;
const COURTYARD_WIDTH: f64 = 0.05;
const TEXT_STROKE: f64 = 0.15;
const TEXT_SIZE: f64 = 1.0;
const MAX_COORD: f64 = 1_000_000.0;

fn err(code: ArtifactErrorCode, message: impl Into<String>) -> ArtifactError {
    ArtifactError::new(code, message)
}

fn validation(message: impl Into<String>) -> ArtifactError {
    err(ArtifactErrorCode::Validation, message)
}

fn num(value: f64) -> Result<String, ArtifactError> {
    if !value.is_finite() || value.abs() > MAX_COORD {
        return Err(validation(format!("Invalid KiCad coordinate: {value}")));
    }
    let rounded = format!("{value:.6}")
        .parse::<f64>()
        .map_err(|_| validation(format!("Invalid KiCad coordinate: {value}")))?;
    if rounded == 0.0 {
        return Ok("0".into());
    }
    Ok(rounded.to_string())
}

fn q(value: &str) -> Result<String, ArtifactError> {
    if value.chars().any(|character| character <= '\u{1f}') {
        return Err(validation("KiCad text contains a control character"));
    }
    Ok(sexpr::quote(value))
}

fn xy(point: Vec2) -> Result<String, ArtifactError> {
    Ok(format!("{} {}", num(point.x)?, num(-point.y)?))
}

fn xy_side(point: Vec2, back: bool) -> Result<String, ArtifactError> {
    Ok(format!(
        "{} {}",
        num(point.x)?,
        num(if back { point.y } else { -point.y })?
    ))
}

fn safe_name(value: &str) -> String {
    let mut out = String::new();
    let mut replacing = false;
    for ch in value.chars() {
        let valid = ch.is_ascii_alphanumeric() || matches!(ch, '.' | '_' | '-');
        if valid {
            out.push(ch);
            replacing = false;
        } else if !replacing {
            out.push('_');
            replacing = true;
        }
    }
    while out.starts_with('.') {
        out.remove(0);
    }
    out.truncate(
        out.char_indices()
            .nth(80)
            .map_or(out.len(), |(index, _)| index),
    );
    if out.is_empty() { "board".into() } else { out }
}

// Keep object identities stable and byte-compatible with the TS FNV-style UUID.
fn uuid(value: &str) -> String {
    let mut words = [0x811c9dc5_u32, 0x91f832ec, 0xd1f5ab43, 0x67ed3a21];
    for character in value.chars() {
        let code = character as u32;
        for (index, word) in words.iter_mut().enumerate() {
            *word = (*word ^ code.wrapping_add(index as u32)).wrapping_mul(0x01000193);
        }
    }
    let hex = words
        .iter()
        .map(|word| format!("{word:08x}"))
        .collect::<String>();
    format!(
        "{}-{}-5{}-a{}-{}",
        &hex[0..8],
        &hex[8..12],
        &hex[13..16],
        &hex[17..20],
        &hex[20..32]
    )
}

fn uuid_text(scope: &str, kind: &str, id: &str) -> Result<String, ArtifactError> {
    q(&uuid(&format!("{scope}:{kind}:{id}")))
}

fn render(form: &str) -> Result<String, ArtifactError> {
    source::render_form(form)
}

fn unique_ids<'a>(
    ids: impl IntoIterator<Item = &'a str>,
    label: &str,
) -> Result<(), ArtifactError> {
    let mut seen = HashSet::new();
    for id in ids {
        if id.is_empty() || !seen.insert(id) {
            return Err(validation(format!("Duplicate or empty {label} ID: {id}")));
        }
    }
    Ok(())
}

fn point_valid(point: Vec2) -> bool {
    point.x.is_finite() && point.y.is_finite()
}

fn assert_geometry(geometry: &FootprintGeometry) -> Result<(), ArtifactError> {
    unique_ids(geometry.pads.iter().map(|pad| pad.id.as_str()), "pad")?;
    let mut numbers = HashSet::new();
    for pad in &geometry.pads {
        if (!pad.number.trim().is_empty() && !numbers.insert(pad.number.as_str()))
            || (pad.number.trim().is_empty() && pad.plated != Some(false))
        {
            return Err(validation(format!(
                "Duplicate or empty pad number: {}",
                pad.number
            )));
        }
        if !point_valid(pad.at)
            || !point_valid(pad.size)
            || pad.size.x <= 0.0
            || pad.size.y <= 0.0
            || pad
                .drill
                .is_some_and(|drill| !drill.is_finite() || drill <= 0.0)
        {
            return Err(validation(format!("Invalid pad geometry: {}", pad.id)));
        }
    }
    if geometry.courtyard.iter().any(|point| !point_valid(*point)) {
        return Err(validation("Invalid courtyard coordinate"));
    }
    Ok(())
}

fn pad_form(
    pad: &Pad,
    net: Option<&ReservedNet>,
    scope: &str,
    back: bool,
    root_rotation: f64,
) -> Result<String, ArtifactError> {
    let through = pad.drill.is_some();
    let pad_type = if through {
        if pad.plated == Some(false) {
            "np_thru_hole"
        } else {
            "thru_hole"
        }
    } else {
        "smd"
    };
    let layers = if pad.plated == Some(false) {
        "\"*.Cu\" \"*.Mask\""
    } else if through {
        "\"*.Cu\" \"*.Mask\""
    } else if pad
        .side
        .as_ref()
        .is_some_and(|side| matches!(side, Side::Back))
        || (pad.side.is_none() && back)
    {
        "\"B.Cu\" \"B.Paste\" \"B.Mask\""
    } else {
        "\"F.Cu\" \"F.Paste\" \"F.Mask\""
    };
    let local_rotation = pad.rotation.unwrap_or(0.0);
    let absolute_rotation = if back {
        root_rotation + 360.0 - local_rotation
    } else {
        root_rotation + local_rotation
    };
    let rotation = if absolute_rotation == 0.0 {
        String::new()
    } else {
        format!(" {}", num(absolute_rotation)?)
    };
    let drill = pad
        .drill
        .map(num)
        .transpose()?
        .map(|value| format!(" (drill {value})"))
        .unwrap_or_default();
    let roundrect = if matches!(pad.shape, PadShape::Roundrect) {
        " (roundrect_rratio 0.25)"
    } else {
        ""
    };
    let net = net
        .map(|net| Ok(format!(" (net {} {})", net.index, q(&net.name)?)))
        .transpose()?
        .unwrap_or_default();
    render(&format!(
        "(pad {} {pad_type} {} (at {}{rotation}) (size {} {}){drill} (layers {layers}){roundrect}{net} (uuid {}))",
        q(&pad.number)?,
        shape_name(&pad.shape),
        xy_side(pad.at, back)?,
        num(pad.size.x)?,
        num(pad.size.y)?,
        uuid_text(scope, "pad", &pad.id)?
    ))
}

fn shape_name(shape: &PadShape) -> &'static str {
    match shape {
        PadShape::Circle => "circle",
        PadShape::Oval => "oval",
        PadShape::Rect => "rect",
        PadShape::Roundrect => "roundrect",
    }
}

fn model_forms(
    definition: &PartDefinition,
    models: &BTreeMap<String, String>,
) -> Result<Vec<String>, ArtifactError> {
    let model_list = definition
        .model
        .iter()
        .chain(definition.models.iter().flatten());
    model_list
        .map(|model| {
            let path = models.get(&model.asset_id).ok_or_else(|| {
                validation(format!(
                    "Model {} needs a safe relative path",
                    model.asset_id
                ))
            })?;
            if !safe_model_path(path) {
                return Err(validation(format!(
                    "Model {} needs a safe relative path",
                    model.asset_id
                )));
            }
            render(&format!(
                "(model {} (offset (xyz {} {} {})) (scale (xyz {} {} {})) (rotate (xyz {} {} {})))",
                q(&format!("${{KIPRJMOD}}/{path}"))?,
                num(model.offset.x)?,
                num(-model.offset.y)?,
                num(model.offset.z)?,
                num(model.scale.x)?,
                num(model.scale.y)?,
                num(model.scale.z)?,
                num(model.rotation.x)?,
                num(model.rotation.y)?,
                num(-model.rotation.z)?
            ))
        })
        .collect()
}

fn managed_model_forms(
    definition: &PartDefinition,
    models: &BTreeMap<String, String>,
) -> Result<Vec<String>, ArtifactError> {
    model_forms(definition, models)
}

fn safe_model_path(path: &str) -> bool {
    !path.is_empty()
        && !path.starts_with('/')
        && !path.contains("..")
        && !path.contains('\\')
        && !path.starts_with("${")
        && !path.contains(':')
}

fn courtyard_forms(points: &[Vec2], scope: &str, back: bool) -> Result<Vec<String>, ArtifactError> {
    if points.len() < 3 {
        return Err(validation(format!(
            "Footprint {scope} needs a courtyard polygon"
        )));
    }
    let layer = if back { "B.CrtYd" } else { "F.CrtYd" };
    (0..points.len()).map(|index| {
        let start = points[index];
        let end = points[(index + 1) % points.len()];
        render(&format!("(fp_line (start {}) (end {}) (stroke (width {}) (type solid)) (layer {}) (uuid {}))",
                xy_side(start, back)?, xy_side(end, back)?, num(COURTYARD_WIDTH)?, q(layer)?, uuid_text(scope, "courtyard", &index.to_string())?))
    }).collect()
}

fn native_footprint(
    definition: &PartDefinition,
    scope: &str,
    part: Option<&Part>,
    nets: &BTreeMap<String, ReservedNet>,
    model_paths: &BTreeMap<String, String>,
) -> Result<String, ArtifactError> {
    let job = FootprintCompileJob {
        id: definition.id.clone(),
        definition: definition.clone(),
        parameters: BTreeMap::new(),
        side: part.map_or(Side::Front, |part| part.side.clone()),
    };
    let compiled =
        compile::compile_builtin(&job.definition, &job.parameters, job.side).map_err(validation)?;
    let geometry = &compiled.geometry;
    assert_geometry(geometry)?;
    let back = matches!(geometry.side, Side::Back);
    let layer = if back { "B.Cu" } else { "F.Cu" };
    let reference_layer = if back { "B.SilkS" } else { "F.SilkS" };
    let fab_layer = if back { "B.Fab" } else { "F.Fab" };
    let name = safe_name(&definition.name);
    let root_rotation = part.map_or(0.0, |part| {
        if back {
            part.pose.rotation - 180.0
        } else {
            part.pose.rotation
        }
    });
    let placement = part
        .map(|part| {
            Ok(format!(
                " (at {} {})",
                xy(part.pose.at)?,
                num(root_rotation)?
            ))
        })
        .transpose()?
        .unwrap_or_default();
    let reference = part
        .map(|part| part.reference.as_str())
        .filter(|value| !value.is_empty())
        .unwrap_or("REF**");
    let reference_y = geometry
        .courtyard
        .iter()
        .map(|point| point.y.abs())
        .fold(0.0_f64, f64::max)
        + 2.0;
    let mirror = if back { " (justify mirror)" } else { "" };
    let hide = definition.generator.as_ref().is_some_and(|generator| {
        matches!(
            generator.source.as_str(),
            "builtin:rgb-led" | "builtin:matrix-diode"
        )
    });
    let hide = if hide { " (hide yes)" } else { "" };
    let mut forms = vec![render(&format!(
        "(property \"Reference\" {} (at 0 {} 0) (layer {}){hide} (effects (font (size {} {}) (thickness {})){mirror}))",
        q(reference)?,
        num(reference_y)?,
        q(reference_layer)?,
        num(TEXT_SIZE)?,
        num(TEXT_SIZE)?,
        num(TEXT_STROKE)?
    ))?];
    forms.push(render(&format!("(property \"Value\" {} (at 0 -2 0) (layer {}) (effects (font (size {} {}) (thickness {})){mirror}))",
        q(&definition.name)?, q(fab_layer)?, num(TEXT_SIZE)?, num(TEXT_SIZE)?, num(TEXT_STROKE)?))?);
    forms.extend(courtyard_forms(&geometry.courtyard, scope, back)?);
    for pad in &geometry.pads {
        let net = nets.get(&pad.id);
        forms.push(pad_form(pad, net, scope, back, root_rotation)?);
    }
    if part.is_none() {
        unique_ids(
            geometry
                .traces
                .iter()
                .map(|item| item.id.as_str())
                .chain(geometry.vias.iter().map(|item| item.id.as_str())),
            "copper",
        )?;
        for trace in &geometry.traces {
            let layer = if matches!(trace.layer, Side::Back) {
                "B.Cu"
            } else {
                "F.Cu"
            };
            forms.push(render(&format!(
                "(fp_line (start {}) (end {}) (stroke (width {}) (type solid)) (layer {}) (uuid {}))",
                xy_side(trace.start, back)?, xy_side(trace.end, back)?, num(trace.width)?, q(layer)?,
                uuid_text(scope, "trace", &trace.id)?
            ))?);
        }
        for via in &geometry.vias {
            let source_pad = geometry
                .pads
                .iter()
                .find(|pad| pad.id == via.pad_id.as_deref().unwrap_or_default())
                .ok_or_else(|| validation(format!("Via {} references missing pad", via.id)))?;
            forms.push(pad_form(
                &Pad {
                    id: via.id.clone(),
                    number: source_pad.number.clone(),
                    at: via.at,
                    size: Vec2 {
                        x: via.size,
                        y: via.size,
                    },
                    shape: PadShape::Circle,
                    drill: Some(via.drill),
                    plated: None,
                    side: None,
                    rotation: None,
                    net_id: None,
                },
                None,
                scope,
                false,
                root_rotation,
            )?);
        }
    }
    let models = model_forms(definition, model_paths)?;
    forms.extend(models);
    let uuid = q(&uuid(scope))?;
    let body = forms.join(" ");
    render(&format!(
        "(footprint {} (layer {}){placement} (uuid {uuid}) {body})",
        q(&name)?,
        q(layer)?
    ))
}

fn is_ergogen(definition: &PartDefinition) -> bool {
    definition.generator.as_ref().is_some_and(|generator| {
        generator.source.starts_with("ceoloide/")
            || generator.source.starts_with("infused-kim/")
            || generator.source.starts_with("ergogen/")
    })
}

fn is_imported(definition: &PartDefinition) -> bool {
    definition.kicad_source.is_some()
}

fn net_by_id<'a>(nets: &'a [Net], id: &str) -> Option<&'a Net> {
    nets.iter().find(|net| net.id == id)
}

fn board_and_maps<'a>(
    doc: &'a ProjectDoc,
    board_id: &str,
) -> Result<
    (
        &'a Board,
        HashMap<&'a str, &'a Part>,
        HashMap<&'a str, &'a PartDefinition>,
    ),
    ArtifactError,
> {
    let board = doc
        .boards
        .iter()
        .find(|board| board.id == board_id)
        .ok_or_else(|| {
            err(
                ArtifactErrorCode::NotFound,
                format!("Missing board: {board_id}"),
            )
        })?;
    if !board.thickness.is_finite() || board.thickness <= 0.0 {
        return Err(validation(format!(
            "Missing board or invalid thickness: {board_id}"
        )));
    }
    unique_ids(
        doc.definitions.iter().map(|item| item.id.as_str()),
        "definition",
    )?;
    unique_ids(doc.parts.iter().map(|item| item.id.as_str()), "part")?;
    unique_ids(doc.nets.iter().map(|item| item.id.as_str()), "net")?;
    let parts = doc
        .parts
        .iter()
        .map(|part| (part.id.as_str(), part))
        .collect();
    let definitions = doc
        .definitions
        .iter()
        .map(|definition| (definition.id.as_str(), definition))
        .collect();
    Ok((board, parts, definitions))
}

fn net_lookup(
    doc: &ProjectDoc,
    board: &Board,
) -> Result<(Vec<ReservedNet>, HashMap<String, String>), ArtifactError> {
    let mut nets = Vec::new();
    let mut pin_map = HashMap::new();
    for (index, net_id) in board.net_ids.iter().enumerate() {
        let net = net_by_id(&doc.nets, net_id)
            .ok_or_else(|| validation(format!("Board references missing net {net_id}")))?;
        let reserved = ReservedNet {
            name: net.name.clone(),
            index: (index + 1) as u32,
        };
        nets.push(reserved);
        for pin in &net.pins {
            if !board.part_ids.iter().any(|part_id| part_id == &pin.part_id) {
                return Err(validation(format!(
                    "Net {} references part outside board: {}",
                    net.id, pin.part_id
                )));
            }
            let key = format!("{}\0{}", pin.part_id, pin.pad_id);
            if pin_map
                .insert(key.clone(), net.id.clone())
                .is_some_and(|old| old != net.id)
            {
                return Err(validation(format!(
                    "Pad {} belongs to two nets",
                    pin.pad_id
                )));
            }
        }
    }
    Ok((nets, pin_map))
}

fn terminal_parameters(
    definition: &PartDefinition,
    part: &Part,
    doc: &ProjectDoc,
    board: &Board,
    pin_map: &HashMap<String, String>,
) -> Result<Part, ArtifactError> {
    let mut part = part.clone();
    let mut parameters = part.generator_parameters.take().unwrap_or_default();
    let mut consumed = HashSet::new();
    for (terminal, pads) in &definition.terminals {
        let assigned = pads
            .iter()
            .filter_map(|pad| pin_map.get(&format!("{}\0{}", part.id, pad)))
            .collect::<HashSet<_>>();
        if assigned.len() > 1 {
            return Err(validation(format!(
                "Terminal {}/{} has conflicting pad net assignments",
                part.id, terminal
            )));
        }
        let current = parameters.get(terminal).or_else(|| {
            definition
                .generator
                .as_ref()
                .and_then(|generator| generator.parameters.get(terminal))
        });
        let explicit = current
            .and_then(serde_json::Value::as_str)
            .filter(|name| !name.trim().is_empty());
        let explicit_net = explicit
            .map(|name| {
                let matches = board
                    .net_ids
                    .iter()
                    .filter_map(|id| net_by_id(&doc.nets, id))
                    .filter(|net| net.name == name)
                    .collect::<Vec<_>>();
                match matches.as_slice() {
                    [net] => Ok(Some(*net)),
                    [] => Err(validation(format!(
                        "Terminal {}/{} references a net outside board: {name}",
                        part.id, terminal
                    ))),
                    _ => Err(validation(format!(
                        "Net name is ambiguous on board: {name}"
                    ))),
                }
            })
            .transpose()?
            .flatten();
        let assigned_net = assigned
            .iter()
            .next()
            .copied()
            .and_then(|id| doc.nets.iter().find(|net| net.id == *id));
        if explicit_net
            .is_some_and(|explicit| assigned_net.is_some_and(|assigned| explicit.id != assigned.id))
        {
            return Err(validation(format!(
                "Terminal {}/{} has conflicting explicit and document net assignments",
                part.id, terminal
            )));
        }
        let effective = assigned_net.or(explicit_net);
        if let Some(net) = effective {
            parameters.insert(
                terminal.clone(),
                serde_json::Value::String(net.name.clone()),
            );
        }
        consumed.extend(pads.iter().map(|pad| format!("{}\0{}", part.id, pad)));
    }
    for key in pin_map
        .keys()
        .filter(|key| key.starts_with(&format!("{}\0", part.id)))
    {
        if !consumed.contains(key) {
            return Err(validation(format!(
                "Net references an unmappable Ergogen pad on part {}",
                part.id
            )));
        }
    }
    part.generator_parameters = Some(parameters);
    Ok(part)
}

fn validate_plan(plan: &ExportPlan) -> Result<(), ArtifactError> {
    if plan.snapshot_token.is_empty() || plan.revision != plan.captured_document.revision {
        return Err(err(
            ArtifactErrorCode::StaleResult,
            "Export plan does not match its captured revision",
        ));
    }
    if plan.captured_document.format != "boardstudio/v2" {
        return Err(validation("Export requires a v2 document"));
    }
    unique_ids(
        plan.jobs.iter().map(|job| job.job_id.as_str()),
        "Ergogen job",
    )?;
    let mut indexes = HashSet::new();
    for net in &plan.reserved_nets {
        if net.index == 0 || !indexes.insert(net.index) {
            return Err(validation("Invalid reserved net table"));
        }
    }
    if plan.next_net_index
        != plan
            .reserved_nets
            .iter()
            .map(|net| net.index)
            .max()
            .unwrap_or(0)
            + 1
    {
        return Err(validation("Invalid net allocator state"));
    }
    if plan.fingerprint != plan_fingerprint(plan)? {
        return Err(err(
            ArtifactErrorCode::MismatchedResults,
            "Export plan snapshot was modified",
        ));
    }
    Ok(())
}

fn plan_fingerprint(plan: &ExportPlan) -> Result<String, ArtifactError> {
    let canonical = serde_json::to_vec(&(
        &plan.snapshot_token,
        plan.revision,
        &plan.target,
        &plan.jobs,
        &plan.reserved_nets,
        plan.next_net_index,
        &plan.contours,
        &plan.captured_document,
        &plan.model_paths,
    ))
    .map_err(|error| err(ArtifactErrorCode::Internal, error.to_string()))?;
    let mut hash = 0xcbf29ce484222325_u64;
    for byte in canonical {
        hash = (hash ^ u64::from(byte)).wrapping_mul(0x100000001b3);
    }
    Ok(format!("{hash:016x}"))
}

pub fn prepare_export(request: PrepareExportRequest) -> Result<ExportPlan, ArtifactError> {
    let doc = &request.document;
    if doc.format != "boardstudio/v2" {
        return Err(validation("Export requires a v2 document"));
    }
    for definition in &doc.definitions {
        super::validate_source_version(definition)?;
    }
    if request.expected_revision != doc.revision {
        return Err(err(
            ArtifactErrorCode::StaleResult,
            "Export requires a committed current v2 revision",
        ));
    }
    let (jobs, reserved_nets, next_net_index) = match &request.target {
        ExportTarget::Board { board_id } => {
            if doc.revision == u64::MAX {
                return Err(validation("Invalid document revision"));
            }
            let (board, parts, definitions) = board_and_maps(doc, board_id)?;
            let (net_table, pin_map) = net_lookup(doc, board)?;
            let mut jobs = Vec::new();
            for part_id in &board.part_ids {
                let part = parts
                    .get(part_id.as_str())
                    .ok_or_else(|| validation(format!("Missing part or definition: {part_id}")))?;
                let definition = definitions
                    .get(part.definition_id.as_str())
                    .ok_or_else(|| validation(format!("Missing part or definition: {part_id}")))?;
                if is_ergogen(definition) {
                    jobs.push(ErgogenJob {
                        job_id: format!("{}:{}", board.id, part.id),
                        definition: (*definition).clone(),
                        part: terminal_parameters(definition, part, doc, board, &pin_map)?,
                    });
                } else if is_imported(definition) {
                    // Validate imports before workers start; raw source is retained in the captured document.
                    source::import_footprint(
                        &definition.kicad_source.as_ref().expect("checked").source,
                        &definition.id,
                    )?;
                } else {
                    let compiled =
                        compile::compile_builtin(definition, &BTreeMap::new(), part.side.clone())
                            .map_err(|message| validation(message))?;
                    assert_geometry(&compiled.geometry)?;
                }
            }
            validate_contours(&request.contours)?;
            let next = net_table.iter().map(|net| net.index).max().unwrap_or(0) + 1;
            (jobs, net_table, next)
        }
        ExportTarget::StandaloneFootprints { definition_ids } => {
            if definition_ids.is_empty() {
                return Err(validation("No footprint definitions selected"));
            }
            let defs = doc
                .definitions
                .iter()
                .map(|definition| (definition.id.as_str(), definition))
                .collect::<HashMap<_, _>>();
            unique_ids(definition_ids.iter().map(String::as_str), "definition")?;
            let mut jobs = Vec::new();
            for id in definition_ids {
                let definition = defs.get(id.as_str()).ok_or_else(|| {
                    err(
                        ArtifactErrorCode::NotFound,
                        format!("Missing definition: {id}"),
                    )
                })?;
                if is_ergogen(definition) {
                    jobs.push(ErgogenJob {
                        job_id: format!("definition:{}", definition.id),
                        definition: (*definition).clone(),
                        part: standalone_part(definition),
                    });
                } else if is_imported(definition) {
                    source::import_footprint(
                        &definition.kicad_source.as_ref().expect("checked").source,
                        &definition.id,
                    )?;
                } else {
                    let compiled =
                        compile::compile_builtin(definition, &BTreeMap::new(), Side::Front)
                            .map_err(|message| validation(message))?;
                    assert_geometry(&compiled.geometry)?;
                }
            }
            (jobs, vec![], 1)
        }
    };
    let mut plan = ExportPlan {
        snapshot_token: request.snapshot_token.clone(),
        fingerprint: String::new(),
        revision: doc.revision,
        target: request.target.clone(),
        jobs,
        reserved_nets,
        next_net_index,
        contours: request.contours.clone(),
        captured_document: doc.clone(),
        model_paths: request.model_paths.clone(),
    };
    plan.fingerprint = plan_fingerprint(&plan)?;
    validate_plan(&plan)?;
    Ok(plan)
}

fn standalone_part(definition: &PartDefinition) -> Part {
    Part {
        id: format!("definition:{}", definition.id),
        definition_id: definition.id.clone(),
        reference: "REF**".into(),
        pose: Pose2 {
            at: Vec2::default(),
            rotation: 0.0,
        },
        side: Side::Front,
        keycap: None,
        outline: None,
        locked: None,
        properties: None,
        generator_parameters: Some(
            definition
                .generator
                .as_ref()
                .map(|g| g.parameters.clone())
                .unwrap_or_default(),
        ),
    }
}

fn validate_contours(contours: &[Contour]) -> Result<(), ArtifactError> {
    if contours.is_empty() {
        return Err(validation("Board outline has no resolved contours"));
    }
    if contours.iter().any(|contour| {
        contour.points.len() < 3 || contour.points.iter().any(|point| !point_valid(*point))
    }) {
        return Err(validation(
            "Board contour needs at least three finite points",
        ));
    }
    Ok(())
}

pub fn finish_export(request: FinishExportRequest) -> Result<ExportArtifact, ArtifactError> {
    let plan = request.plan;
    validate_plan(&plan)?;
    if request.results.len() != plan.jobs.len() {
        return Err(err(
            ArtifactErrorCode::MismatchedResults,
            "Missing or extra Ergogen results",
        ));
    }
    let mut completed = Vec::new();
    let mut current_nets = plan.reserved_nets.clone();
    for (job, result) in plan.jobs.iter().zip(request.results.iter()) {
        if result.snapshot_token != plan.snapshot_token || result.revision != plan.revision {
            return Err(err(
                ArtifactErrorCode::StaleResult,
                "Ergogen result belongs to a stale export snapshot",
            ));
        }
        if result.job_id != job.job_id {
            return Err(err(
                ArtifactErrorCode::MismatchedResults,
                "Ergogen results are missing, duplicated, or reordered",
            ));
        }
        validate_net_transition(&current_nets, &result.nets)?;
        validate_generated_forms(&result.source, &result.nets)?;
        current_nets = result.nets.clone();
        completed.push(result.source.clone());
    }
    let (files, skipped_utilities) = match &plan.target {
        ExportTarget::Board { board_id } => (
            finish_board(&plan, board_id, &completed, &current_nets)?,
            Vec::new(),
        ),
        ExportTarget::StandaloneFootprints { definition_ids } => {
            finish_standalone(&plan, definition_ids, &request.results)?
        }
    };
    Ok(ExportArtifact {
        snapshot_token: plan.snapshot_token,
        revision: plan.revision,
        files,
        skipped_utilities,
    })
}

fn validate_net_transition(
    previous: &[ReservedNet],
    current: &[ReservedNet],
) -> Result<(), ArtifactError> {
    if current.len() < previous.len() {
        return Err(validation("Generated net table removed reserved nets"));
    }
    if current[..previous.len()] != *previous {
        return Err(validation(
            "Generated net table changed reserved net allocation",
        ));
    }
    let previous_names = previous
        .iter()
        .map(|net| net.name.as_str())
        .collect::<HashSet<_>>();
    let mut names = HashSet::new();
    let mut indexes = HashSet::new();
    for (position, net) in current.iter().enumerate() {
        let repeated_reserved_name = position < previous.len();
        if net.index == 0
            || (!repeated_reserved_name
                && (!names.insert(net.name.as_str()) || previous_names.contains(net.name.as_str())))
            || !indexes.insert(net.index)
        {
            return Err(validation(
                "Generated net table contains duplicate names or indexes",
            ));
        }
    }
    for (offset, net) in current.iter().skip(previous.len()).enumerate() {
        let expected =
            previous.iter().map(|entry| entry.index).max().unwrap_or(0) + 1 + offset as u32;
        if net.index != expected {
            return Err(validation("Generated net allocator is not contiguous"));
        }
    }
    Ok(())
}

fn validate_generated_forms(
    source_text: &str,
    nets: &[ReservedNet],
) -> Result<Vec<String>, ArtifactError> {
    let parsed = kiutils_sexpr::parse_rootless(source_text)
        .map_err(|error| err(ArtifactErrorCode::ParseError, error.to_string()))?;
    let known = nets
        .iter()
        .map(|net| (net.index, net.name.as_str()))
        .collect::<HashMap<_, _>>();
    let mut forms = Vec::new();
    for node in &parsed.nodes {
        let safe_node = restore_kicad_quoted_atoms(node, source_text)?;
        let form = CstDocument {
            raw: source_text.to_owned(),
            nodes: vec![safe_node],
        }
        .to_canonical_string()
        .trim_end()
        .to_owned();
        let kind = list_head(node).unwrap_or("");
        if !matches!(
            kind,
            "footprint"
                | "module"
                | "segment"
                | "via"
                | "zone"
                | "gr_text"
                | "gr_line"
                | "gr_arc"
                | "gr_circle"
                | "gr_poly"
                | "gr_rect"
        ) {
            return Err(err(
                ArtifactErrorCode::Unsupported,
                format!("Unsupported Ergogen output form: {kind}"),
            ));
        }
        validate_net_refs(node, &known, source_text)?;
        forms.push(form);
    }
    Ok(forms)
}

fn restore_kicad_quoted_atoms(node: &Node, source_text: &str) -> Result<Node, ArtifactError> {
    match node {
        Node::Atom {
            atom: Atom::Quoted(_),
            span,
        } => {
            let value = sexpr::kicad_quoted(source_text, *span)
                .ok_or_else(|| err(ArtifactErrorCode::ParseError, "Invalid quoted KiCad text"))?;
            Ok(Node::Atom {
                atom: Atom::Quoted(value),
                span: *span,
            })
        }
        Node::Atom { atom, span } => Ok(Node::Atom {
            atom: atom.clone(),
            span: *span,
        }),
        Node::List { items, span } => Ok(Node::List {
            items: items
                .iter()
                .map(|item| restore_kicad_quoted_atoms(item, source_text))
                .collect::<Result<_, _>>()?,
            span: *span,
        }),
    }
}

fn validate_net_refs(
    node: &Node,
    known: &HashMap<u32, &str>,
    source_text: &str,
) -> Result<(), ArtifactError> {
    match node {
        Node::Atom { .. } => Ok(()),
        Node::List { items, .. } => {
            if list_head(node) == Some("net") {
                let index = items
                    .get(1)
                    .and_then(node_atom)
                    .and_then(|text| text.parse::<u32>().ok())
                    .ok_or_else(|| validation("Malformed generated net reference"))?;
                if index != 0 {
                    let name = known.get(&index).ok_or_else(|| {
                        validation(format!(
                            "Generated form references undeclared net index {index}"
                        ))
                    })?;
                    if let Some(label_node) = items.get(2) {
                        let label = match label_node {
                            Node::Atom {
                                atom: Atom::Quoted(_),
                                span,
                            } => sexpr::kicad_quoted(source_text, *span),
                            _ => node_atom(label_node).map(str::to_owned),
                        };
                        if let Some(label) = label {
                            if label != *name {
                                return Err(validation(format!(
                                    "Generated net reference {index} has mismatched name"
                                )));
                            }
                        }
                    }
                }
            }
            for child in items {
                validate_net_refs(child, known, source_text)?;
            }
            Ok(())
        }
    }
}

fn list_head(node: &Node) -> Option<&str> {
    match node {
        Node::List { items, .. } => items.first().and_then(node_atom),
        Node::Atom { .. } => None,
    }
}
fn node_atom(node: &Node) -> Option<&str> {
    match node {
        Node::Atom {
            atom: Atom::Symbol(value) | Atom::Quoted(value),
            ..
        } => Some(value),
        Node::List { .. } => None,
    }
}

fn normalize_generated_footprint(form: &str) -> String {
    if form.starts_with("(module ") {
        form.replacen("(module", "(footprint", 1)
    } else {
        form.to_owned()
    }
}

fn finish_standalone(
    plan: &ExportPlan,
    definition_ids: &[String],
    results: &[ErgogenJobResult],
) -> Result<(Vec<ArtifactFile>, Vec<String>), ArtifactError> {
    let definitions = plan
        .captured_document
        .definitions
        .iter()
        .map(|definition| (definition.id.as_str(), definition))
        .collect::<HashMap<_, _>>();
    let mut files = Vec::new();
    let mut skipped_utilities = Vec::new();
    let mut result_index = 0;
    for id in definition_ids {
        let definition = definitions.get(id.as_str()).ok_or_else(|| {
            err(
                ArtifactErrorCode::NotFound,
                format!("Missing definition: {id}"),
            )
        })?;
        let content = if is_ergogen(definition) {
            let result = results.get(result_index).ok_or_else(|| {
                err(
                    ArtifactErrorCode::MismatchedResults,
                    "Missing Ergogen result",
                )
            })?;
            let forms = validate_generated_forms(&result.source, &result.nets)?;
            result_index += 1;
            let footprints = forms
                .iter()
                .filter(|form| form.starts_with("(footprint ") || form.starts_with("(module "))
                .collect::<Vec<_>>();
            if footprints.is_empty()
                && matches!(definition.kind, PartKind::Utility)
                && definition_ids.len() > 1
            {
                skipped_utilities.push(definition.name.clone());
                continue;
            }
            if footprints.len() != 1 {
                return Err(err(
                    ArtifactErrorCode::Unsupported,
                    format!(
                        "{} emits board objects and must be exported on a board",
                        definition.name
                    ),
                ));
            }
            // A standalone library file contains the footprint artifact only;
            // generators can also emit board-level routing or helper graphics.
            format!("{}\n", normalize_generated_footprint(footprints[0]))
        } else if is_imported(definition) {
            source::patch_footprint(
                &definition.kicad_source.as_ref().expect("checked").source,
                &FootprintPatch {
                    footprint_name: Some(safe_name(&definition.name)),
                    reference: Some("REF**".into()),
                    value: Some(definition.name.clone()),
                    placement: Some(Pose2 {
                        at: Vec2::default(),
                        rotation: 0.0,
                    }),
                    side: Side::Front,
                    pad_nets: BTreeMap::new(),
                    uuid_scope: format!("definition:{}", definition.id),
                    model_forms: managed_model_forms(definition, &plan.model_paths)?,
                },
            )?
        } else {
            format!(
                "{}\n",
                native_footprint(
                    definition,
                    &format!("definition:{}", definition.id),
                    None,
                    &BTreeMap::new(),
                    &plan.model_paths
                )?
            )
        };
        files.push(ArtifactFile {
            filename: format!("{}.kicad_mod", safe_name(&definition.name)),
            content,
        });
    }
    Ok((files, skipped_utilities))
}

fn finish_board(
    plan: &ExportPlan,
    board_id: &str,
    results: &[String],
    generated_nets: &[ReservedNet],
) -> Result<Vec<ArtifactFile>, ArtifactError> {
    let doc = &plan.captured_document;
    let (board, parts, definitions) = board_and_maps(doc, board_id)?;
    validate_contours(&plan.contours)?;
    let (_, pin_map) = net_lookup(doc, board)?;
    let board_net_index = board
        .net_ids
        .iter()
        .enumerate()
        .map(|(index, id)| (id.as_str(), index as u32 + 1))
        .collect::<HashMap<_, _>>();
    let mut ergogen_result_index = 0;
    let mut footprints = Vec::new();
    let mut generated_objects = Vec::new();
    let mut generated_traces = Vec::new();
    let mut generated_vias = Vec::new();
    for part_id in &board.part_ids {
        let part = parts
            .get(part_id.as_str())
            .ok_or_else(|| validation(format!("Missing part or definition: {part_id}")))?;
        let definition = definitions
            .get(part.definition_id.as_str())
            .ok_or_else(|| validation(format!("Missing part or definition: {part_id}")))?;
        let scope = format!("{board_id}:part:{part_id}");
        if is_ergogen(definition) {
            let forms = validate_generated_forms(&results[ergogen_result_index], generated_nets)?;
            ergogen_result_index += 1;
            let mut board_objects_here = Vec::new();
            for form in forms {
                if form.starts_with("(footprint ") || form.starts_with("(module ") {
                    footprints.push(normalize_generated_footprint(&form));
                } else {
                    board_objects_here.push(render(&form)?);
                }
            }
            if !board_objects_here.is_empty() && part.pose.at != Vec2::default() {
                // Ergogen owns its world-space transform through the trusted adapter.
            }
            generated_objects.extend(board_objects_here);
            continue;
        }
        if is_imported(definition) {
            let imported = source::import_footprint(
                &definition.kicad_source.as_ref().expect("checked").source,
                &definition.id,
            )?;
            let mut pad_nets = BTreeMap::new();
            for pad in &imported.definition.pads {
                let net_id = pin_map.get(&format!("{}\0{}", part_id, pad.id));
                if let Some(net_id) = net_id {
                    let index = board_net_index
                        .get(net_id.as_str())
                        .copied()
                        .ok_or_else(|| {
                            validation(format!(
                                "Pad {part_id}/{} references a net outside board",
                                pad.id
                            ))
                        })?;
                    let net = net_by_id(&doc.nets, net_id).expect("net was indexed");
                    pad_nets.insert(pad.id.clone(), (index, net.name.clone()));
                }
            }
            for key in pin_map
                .keys()
                .filter(|key| key.starts_with(&format!("{}\0", part_id)))
            {
                let pad_id = key.split('\0').nth(1).unwrap_or_default();
                if !imported.definition.pads.iter().any(|pad| pad.id == pad_id) {
                    return Err(validation(format!(
                        "Net references missing pad on part {part_id}"
                    )));
                }
            }
            footprints.push(source::patch_footprint(
                &definition.kicad_source.as_ref().expect("checked").source,
                &FootprintPatch {
                    footprint_name: Some(safe_name(&definition.name)),
                    reference: Some(part.reference.clone()),
                    value: Some(definition.name.clone()),
                    placement: Some(part.pose),
                    side: part.side.clone(),
                    pad_nets,
                    uuid_scope: scope,
                    model_forms: managed_model_forms(definition, &plan.model_paths)?,
                },
            )?);
            continue;
        }
        let compiled = compile::compile_builtin(definition, &BTreeMap::new(), part.side.clone())
            .map_err(|message| validation(message))?;
        let geometry = &compiled.geometry;
        let mut pad_net_map = BTreeMap::new();
        for pad in &geometry.pads {
            let pin_net = pin_map.get(&format!("{}\0{}", part_id, pad.id));
            let authored = definition
                .pads
                .iter()
                .find(|item| item.id == pad.id)
                .and_then(|pad| pad.net_id.as_deref());
            if pin_net.is_some() && authored.is_some_and(|authored| authored != pin_net.unwrap()) {
                return Err(validation(format!(
                    "Conflicting net for {part_id}/{}",
                    pad.id
                )));
            }
            let selected = pin_net.map(String::as_str).or(authored);
            if let Some(net_id) = selected {
                let index = board_net_index.get(net_id).copied().ok_or_else(|| {
                    validation(format!(
                        "Pad {part_id}/{} references a net outside board",
                        pad.id
                    ))
                })?;
                let name = net_by_id(&doc.nets, net_id)
                    .ok_or_else(|| {
                        validation(format!("Pad {part_id}/{} references a missing net", pad.id))
                    })?
                    .name
                    .clone();
                let net = ReservedNet { name, index };
                pad_net_map.insert(pad.id.clone(), net.clone());
            }
        }
        for key in pin_map
            .keys()
            .filter(|key| key.starts_with(&format!("{}\0", part_id)))
        {
            let pad_id = key.split('\0').nth(1).unwrap_or_default();
            if !geometry.pads.iter().any(|pad| pad.id == pad_id) {
                return Err(validation(format!(
                    "Net references missing pad on part {part_id}"
                )));
            }
        }
        footprints.push(native_footprint(
            definition,
            &scope,
            Some(part),
            &pad_net_map,
            &plan.model_paths,
        )?);
        let angle = part.pose.rotation.to_radians();
        let transform = |point: Vec2| -> Vec2 {
            let x = if matches!(part.side, Side::Back) {
                -point.x
            } else {
                point.x
            };
            Vec2 {
                x: part.pose.at.x + x * angle.cos() - point.y * angle.sin(),
                y: part.pose.at.y + x * angle.sin() + point.y * angle.cos(),
            }
        };
        for trace in &geometry.traces {
            let layer = if matches!(part.side, Side::Back) {
                Side::Back
            } else {
                trace.layer.clone()
            };
            let net_id = trace
                .pad_id
                .as_ref()
                .and_then(|pad| pin_map.get(&format!("{}\0{}", part_id, pad)).cloned())
                .or_else(|| {
                    trace.pad_id.as_ref().and_then(|pad| {
                        definition
                            .pads
                            .iter()
                            .find(|item| &item.id == pad)
                            .and_then(|item| item.net_id.clone())
                    })
                });
            generated_traces.push(CopperTrace {
                id: format!("{part_id}:{}", trace.id),
                start: transform(trace.start),
                end: transform(trace.end),
                width: trace.width,
                layer,
                net_id,
            });
        }
        for via in &geometry.vias {
            let net_id = via
                .pad_id
                .as_ref()
                .and_then(|pad| pin_map.get(&format!("{}\0{}", part_id, pad)).cloned())
                .or_else(|| {
                    via.pad_id.as_ref().and_then(|pad| {
                        definition
                            .pads
                            .iter()
                            .find(|item| &item.id == pad)
                            .and_then(|item| item.net_id.clone())
                    })
                });
            generated_vias.push(CopperVia {
                id: format!("{part_id}:{}", via.id),
                at: transform(via.at),
                size: via.size,
                drill: via.drill,
                net_id,
            });
        }
    }
    let mut tracks = board.traces.clone();
    tracks.extend(generated_traces);
    let mut vias = board.vias.clone();
    vias.extend(generated_vias);
    unique_ids(
        tracks
            .iter()
            .map(|item| item.id.as_str())
            .chain(vias.iter().map(|item| item.id.as_str())),
        "copper",
    )?;
    let net_number = |net_id: Option<&str>| -> Result<u32, ArtifactError> {
        let Some(net_id) = net_id else {
            return Ok(0);
        };
        board_net_index
            .get(net_id)
            .copied()
            .or_else(|| {
                doc.nets
                    .iter()
                    .find(|net| net.id == net_id)
                    .and_then(|net| board_net_index.get(net.id.as_str()).copied())
            })
            .ok_or_else(|| validation(format!("Copper references a net outside board: {net_id}")))
    };
    let mut copper = Vec::new();
    for trace in tracks {
        if trace.width <= 0.0 || !trace.width.is_finite() || trace.start == trace.end {
            return Err(validation(format!("Invalid trace geometry: {}", trace.id)));
        }
        let layer = if matches!(trace.layer, Side::Back) {
            "B.Cu"
        } else {
            "F.Cu"
        };
        copper.push(render(&format!(
            "(segment (start {}) (end {}) (width {}) (layer {}) (net {}) (uuid {}))",
            xy(trace.start)?,
            xy(trace.end)?,
            num(trace.width)?,
            q(layer)?,
            net_number(trace.net_id.as_deref())?,
            uuid_text(&board.id, "trace", &trace.id)?
        ))?);
    }
    for via in vias {
        if via.size <= 0.0 || via.drill <= 0.0 || via.drill >= via.size {
            return Err(validation(format!("Invalid via geometry: {}", via.id)));
        }
        copper.push(render(&format!(
            "(via (at {}) (size {}) (drill {}) (layers \"F.Cu\" \"B.Cu\") (net {}) (uuid {}))",
            xy(via.at)?,
            num(via.size)?,
            num(via.drill)?,
            net_number(via.net_id.as_deref())?,
            uuid_text(&board.id, "via", &via.id)?
        ))?);
    }
    let edges = edge_forms(&plan.contours, &board.id)?;
    let mut all_nets = BTreeMap::<u32, String>::new();
    for id in &board.net_ids {
        let net = net_by_id(&doc.nets, id).expect("validated");
        all_nets.insert(board_net_index[id.as_str()], net.name.clone());
    }
    for net in generated_nets {
        all_nets.insert(net.index, net.name.clone());
    }
    let net_forms = all_nets
        .iter()
        .map(|(index, name)| render(&format!("(net {index} {})", q(name)?)))
        .collect::<Result<Vec<_>, ArtifactError>>()?;
    let content = format!(
        "(kicad_pcb (version {FILE_VERSION}) (generator \"BoardStudio\")\n  (general (thickness {}))\n  (paper \"A4\")\n  (layers (0 \"F.Cu\" signal) (31 \"B.Cu\" signal) (44 \"Edge.Cuts\" user) (46 \"B.CrtYd\" user) (47 \"F.CrtYd\" user) (48 \"B.Fab\" user) (49 \"F.Fab\" user))\n  (net 0 \"\")\n  {}\n  {}\n  {}\n  {}\n  {}\n)\n",
        num(board.thickness)?,
        net_forms.join("\n  "),
        footprints.join("\n  "),
        generated_objects.join("\n  "),
        copper.join("\n  "),
        edges.join("\n  ")
    );
    Ok(vec![ArtifactFile {
        filename: format!("{}.kicad_pcb", safe_name(&board.name)),
        content,
    }])
}

fn edge_forms(contours: &[Contour], scope: &str) -> Result<Vec<String>, ArtifactError> {
    let mut forms = Vec::new();
    for (contour_index, contour) in contours.iter().enumerate() {
        for index in 0..contour.points.len() {
            let start = contour.points[index];
            let end = contour.points[(index + 1) % contour.points.len()];
            if start == end {
                continue;
            }
            forms.push(render(&format!("(gr_line (start {}) (end {}) (stroke (width {}) (type solid)) (layer \"Edge.Cuts\") (uuid {}))", xy(start)?, xy(end)?, num(EDGE_WIDTH)?, uuid_text(scope, "edge", &format!("{contour_index}:{index}"))?))?);
        }
    }
    Ok(forms)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn contour() -> Vec<Contour> {
        vec![Contour {
            points: vec![
                Vec2 { x: 0.0, y: 0.0 },
                Vec2 { x: 10.0, y: 0.0 },
                Vec2 { x: 10.0, y: 5.0 },
                Vec2 { x: 0.0, y: 5.0 },
            ],
            hole: false,
        }]
    }

    fn board_document() -> ProjectDoc {
        let mut document = ProjectDoc::empty("doc", "Document");
        document.boards.push(Board {
            id: "board".into(),
            name: "Main board".into(),
            outline_ids: vec![],
            part_ids: vec![],
            net_ids: vec![],
            thickness: 1.6,
            traces: vec![],
            vias: vec![],
        });
        document
    }

    fn prepare(document: ProjectDoc, target: ExportTarget) -> ExportPlan {
        prepare_export(PrepareExportRequest {
            snapshot_token: "snapshot-1".into(),
            expected_revision: document.revision,
            document,
            target,
            contours: contour(),
            model_paths: BTreeMap::new(),
        })
        .expect("prepare")
    }

    fn ergogen_document() -> ProjectDoc {
        let mut document = board_document();
        document.definitions = ["d1", "d2"]
            .into_iter()
            .map(|id| PartDefinition {
                id: id.into(),
                name: format!("Part {id}"),
                kind: PartKind::Utility,
                keycap: None,
                envelope_source: None,
                kicad_source: None,
                terminals: BTreeMap::new(),
                matrix_terminals: None,
                envelope_notice: None,
                courtyard: vec![
                    Vec2 { x: -1.0, y: -1.0 },
                    Vec2 { x: 1.0, y: -1.0 },
                    Vec2 { x: 1.0, y: 1.0 },
                ],
                pads: vec![],
                model: None,
                models: None,
                generator: Some(PartGenerator {
                    source: "ceoloide/utility_text".into(),
                    version: "1".into(),
                    parameters: BTreeMap::new(),
                }),
            })
            .collect();
        for (index, id) in ["p1", "p2"].into_iter().enumerate() {
            document.parts.push(Part {
                id: id.into(),
                definition_id: format!("d{}", index + 1),
                reference: format!("U{}", index + 1),
                pose: Pose2 {
                    at: Vec2 {
                        x: index as f64,
                        y: 0.0,
                    },
                    rotation: 0.0,
                },
                side: Side::Front,
                keycap: None,
                outline: None,
                locked: None,
                properties: None,
                generator_parameters: None,
            });
            document.boards[0].part_ids.push(id.into());
        }
        document
    }

    fn placed_native_document(side: Side) -> ProjectDoc {
        let mut document = board_document();
        let definition = asymmetric_definition();
        document.boards[0].part_ids.push("placed".into());
        document.definitions.push(definition);
        document.parts.push(Part {
            id: "placed".into(),
            definition_id: "asym".into(),
            reference: "U1".into(),
            pose: Pose2 {
                at: Vec2 { x: 11.0, y: 13.0 },
                rotation: 37.0,
            },
            side,
            keycap: None,
            outline: None,
            locked: None,
            properties: None,
            generator_parameters: None,
        });
        document
    }

    fn asymmetric_definition() -> PartDefinition {
        PartDefinition {
            id: "asym".into(),
            name: "Asymmetric".into(),
            kind: PartKind::Custom,
            keycap: None,
            envelope_source: None,
            kicad_source: None,
            terminals: BTreeMap::new(),
            matrix_terminals: None,
            envelope_notice: None,
            courtyard: vec![
                Vec2 { x: 0.0, y: 0.0 },
                Vec2 { x: 4.0, y: 0.0 },
                Vec2 { x: 4.0, y: 3.0 },
                Vec2 { x: 0.0, y: 3.0 },
            ],
            pads: vec![Pad {
                id: "pad1".into(),
                number: "1".into(),
                at: Vec2 { x: 2.0, y: 3.0 },
                size: Vec2 { x: 2.0, y: 1.0 },
                shape: PadShape::Oval,
                drill: None,
                plated: None,
                side: None,
                rotation: Some(30.0),
                net_id: None,
            }],
            model: None,
            models: None,
            generator: None,
        }
    }

    fn result(
        plan: &ExportPlan,
        index: usize,
        source: &str,
        nets: Vec<ReservedNet>,
    ) -> ErgogenJobResult {
        ErgogenJobResult {
            snapshot_token: plan.snapshot_token.clone(),
            revision: plan.revision,
            job_id: plan.jobs[index].job_id.clone(),
            source: source.into(),
            nets,
        }
    }

    #[test]
    fn numbers_match_javascript_fixed_six_decimal_semantics() {
        assert_eq!(num(1.2345675).unwrap(), "1.234568");
        assert_eq!(num(-1.2345675).unwrap(), "-1.234568");
        assert_eq!(num(0.0000005).unwrap(), "0");
        assert_eq!(num(-0.0000005).unwrap(), "0");
        assert_eq!(num(-0.0).unwrap(), "0");
    }

    #[test]
    fn unicode_uuid_is_stable_and_matches_javascript_codepoints() {
        assert_eq!(
            uuid("definition:café🚀"),
            "5d140fed-df0d-59c4-a661-76ff4c486855"
        );
    }

    #[test]
    fn rotated_oblong_uses_absolute_angle_and_back_side_canonical_mirror() {
        let definition = asymmetric_definition();
        let part = Part {
            id: "placed".into(),
            definition_id: definition.id.clone(),
            reference: "U1".into(),
            pose: Pose2 {
                at: Vec2 { x: 11.0, y: 13.0 },
                rotation: 37.0,
            },
            side: Side::Front,
            keycap: None,
            outline: None,
            locked: None,
            properties: None,
            generator_parameters: None,
        };
        let front = native_footprint(
            &definition,
            "board:part:placed",
            Some(&part),
            &BTreeMap::new(),
            &BTreeMap::new(),
        )
        .unwrap();
        assert!(front.contains("(at 11 -13 37)"));
        assert!(front.contains("(at 2 -3 67) (size 2 1)"));

        let mut back_part = part;
        back_part.side = Side::Back;
        let back = native_footprint(
            &definition,
            "board:part:placed",
            Some(&back_part),
            &BTreeMap::new(),
            &BTreeMap::new(),
        )
        .unwrap();
        assert!(back.contains("(at 11 -13 -143)"));
        assert!(back.contains("(at 2 3 187) (size 2 1)"));
    }

    #[test]
    fn native_models_use_safe_project_paths_and_kicad_axis_transforms() {
        let mut definition = asymmetric_definition();
        definition.model = Some(PartModel {
            asset_id: "mesh".into(),
            offset: Vec3 {
                x: 1.0,
                y: 2.0,
                z: 3.0,
            },
            rotation: Vec3 {
                x: 10.0,
                y: 20.0,
                z: 30.0,
            },
            scale: Vec3 {
                x: 1.0,
                y: 2.0,
                z: 3.0,
            },
        });
        let paths = BTreeMap::from([("mesh".into(), "models/body.step".into())]);
        let footprint =
            native_footprint(&definition, "model-test", None, &BTreeMap::new(), &paths).unwrap();
        assert!(footprint.contains("${KIPRJMOD}/models/body.step"));
        assert!(footprint.contains("(offset (xyz 1 -2 3))"));
        assert!(footprint.contains("(scale (xyz 1 2 3))"));
        assert!(footprint.contains("(rotate (xyz 10 20 -30))"));

        for unsafe_path in ["../escape.step", "/absolute.step", "models\\body.step"] {
            let paths = BTreeMap::from([("mesh".into(), unsafe_path.into())]);
            assert!(
                native_footprint(&definition, "model-test", None, &BTreeMap::new(), &paths,)
                    .is_err()
            );
        }
    }

    #[test]
    fn imported_source_rejects_nets_bound_to_removed_pad_ids() {
        let source_text = "(footprint \"Imported\" (layer \"F.Cu\") (pad \"1\" smd rect (at 0 0) (size 1 1) (layers \"F.Cu\")))";
        let imported = source::import_footprint(source_text, "imported").unwrap();
        let mut document = board_document();
        document.definitions.push(imported.definition);
        document.parts.push(Part {
            id: "imported-part".into(),
            definition_id: "imported".into(),
            reference: "U1".into(),
            pose: Pose2 {
                at: Vec2::default(),
                rotation: 0.0,
            },
            side: Side::Front,
            keycap: None,
            outline: None,
            locked: None,
            properties: None,
            generator_parameters: None,
        });
        document.boards[0].part_ids.push("imported-part".into());
        document.nets.push(Net {
            id: "net".into(),
            name: "SIGNAL".into(),
            pins: vec![Pin {
                part_id: "imported-part".into(),
                pad_id: "pad-1".into(),
            }],
        });
        document.boards[0].net_ids.push("net".into());
        let plan = prepare(
            document,
            ExportTarget::Board {
                board_id: "board".into(),
            },
        );
        let error = finish_export(FinishExportRequest {
            plan,
            results: vec![],
        })
        .unwrap_err();
        assert_eq!(error.code, ArtifactErrorCode::Validation);
        assert!(
            error
                .message
                .contains("Net references missing pad on part imported-part")
        );
    }

    #[test]
    fn native_board_output_can_be_written_for_kicad_cli_oracle() {
        let Some(base_path) = std::env::var_os("BOARDSTUDIO_KICAD_ORACLE_PATH") else {
            return;
        };
        let base_path = std::path::PathBuf::from(base_path);
        for (suffix, side) in [("front", Side::Front), ("back", Side::Back)] {
            let document = placed_native_document(side);
            let plan = prepare_export(PrepareExportRequest {
                snapshot_token: format!("oracle-{suffix}"),
                expected_revision: document.revision,
                document,
                target: ExportTarget::Board {
                    board_id: "board".into(),
                },
                contours: contour(),
                model_paths: BTreeMap::new(),
            })
            .unwrap();
            let artifact = finish_export(FinishExportRequest {
                plan,
                results: vec![],
            })
            .unwrap();
            let path = base_path.with_file_name(format!(
                "{}-{suffix}.kicad_pcb",
                base_path
                    .file_stem()
                    .and_then(|name| name.to_str())
                    .unwrap_or("boardstudio-oracle")
            ));
            std::fs::write(path, &artifact.files[0].content).unwrap();
        }
    }

    #[test]
    fn prepared_plan_is_deterministic_and_rejects_mutated_snapshot() {
        let target = ExportTarget::Board {
            board_id: "board".into(),
        };
        let one = prepare(board_document(), target.clone());
        let two = prepare(board_document(), target);
        let output = finish_export(FinishExportRequest {
            plan: one.clone(),
            results: vec![],
        })
        .unwrap();
        let repeated = finish_export(FinishExportRequest {
            plan: two,
            results: vec![],
        })
        .unwrap();
        assert_eq!(output.files, repeated.files);

        let mut altered = one.clone();
        altered.captured_document.name.push('!');
        assert_eq!(
            finish_export(FinishExportRequest {
                plan: altered,
                results: vec![]
            })
            .unwrap_err()
            .code,
            ArtifactErrorCode::MismatchedResults
        );

        let mut altered = one.clone();
        altered
            .model_paths
            .insert("asset".into(), "models/asset.step".into());
        assert_eq!(
            finish_export(FinishExportRequest {
                plan: altered,
                results: vec![]
            })
            .unwrap_err()
            .code,
            ArtifactErrorCode::MismatchedResults
        );
        let mut altered = one.clone();
        altered.contours[0].points[0].x = 3.0;
        assert_eq!(
            finish_export(FinishExportRequest {
                plan: altered,
                results: vec![]
            })
            .unwrap_err()
            .code,
            ArtifactErrorCode::MismatchedResults
        );
        let mut altered = one;
        altered.target = ExportTarget::Board {
            board_id: "other".into(),
        };
        assert_eq!(
            finish_export(FinishExportRequest {
                plan: altered,
                results: vec![]
            })
            .unwrap_err()
            .code,
            ArtifactErrorCode::MismatchedResults
        );
    }

    #[test]
    fn ergogen_results_require_complete_ordered_snapshot_bound_jobs() {
        let plan = prepare(
            ergogen_document(),
            ExportTarget::Board {
                board_id: "board".into(),
            },
        );
        let footprint = "(footprint \"part\" (layer \"F.Cu\") (at 0 0) (uuid \"00000000-0000-5000-a000-000000000000\"))";
        let missing = finish_export(FinishExportRequest {
            plan: plan.clone(),
            results: vec![result(&plan, 0, footprint, vec![])],
        })
        .unwrap_err();
        assert_eq!(missing.code, ArtifactErrorCode::MismatchedResults);

        let reordered = finish_export(FinishExportRequest {
            plan: plan.clone(),
            results: vec![
                result(&plan, 1, footprint, vec![]),
                result(&plan, 0, footprint, vec![]),
            ],
        })
        .unwrap_err();
        assert_eq!(reordered.code, ArtifactErrorCode::MismatchedResults);

        let stale = ErgogenJobResult {
            snapshot_token: "another-snapshot".into(),
            ..result(&plan, 0, footprint, vec![])
        };
        assert_eq!(
            finish_export(FinishExportRequest {
                plan: plan.clone(),
                results: vec![stale, result(&plan, 1, footprint, vec![])]
            })
            .unwrap_err()
            .code,
            ArtifactErrorCode::StaleResult
        );

        let complete = finish_export(FinishExportRequest {
            plan: plan.clone(),
            results: vec![
                result(&plan, 0, footprint, vec![]),
                result(&plan, 1, footprint, vec![]),
            ],
        })
        .unwrap();
        assert_eq!(complete.files.len(), 1);
    }

    #[test]
    fn ergogen_net_references_must_match_reserved_allocator_state() {
        let nets = vec![ReservedNet {
            name: "ROW".into(),
            index: 1,
        }];
        assert!(validate_generated_forms("(segment (net 2 \"ROW\"))", &nets).is_err());
        assert!(validate_generated_forms("(segment (net 1 \"COL\"))", &nets).is_err());
        assert!(
            validate_net_transition(
                &nets,
                &[
                    ReservedNet {
                        name: "ROW".into(),
                        index: 1
                    },
                    ReservedNet {
                        name: "ROW".into(),
                        index: 2
                    }
                ]
            )
            .is_err()
        );
    }

    #[test]
    fn ergogen_validation_preserves_escaped_source_spans() {
        let source = r#"(gr_text "line\\nnext" (at 0 0) (layer "F.SilkS"))"#;
        assert_eq!(validate_generated_forms(source, &[]).unwrap(), vec![source]);
    }

    #[test]
    fn standalone_bundles_report_board_utility_skips_but_single_export_errors() {
        let document = ergogen_document();
        let target = ExportTarget::StandaloneFootprints {
            definition_ids: vec!["d1".into(), "d2".into()],
        };
        let plan = prepare(document.clone(), target);
        let utility = r#"(gr_text "utility" (at 0 0) (layer "F.SilkS"))"#;
        let bundle = finish_export(FinishExportRequest {
            plan: plan.clone(),
            results: vec![
                result(&plan, 0, "", vec![]),
                result(&plan, 1, utility, vec![]),
            ],
        })
        .unwrap();
        assert!(bundle.files.is_empty());
        assert_eq!(bundle.skipped_utilities, vec!["Part d1", "Part d2"]);

        let plan = prepare(
            document,
            ExportTarget::StandaloneFootprints {
                definition_ids: vec!["d1".into()],
            },
        );
        let error = finish_export(FinishExportRequest {
            plan: plan.clone(),
            results: vec![result(&plan, 0, utility, vec![])],
        })
        .unwrap_err();
        assert!(
            error
                .message
                .contains("Part d1 emits board objects and must be exported on a board")
        );
    }
}
