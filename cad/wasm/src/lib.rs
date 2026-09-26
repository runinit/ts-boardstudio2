use cadrum::{Boolean, DVec3, Edge, Mesh, Solid, Tessellation};
use js_sys::{Float32Array, Object, Reflect, Uint8Array};
use serde::Deserialize;
use std::cell::RefCell;
use std::collections::VecDeque;
use wasm_bindgen::prelude::*;

const MAX_STEP_BYTES: usize = 32 * 1024 * 1024;
const MESH_OPTIONS: Tessellation = Tessellation {
    deflection_linear: 0.1,
    deflection_angular: 0.5,
    relative_linear: false,
};

#[derive(Deserialize, Debug)]
struct PreparedCase {
    revision: u64,
    body: CaseBody,
    regions: Vec<PreparedRegion>,
}

#[derive(Deserialize, Debug)]
struct PreparedAssembly {
    revision: u64,
    bodies: Vec<PreparedCase>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct CaseBody {
    id: String,
    name: String,
    kind: CaseKind,
    thickness: f64,
    #[serde(default)]
    z: Option<f64>,
    #[serde(default)]
    wall_height: Option<f64>,
    #[serde(default)]
    openings: Option<Vec<CaseOpening>>,
    #[serde(default)]
    gasket: Option<Gasket>,
}

#[derive(Deserialize, Debug, PartialEq)]
#[serde(rename_all = "lowercase")]
enum CaseKind {
    Plate,
    Tray,
    Lid,
}

#[derive(Deserialize, Debug)]
struct Vec2 {
    x: f64,
    y: f64,
}

#[derive(Deserialize, Debug)]
struct PreparedRegion {
    outer: Vec<Vec2>,
    #[serde(default)]
    holes: Vec<Vec<Vec2>>,
    #[serde(default)]
    cavities: Vec<Vec<Vec2>>,
    #[serde(default)]
    gaskets: Vec<PreparedGasket>,
    #[serde(default)]
    mounts: Vec<Mount>,
}

#[derive(Deserialize, Debug)]
struct PreparedGasket {
    outer: Vec<Vec2>,
    #[serde(default)]
    holes: Vec<Vec<Vec2>>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct CaseOpening {
    points: Vec<Vec2>,
    z: f64,
    height: f64,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct Mount {
    at: Vec2,
    kind: MountKind,
    hole_diameter: f64,
    #[serde(default)]
    boss_diameter: Option<f64>,
    #[serde(default)]
    height: Option<f64>,
}

#[derive(Deserialize, Debug, PartialEq)]
#[serde(rename_all = "lowercase")]
enum MountKind {
    Hole,
    Boss,
}

#[derive(Deserialize, Debug)]
struct Gasket {
    depth: f64,
}

#[derive(Clone)]
struct MeshData {
    positions: Vec<f32>,
    normals: Vec<f32>,
}

struct BodyMeshData {
    id: String,
    name: String,
    mesh: MeshData,
}

struct CaseResultData {
    revision: u64,
    step: Vec<u8>,
    mesh: MeshData,
    bodies: Option<Vec<BodyMeshData>>,
}

#[derive(Clone)]
struct CachedBody {
    key: String,
    solids: Vec<Solid>,
    mesh: MeshData,
}

thread_local! {
    static REGION_CACHE: RefCell<VecDeque<CachedBody>> = const { RefCell::new(VecDeque::new()) };
    static PREVIEW_CACHE: RefCell<VecDeque<CachedBody>> = const { RefCell::new(VecDeque::new()) };
}

struct StepModelData {
    mesh: MeshData,
    min: [f64; 3],
    max: [f64; 3],
    #[cfg(test)]
    solid_count: usize,
}

#[cfg(target_arch = "wasm32")]
unsafe extern "C" {
    fn __wasm_call_ctors();
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen(start)]
pub fn initialize_cadrum() {
    cadrum::__anchor_wasi_stub();
    unsafe {
        __wasm_call_ctors();
    }
}

#[wasm_bindgen]
pub fn build_case(input: JsValue) -> Result<JsValue, JsValue> {
    let ir: PreparedCase = deserialize(input)?;
    let result = build_case_data(ir).map_err(js_error)?;
    case_result_to_js(result)
}

#[wasm_bindgen]
pub fn build_assembly(input: JsValue) -> Result<JsValue, JsValue> {
    let ir: PreparedAssembly = deserialize(input)?;
    let result = build_assembly_data(ir).map_err(js_error)?;
    case_result_to_js(result)
}

/// Mesh-only generation; STEP serialization is reserved for export.
#[wasm_bindgen]
pub fn preview_body(
    input: JsValue,
    key: String,
    progress: js_sys::Function,
) -> Result<JsValue, JsValue> {
    let ir: PreparedCase = deserialize(input)?;
    if let Some(mesh) = PREVIEW_CACHE.with(|cache| {
        cache
            .borrow()
            .iter()
            .find(|entry| entry.key == key)
            .map(|entry| entry.mesh.clone())
    }) {
        return mesh_to_js(mesh);
    }
    let mut solids = Vec::new();
    let mut mesh = MeshData {
        positions: Vec::new(),
        normals: Vec::new(),
    };
    for (index, region) in ir.regions.iter().enumerate() {
        progress.call2(
            &JsValue::NULL,
            &JsValue::from_str("building"),
            &JsValue::from_f64(index as f64),
        )?;
        let entry = cached_region(&ir.body, region, || {
            progress
                .call2(
                    &JsValue::NULL,
                    &JsValue::from_str("tessellating"),
                    &JsValue::from_f64(index as f64),
                )
                .map(|_| ())
                .map_err(|_| "Progress callback failed".to_string())
        })
        .map_err(js_error)?;
        solids.extend(entry.solids);
        mesh.positions.extend(entry.mesh.positions);
        mesh.normals.extend(entry.mesh.normals);
    }
    let result = mesh_to_js(mesh.clone())?;
    PREVIEW_CACHE.with(|cache| {
        let mut cache = cache.borrow_mut();
        cache.push_back(CachedBody { key, solids, mesh });
        while cache.len() > 64
            || cache
                .iter()
                .map(|body| body.mesh.positions.len() * 8)
                .sum::<usize>()
                > 64 * 1024 * 1024
        {
            cache.pop_front();
        }
    });
    Ok(result)
}

fn cached_region(
    body: &CaseBody,
    region: &PreparedRegion,
    tessellating: impl FnOnce() -> Result<(), String>,
) -> Result<CachedBody, String> {
    let key = format!(
        "{:?}",
        (
            &body.kind,
            body.thickness,
            body.z,
            body.wall_height,
            &body
                .openings
                .iter()
                .flatten()
                .filter(|opening| opening_intersects_region(body, region, opening))
                .collect::<Vec<_>>(),
            &body.gasket,
            region
        )
    );
    let cached = REGION_CACHE.with(|cache| {
        let mut cache = cache.borrow_mut();
        let index = cache.iter().position(|entry| entry.key == key)?;
        let entry = cache.remove(index)?;
        cache.push_back(entry.clone());
        Some(entry)
    });
    if let Some(entry) = cached {
        return Ok(entry);
    }
    let solids = build_region(body, region)?;
    tessellating()?;
    let mesh = mesh_data(&solids)?;
    let entry = CachedBody { key, solids, mesh };
    REGION_CACHE.with(|cache| {
        let mut cache = cache.borrow_mut();
        cache.push_back(entry.clone());
        while cache.len() > 96
            || cache
                .iter()
                .map(|body| body.mesh.positions.len() * 8)
                .sum::<usize>()
                > 32 * 1024 * 1024
        {
            cache.pop_front();
        }
    });
    Ok(entry)
}

#[wasm_bindgen]
pub fn export_cached_assembly(input: JsValue, keys: JsValue) -> Result<JsValue, JsValue> {
    let ir: PreparedAssembly = deserialize(input)?;
    let keys: Vec<String> = deserialize(keys)?;
    if keys.len() != ir.bodies.len() {
        return Err(js_error("Invalid CAD cache keys"));
    }
    let mut solids = Vec::new();
    let mut bodies = Vec::new();
    for (body, key) in ir.bodies.iter().zip(keys) {
        let cached = PREVIEW_CACHE.with(|cache| {
            let mut cache = cache.borrow_mut();
            let index = cache.iter().position(|entry| entry.key == key)?;
            cache.remove(index)
        });
        let entry = if let Some(entry) = cached {
            entry
        } else {
            let solids = build_body(body).map_err(js_error)?;
            let mesh = mesh_data(&solids).map_err(js_error)?;
            CachedBody { key, solids, mesh }
        };
        // Solid clones remain inside the CAD worker; only triangle buffers cross its boundary.
        solids.extend(entry.solids.iter().cloned());
        bodies.push(BodyMeshData {
            id: body.body.id.clone(),
            name: body.body.name.clone(),
            mesh: entry.mesh.clone(),
        });
        PREVIEW_CACHE.with(|cache| {
            let mut cache = cache.borrow_mut();
            cache.push_back(entry);
            while cache.len() > 64
                || cache
                    .iter()
                    .map(|body| body.mesh.positions.len() * 8)
                    .sum::<usize>()
                    > 64 * 1024 * 1024
            {
                cache.pop_front();
            }
        });
    }
    case_result_to_js(export_case(solids, ir.revision, Some(bodies)).map_err(js_error)?)
}

#[wasm_bindgen]
pub fn read_step_model(bytes: Uint8Array) -> Result<JsValue, JsValue> {
    let result = read_step_model_data(bytes.to_vec()).map_err(js_error)?;
    step_model_to_js(result)
}

fn deserialize<T: for<'de> Deserialize<'de>>(input: JsValue) -> Result<T, JsValue> {
    serde_wasm_bindgen::from_value(input)
        .map_err(|error| js_error(format!("Invalid CAD input: {error}")))
}

fn js_error(message: impl ToString) -> JsValue {
    JsValue::from_str(&message.to_string())
}

fn set(target: &Object, key: &str, value: &JsValue) -> Result<(), JsValue> {
    Reflect::set(target, &JsValue::from_str(key), value)?;
    Ok(())
}

fn mesh_to_js(mesh: MeshData) -> Result<JsValue, JsValue> {
    let value = Object::new();
    set(
        &value,
        "positions",
        &Float32Array::from(mesh.positions.as_slice()),
    )?;
    set(
        &value,
        "normals",
        &Float32Array::from(mesh.normals.as_slice()),
    )?;
    Ok(value.into())
}

fn case_result_to_js(result: CaseResultData) -> Result<JsValue, JsValue> {
    let value = Object::new();
    set(
        &value,
        "revision",
        &JsValue::from_f64(result.revision as f64),
    )?;
    set(&value, "step", &Uint8Array::from(result.step.as_slice()))?;
    set(&value, "mesh", &mesh_to_js(result.mesh)?)?;

    if let Some(body_data) = result.bodies {
        let bodies = js_sys::Array::new();
        for body in body_data {
            let value = Object::new();
            set(&value, "id", &JsValue::from_str(&body.id))?;
            set(&value, "name", &JsValue::from_str(&body.name))?;
            set(
                &value,
                "positions",
                &Float32Array::from(body.mesh.positions.as_slice()),
            )?;
            set(
                &value,
                "normals",
                &Float32Array::from(body.mesh.normals.as_slice()),
            )?;
            bodies.push(&value);
        }
        set(&value, "bodies", &bodies)?;
    }

    Ok(value.into())
}

fn step_model_to_js(model: StepModelData) -> Result<JsValue, JsValue> {
    let value = Object::new();
    set(&value, "mesh", &mesh_to_js(model.mesh)?)?;
    let bounds = Object::new();
    set(
        &bounds,
        "min",
        &serde_wasm_bindgen::to_value(&model.min).map_err(js_error)?,
    )?;
    set(
        &bounds,
        "max",
        &serde_wasm_bindgen::to_value(&model.max).map_err(js_error)?,
    )?;
    set(&value, "bounds", &bounds)?;
    Ok(value.into())
}

fn build_case_data(ir: PreparedCase) -> Result<CaseResultData, String> {
    if ir.regions.is_empty() {
        return Err("Case requires at least one prepared region".into());
    }
    let revision = ir.revision;
    let solids = build_body(&ir)?;
    export_case(solids, revision, None)
}

fn build_assembly_data(ir: PreparedAssembly) -> Result<CaseResultData, String> {
    if ir.bodies.is_empty() {
        return Err("Case assembly requires at least one body".into());
    }

    let revision = ir.revision;
    let mut solids = Vec::new();
    let mut meshes = Vec::with_capacity(ir.bodies.len());
    for body in &ir.bodies {
        if body.revision != revision {
            return Err("Case assembly contains a stale body revision".into());
        }
        if body.regions.is_empty() {
            return Err("Case requires at least one prepared region".into());
        }
        let body_solids = build_body(body)?;
        meshes.push(BodyMeshData {
            id: body.body.id.clone(),
            name: body.body.name.clone(),
            mesh: mesh_data(&body_solids)?,
        });
        solids.extend(body_solids);
    }

    export_case(solids, revision, Some(meshes))
}

fn build_body(ir: &PreparedCase) -> Result<Vec<Solid>, String> {
    let mut solids = Vec::new();
    for region in &ir.regions {
        solids.extend(build_region(&ir.body, region)?);
    }
    if solids.is_empty() {
        return Err("OpenCascade returned an empty case solid".into());
    }
    Ok(solids)
}

fn build_region(body: &CaseBody, region: &PreparedRegion) -> Result<Vec<Solid>, String> {
    let base_z = body.z.unwrap_or(0.0);
    let wall_height = if body.kind == CaseKind::Plate {
        0.0
    } else {
        body.wall_height.unwrap_or(0.0)
    };
    let total_height = body.thickness + wall_height;
    if !base_z.is_finite() || !total_height.is_finite() || total_height <= 0.0 {
        return Err("Case body has invalid height or elevation".into());
    }

    let mut edges = polygon_edges(&region.outer, base_z)?;
    for hole in &region.holes {
        edges.extend(polygon_edges(hole, base_z)?);
    }
    // Cadrum extrudes the first loop with all following loops as holes in one operation.
    let mut solids = vec![Solid::extrude(&edges, DVec3::Z * total_height).map_err(cadrum_error)?];

    if body.kind != CaseKind::Plate {
        let cavity_z = if body.kind == CaseKind::Tray {
            base_z + body.thickness
        } else {
            base_z
        };
        for cavity in &region.cavities {
            subtract(&mut solids, make_prism(cavity, cavity_z, wall_height)?)?;
        }

        for gasket in &region.gaskets {
            let depth = body
                .gasket
                .as_ref()
                .map(|gasket| gasket.depth)
                .ok_or_else(|| "Prepared gasket has no body gasket dimensions".to_string())?;
            let groove_z = if body.kind == CaseKind::Tray {
                base_z + total_height - depth
            } else {
                base_z
            };
            let mut groove = vec![make_prism(&gasket.outer, groove_z, depth)?];
            for hole in &gasket.holes {
                subtract(&mut groove, make_prism(hole, groove_z, depth)?)?;
            }
            for cutter in groove {
                subtract(&mut solids, cutter)?;
            }
        }
    }

    for mount in &region.mounts {
        if mount.kind == MountKind::Boss {
            let boss_height = mount
                .height
                .ok_or_else(|| "Boss mount has no height".to_string())?;
            let boss_diameter = mount
                .boss_diameter
                .ok_or_else(|| "Boss mount has no diameter".to_string())?;
            let boss_z = if body.kind == CaseKind::Lid {
                base_z + wall_height - boss_height
            } else {
                base_z + body.thickness
            };
            fuse(
                &mut solids,
                make_cylinder(&mount.at, boss_z, boss_diameter, boss_height)?,
            )?;
        }
        subtract(
            &mut solids,
            make_cylinder(&mount.at, base_z, mount.hole_diameter, total_height)?,
        )?;
    }

    if let Some(openings) = &body.openings {
        let cutters = openings
            .iter()
            .filter(|opening| opening_intersects_region(body, region, opening))
            .map(|opening| make_prism(&opening.points, opening.z, opening.height))
            .collect::<Result<Vec<_>, _>>()?;
        subtract_many(&mut solids, &cutters)?;
    }

    Ok(solids)
}

fn opening_intersects_region(
    body: &CaseBody,
    region: &PreparedRegion,
    opening: &CaseOpening,
) -> bool {
    if opening.points.len() < 3
        || !opening.z.is_finite()
        || !opening.height.is_finite()
        || opening.height <= 0.
        || opening
            .points
            .iter()
            .any(|p| !p.x.is_finite() || !p.y.is_finite())
    {
        return true;
    }
    let base = body.z.unwrap_or(0.);
    let height = body.thickness
        + if body.kind == CaseKind::Plate {
            0.
        } else {
            body.wall_height.unwrap_or(0.)
        };
    if opening.z >= base + height || opening.z + opening.height <= base {
        return false;
    }
    let bounds = |points: &[Vec2]| {
        points.iter().fold(
            [
                f64::INFINITY,
                f64::INFINITY,
                f64::NEG_INFINITY,
                f64::NEG_INFINITY,
            ],
            |b, p| [b[0].min(p.x), b[1].min(p.y), b[2].max(p.x), b[3].max(p.y)],
        )
    };
    let a = bounds(&region.outer);
    let b = bounds(&opening.points);
    a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1]
}

fn polygon_edges(points: &[Vec2], z: f64) -> Result<Vec<Edge>, String> {
    if points.len() < 3
        || !z.is_finite()
        || points.iter().any(|p| !p.x.is_finite() || !p.y.is_finite())
    {
        return Err("Case feature has an invalid polygon".into());
    }
    Edge::polygon(
        &points
            .iter()
            .map(|p| DVec3::new(p.x, p.y, z))
            .collect::<Vec<_>>(),
    )
    .map_err(cadrum_error)
}

fn subtract_many(solids: &mut Vec<Solid>, cutters: &[Solid]) -> Result<(), String> {
    if cutters.is_empty() {
        return Ok(());
    }
    let mut result = Vec::new();
    for solid in solids.iter() {
        let expression = cutters
            .iter()
            .fold(Boolean::from(solid), |expression, cutter| {
                expression - cutter
            });
        result.extend(expression.build_vec().map_err(cadrum_error)?);
    }
    if result.is_empty() {
        return Err("OpenCascade subtraction removed the whole case solid".into());
    }
    *solids = result;
    Ok(())
}

fn make_prism(points: &[Vec2], z: f64, height: f64) -> Result<Solid, String> {
    if points.len() < 3 || !z.is_finite() || !height.is_finite() || height <= 0.0 {
        return Err("Case feature has an invalid polygon or extrusion height".into());
    }
    let vertices: Vec<DVec3> = points
        .iter()
        .map(|point| DVec3::new(point.x, point.y, z))
        .collect();
    if vertices.iter().any(|point| !point.is_finite()) {
        return Err("Case feature contains a non-finite coordinate".into());
    }
    let edges = Edge::polygon(&vertices).map_err(cadrum_error)?;
    Solid::extrude(&edges, DVec3::Z * height).map_err(cadrum_error)
}

fn make_cylinder(at: &Vec2, z: f64, diameter: f64, height: f64) -> Result<Solid, String> {
    if !at.x.is_finite()
        || !at.y.is_finite()
        || !z.is_finite()
        || !diameter.is_finite()
        || diameter <= 0.0
        || !height.is_finite()
        || height <= 0.0
    {
        return Err("Case mount has invalid cylinder dimensions".into());
    }
    Ok(Solid::cylinder(diameter / 2.0, DVec3::Z * height).translate(DVec3::new(at.x, at.y, z)))
}

fn subtract(solids: &mut Vec<Solid>, tool: Solid) -> Result<(), String> {
    let mut result = Vec::new();
    for solid in solids.drain(..) {
        result.extend(
            (Boolean::from(&solid) - &tool)
                .build_vec()
                .map_err(cadrum_error)?,
        );
    }
    if result.is_empty() {
        return Err("OpenCascade subtraction removed the whole case solid".into());
    }
    *solids = result;
    Ok(())
}

fn fuse(solids: &mut Vec<Solid>, tool: Solid) -> Result<(), String> {
    let expression = solids
        .iter()
        .map(Boolean::from)
        .reduce(|left, right| left + right)
        .ok_or_else(|| "OpenCascade could not join an empty case solid".to_string())?;
    *solids = (expression + Boolean::from(&tool))
        .build_vec()
        .map_err(cadrum_error)?;
    if solids.is_empty() {
        return Err("OpenCascade returned an empty fused case solid".into());
    }
    Ok(())
}

fn export_case(
    solids: Vec<Solid>,
    revision: u64,
    bodies: Option<Vec<BodyMeshData>>,
) -> Result<CaseResultData, String> {
    if solids.is_empty() {
        return Err("OpenCascade returned an empty case solid".into());
    }
    let mut step = Vec::new();
    Solid::write_step(&solids, &mut step)
        .map_err(|error| format!("OpenCascade STEP export failed: {error}"))?;
    let mesh = if let Some(bodies) = &bodies {
        MeshData {
            positions: bodies
                .iter()
                .flat_map(|body| body.mesh.positions.iter().copied())
                .collect(),
            normals: bodies
                .iter()
                .flat_map(|body| body.mesh.normals.iter().copied())
                .collect(),
        }
    } else {
        mesh_data(&solids)?
    };
    Ok(CaseResultData {
        revision,
        step,
        mesh,
        bodies,
    })
}

fn read_step_model_data(bytes: Vec<u8>) -> Result<StepModelData, String> {
    if bytes.is_empty() || bytes.len() > MAX_STEP_BYTES {
        return Err("STEP import failed: invalid file size".into());
    }
    let mut reader = std::io::Cursor::new(bytes);
    let solids =
        Solid::read_step(&mut reader).map_err(|error| format!("STEP import failed: {error}"))?;
    if solids.is_empty() {
        return Err("STEP import failed: empty shape".into());
    }

    let mut min = DVec3::splat(f64::INFINITY);
    let mut max = DVec3::splat(f64::NEG_INFINITY);
    for solid in &solids {
        let [solid_min, solid_max] = solid.bounding_box();
        min = min.min(solid_min);
        max = max.max(solid_max);
    }
    if !min.is_finite() || !max.is_finite() || min.cmpgt(max).any() {
        return Err("STEP import failed: invalid bounds".into());
    }

    Ok(StepModelData {
        mesh: mesh_data(&solids).map_err(|error| format!("STEP import failed: {error}"))?,
        min: min.to_array(),
        max: max.to_array(),
        #[cfg(test)]
        solid_count: solids.len(),
    })
}

fn mesh_data(solids: &[Solid]) -> Result<MeshData, String> {
    let mesh = Solid::mesh(solids, MESH_OPTIONS).map_err(cadrum_error)?;
    mesh_to_data(&mesh)
}

fn mesh_to_data(mesh: &Mesh) -> Result<MeshData, String> {
    if mesh.indices.is_empty()
        || mesh.indices.len() % 3 != 0
        || mesh.normals.len() != mesh.vertices.len()
    {
        return Err("OpenCascade returned an invalid case mesh".into());
    }
    let mut positions = Vec::with_capacity(mesh.indices.len() * 3);
    let mut normals = Vec::with_capacity(mesh.indices.len() * 3);
    for &index in &mesh.indices {
        let position = mesh
            .vertices
            .get(index)
            .ok_or_else(|| "Cadrum mesh index is out of bounds".to_string())?;
        let normal = mesh
            .normals
            .get(index)
            .ok_or_else(|| "Cadrum mesh normal index is out of bounds".to_string())?;
        for value in position.to_array() {
            if !value.is_finite() || (value as f32).is_infinite() {
                return Err("OpenCascade returned a non-finite case mesh".into());
            }
            positions.push(value as f32);
        }
        for value in normal.to_array() {
            if !value.is_finite() || (value as f32).is_infinite() {
                return Err("OpenCascade returned a non-finite case mesh".into());
            }
            normals.push(value as f32);
        }
    }
    if positions.is_empty() || positions.len() != normals.len() {
        return Err("OpenCascade returned an empty case mesh".into());
    }
    Ok(MeshData { positions, normals })
}

fn cadrum_error(error: impl ToString) -> String {
    format!("OpenCascade CAD operation failed: {}", error.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn square(min: f64, max: f64) -> Vec<Vec2> {
        vec![
            Vec2 { x: min, y: min },
            Vec2 { x: max, y: min },
            Vec2 { x: max, y: max },
            Vec2 { x: min, y: max },
        ]
    }

    #[test]
    fn changing_one_region_does_not_retessellate_the_unchanged_region() {
        REGION_CACHE.with(|cache| cache.borrow_mut().clear());
        let mut body = CaseBody {
            id: "case".into(),
            name: "Case".into(),
            kind: CaseKind::Plate,
            thickness: 2.,
            z: None,
            wall_height: None,
            openings: None,
            gasket: None,
        };
        let left = PreparedRegion {
            outer: square(0., 20.),
            holes: vec![],
            cavities: vec![],
            gaskets: vec![],
            mounts: vec![],
        };
        let right = PreparedRegion {
            outer: square(30., 50.),
            holes: vec![],
            cavities: vec![],
            gaskets: vec![],
            mounts: vec![],
        };
        let tessellations = std::cell::Cell::new(0);
        let notify = || {
            tessellations.set(tessellations.get() + 1);
            Ok(())
        };
        cached_region(&body, &left, notify).unwrap();
        cached_region(&body, &right, notify).unwrap();
        assert_eq!(tessellations.get(), 2);
        body.openings = Some(vec![CaseOpening {
            points: square(35., 40.),
            z: 0.,
            height: 2.,
        }]);
        cached_region(&body, &left, notify).unwrap();
        assert_eq!(
            tessellations.get(),
            2,
            "An opening in the other half must not invalidate this half"
        );
        let modified = cached_region(&body, &right, notify).unwrap();
        assert_eq!(tessellations.get(), 3);
        assert!((modified.solids.iter().map(Solid::volume).sum::<f64>() - 750.).abs() < 0.01);
    }

    #[test]
    fn builds_and_roundtrips_a_holed_plate() {
        let ir = PreparedCase {
            revision: 7,
            body: CaseBody {
                id: "case".into(),
                name: "plate".into(),
                kind: CaseKind::Plate,
                thickness: 2.0,
                z: None,
                wall_height: None,
                openings: None,
                gasket: None,
            },
            regions: vec![PreparedRegion {
                outer: square(0.0, 20.0),
                holes: vec![square(5.0, 15.0)],
                cavities: vec![],
                gaskets: vec![],
                mounts: vec![],
            }],
        };
        let result = build_case_data(ir).expect("valid holed plate");
        assert_eq!(result.revision, 7);
        assert!(!result.step.is_empty());
        assert!(!result.mesh.positions.is_empty());
        assert_eq!(result.mesh.positions.len(), result.mesh.normals.len());
        let mut reader = std::io::Cursor::new(result.step);
        let imported = Solid::read_step(&mut reader).expect("STEP reimport");
        assert_eq!(imported.len(), 1);
        assert!((imported[0].volume() - 600.0).abs() < 0.1);
    }

    #[test]
    fn reads_transformed_multi_solid_component_step_in_millimeters() {
        let bytes = include_bytes!("../../../ergogen/library/vendor/infused-kim/3d_models/trackpoint/TP_Red_T460S_platform_z_offset_+0.0_pcb_offset_-2.0.step");
        let model = read_step_model_data(bytes.to_vec()).expect("valid component STEP");

        assert_eq!(model.solid_count, 63);
        assert!((model.min[0] - -6.25).abs() < 0.01);
        assert!((model.min[1] - -21.7).abs() < 0.01);
        assert!((model.min[2] - -5.1).abs() < 0.01);
        assert!((model.max[0] - 37.8205).abs() < 0.01);
        assert!((model.max[1] - 12.5).abs() < 0.01);
        assert!((model.max[2] - 1.2).abs() < 0.01);
        assert!(model.mesh.positions.len() > 10_000);
        assert_eq!(model.mesh.positions.len(), model.mesh.normals.len());
        for normal in model.mesh.normals.chunks_exact(3) {
            let length = normal
                .iter()
                .map(|value| f64::from(*value).powi(2))
                .sum::<f64>()
                .sqrt();
            assert!((length - 1.0).abs() < 0.001);
        }
    }
}
