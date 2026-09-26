use super::*;
use std::cell::RefCell;
use std::collections::VecDeque;

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
        let bytes = include_bytes!(concat!(env!("CARGO_MANIFEST_DIR"), "/../../ergogen/library/vendor/infused-kim/3d_models/trackpoint/TP_Red_T460S_platform_z_offset_+0.0_pcb_offset_-2.0.step"));
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
