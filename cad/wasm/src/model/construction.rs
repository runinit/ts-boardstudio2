use super::*;

mod cache;
pub use cache::{export_cached_assembly, preview_body};

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
