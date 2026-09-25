//! Stateless mechanical assembly resolution. Explicit profiles are the geometry authority.
use crate::model::*;

pub fn resolve(document: &ProjectDoc, contours: &[Contour]) -> MechanicalAssembly {
    let mut result = MechanicalAssembly {
        pcb_reference: None,
        suggested_mounts: vec![],
        nominal_plate_contours: vec![],
        revision: document.revision,
        plate_contours: contours.to_vec(),
        case: CaseAssemblyIR {
            revision: document.revision,
            bodies: vec![],
        },
        stack: vec![],
        diagnostics: vec![],
    };
    let Some(config) = &document.mechanical else {
        return result;
    };
    // Switch engagement owns stack spacing; the persisted scalar is only an initial
    // value for assemblies without a selected switch profile.
    let mut effective_config = config.clone();
    if let Some(board) = document
        .boards
        .iter()
        .find(|board| board.id == config.board_id)
    {
        if let Some(profile) = document
            .parts
            .iter()
            .filter(|part| board.part_ids.contains(&part.id))
            .filter(|part| {
                document.definitions.iter().any(|definition| {
                    definition.id == part.definition_id && definition.kind == PartKind::Switch
                })
            })
            .find_map(|part| {
                config
                    .profiles
                    .iter()
                    .find(|profile| profile.definition_id == part.definition_id)
            })
        {
            effective_config.plate_to_pcb = profile.plate_to_pcb;
        }
    }
    let config = &effective_config;
    let mut frame_contours = contours.to_vec();
    if config.wall_thickness.is_finite()
        && config.clearance.is_finite()
        && config.wall_thickness > 0.0
        && config.clearance >= 0.0
    {
        match expanded_outline(
            contours,
            config.wall_thickness + config.clearance,
            document.revision,
        ) {
            Ok(expanded) => {
                frame_contours = expanded;
                result.plate_contours = frame_contours.clone();
            }
            Err(message) => result.diagnostics.push(Finding {
                id: "mechanical:frame-outline".into(),
                severity: Severity::Error,
                scope: Scope::Case,
                message,
                target_ids: vec![],
            }),
        }
    }
    let mut pcb_reference_contours = contours.to_vec();
    let mut component_volumes: Vec<(String, CaseOpening)> = Vec::new();
    let mut profile_openings = Vec::new();
    let mut foam_clearances = Vec::new();
    let mut issue = |id: &str, severity: Severity, message: &str, targets: Vec<String>| {
        result.diagnostics.push(Finding {
            id: format!("mechanical:{id}"),
            severity,
            scope: Scope::Case,
            message: message.into(),
            target_ids: targets,
        });
    };
    let dimensions = [
        config.plate_thickness,
        config.pcb_thickness,
        config.bottom_thickness,
        config.wall_thickness,
        config.plate_to_pcb,
    ];
    let clearances = [
        config.plate_foam_thickness,
        config.bottom_foam_thickness,
        config.battery_height,
        config.clearance,
    ];
    if dimensions.iter().any(|v| !v.is_finite() || *v <= 0.0)
        || clearances.iter().any(|v| !v.is_finite() || *v < 0.0)
    {
        issue(
            "dimensions",
            Severity::Error,
            "Assembly thicknesses must be positive and clearances nonnegative finite millimetres.",
            vec![],
        );
        return result;
    }
    if contours.iter().any(|c| {
        c.points.len() < 3
            || c.points
                .iter()
                .any(|p| !p.x.is_finite() || !p.y.is_finite())
    }) {
        issue(
            "contours",
            Severity::Error,
            "Assembly contours must contain finite closed polygons.",
            vec![],
        );
        return result;
    }
    if config
        .mounts
        .iter()
        .chain(config.closure_mounts.iter().flatten())
        .any(|m| {
            !m.at.x.is_finite()
                || !m.at.y.is_finite()
                || !m.hole_diameter.is_finite()
                || m.hole_diameter <= 0.0
        })
    {
        issue(
            "mount-geometry",
            Severity::Error,
            "Mount positions and diameters must be finite and diameters positive.",
            vec![],
        );
        return result;
    }
    if contours.is_empty() {
        issue(
            "outline",
            Severity::Error,
            "An assembly requires a resolved board outline.",
            vec![],
        );
    }
    if config.plate_foam_thickness > config.plate_to_pcb {
        issue(
            "foam-engagement",
            Severity::Error,
            "Plate foam exceeds the plate-to-PCB clearance.",
            vec!["plate-foam".into()],
        );
    }
    if config.integrated_plate_frame && config.method == PlateMethod::PcbFr4 {
        issue(
            "fr4-integrated-frame",
            Severity::Error,
            "A planar PCB-FR4 plate cannot encode an integrated case rim.",
            vec!["plate".into()],
        );
    }
    if config.integrated_plate_frame && config.mount == MechanicalMount::Gasket {
        issue(
            "gasket-rigid-frame",
            Severity::Error,
            "A gasket plate must remain mechanically separate from the rigid frame.",
            vec!["plate".into()],
        );
    }
    if config.mount == MechanicalMount::Gasket
        && !config.gasket_travel.is_some_and(|travel| {
            travel.is_finite() && travel > 0.0 && travel < config.plate_to_pcb
        })
    {
        issue(
            "gasket-travel",
            Severity::Error,
            "Gasket mounting requires positive travel smaller than the plate-to-PCB clearance, keeping the plate clear of the rigid rim.",
            vec!["plate".into()],
        );
    }
    if config.mount == MechanicalMount::Gasket && config.gasket.is_none() {
        issue(
            "gasket-support",
            Severity::Error,
            "Gasket support seats and travel clearance are not yet specified; manufacturing export is blocked.",
            vec!["plate".into()],
        );
    }
    if config.mounts.is_empty() && config.mount != MechanicalMount::Gasket {
        issue(
            "mounts",
            Severity::Warning,
            "No mounting points are configured; choose supported mounting locations before manufacturing.",
            vec![],
        );
    }
    if config.method == PlateMethod::PcbFr4 {
        issue(
            "fr4-routing",
            Severity::Warning,
            "Sharp internal rectangular corners require a reviewed routing radius; PCB process capability is not implied by a valid plate outline.",
            vec!["plate".into()],
        );
    }
    let Some(board) = document
        .boards
        .iter()
        .find(|board| board.id == config.board_id)
    else {
        issue(
            "board",
            Severity::Error,
            "Select an existing board for the mechanical assembly.",
            vec![],
        );
        return result;
    };
    let mut seen_stabilizers = std::collections::BTreeSet::new();
    for stabilizer in config.stabilizers.iter().flatten() {
        if !seen_stabilizers.insert(&stabilizer.part_id)
            || !board.part_ids.contains(&stabilizer.part_id)
            || !document.parts.iter().any(|p| p.id == stabilizer.part_id)
            || !stabilizer.units.is_finite()
            || stabilizer.units <= 0.0
            || stabilizer.rotation.is_some_and(|v| !v.is_finite())
        {
            issue(
                &format!("stabilizer-override:{}", stabilizer.part_id),
                Severity::Error,
                "Stabilizer overrides require a unique existing board part, positive finite units and finite rotation.",
                vec![stabilizer.part_id.clone()],
            );
        }
    }
    for part in document
        .parts
        .iter()
        .filter(|part| board.part_ids.contains(&part.id))
    {
        let Some(profile) = config
            .profiles
            .iter()
            .find(|p| p.definition_id == part.definition_id)
        else {
            if document
                .definitions
                .iter()
                .any(|d| d.id == part.definition_id && d.kind == PartKind::Switch)
            {
                issue(
                    &format!("profile:{}", part.id),
                    Severity::Error,
                    "Switch has no qualified mechanical profile; no cutout was guessed.",
                    vec![part.id.clone()],
                );
            }
            continue;
        };
        let is_switch = document
            .definitions
            .iter()
            .any(|d| d.id == part.definition_id && d.kind == PartKind::Switch);
        let has_access = profile.openings.as_ref().is_some_and(|v| !v.is_empty())
            || profile.clearances.as_ref().is_some_and(|v| !v.is_empty())
            || profile
                .clearance_volumes
                .as_ref()
                .is_some_and(|v| !v.is_empty());
        if (profile.cutouts.is_empty() && (is_switch || !has_access))
            || profile.source.trim().is_empty()
        {
            issue(
                &format!("profile-empty:{}", part.id),
                Severity::Error,
                "Mechanical profile requires cutout geometry and source provenance.",
                vec![part.id.clone()],
            );
        }
        if !part.pose.at.x.is_finite()
            || !part.pose.at.y.is_finite()
            || !part.pose.rotation.is_finite()
        {
            issue(
                &format!("pose:{}", part.id),
                Severity::Error,
                "Mechanical part pose must be finite.",
                vec![part.id.clone()],
            );
            continue;
        }
        if !profile.plate_to_pcb.is_finite()
            || (profile.plate_to_pcb - config.plate_to_pcb).abs() > 0.001
        {
            issue(
                &format!("engagement:{}", part.id),
                Severity::Error,
                "Selected mechanical profiles have incompatible plate-to-PCB engagement distances.",
                vec![part.id.clone()],
            );
        }
        if let Some(range) = profile.supported_thickness {
            if !range.x.is_finite()
                || !range.y.is_finite()
                || range.x <= 0.0
                || range.y < range.x
                || config.plate_thickness < range.x
                || config.plate_thickness > range.y
            {
                issue(
                    &format!("thickness:{}", part.id),
                    Severity::Error,
                    "Plate thickness is outside this profile's supported range.",
                    vec![part.id.clone()],
                );
            }
        } else {
            issue(
                &format!("qualification:{}", part.id),
                Severity::Warning,
                "Profile plate thickness compatibility has not been qualified.",
                vec![part.id.clone()],
            );
        }
        let mut polygons = profile.cutouts.clone();
        let mut pcb_holes = profile.pcb_holes.clone().unwrap_or_default();
        let stabilizer = config
            .stabilizers
            .iter()
            .flatten()
            .find(|s| s.part_id == part.id);
        if let Some(stabilizer) = stabilizer {
            if stabilizer.kind == MechanicalStabilizerKind::PlateMount {
                if let Some(custom) = &stabilizer.profile {
                    if custom.cutouts.is_empty()
                        || custom.source.trim().is_empty()
                        || !custom.plate_to_pcb.is_finite()
                        || (custom.plate_to_pcb - config.plate_to_pcb).abs() > 0.001
                    {
                        issue(
                            &format!("plate-stabilizer:{}", part.id),
                            Severity::Error,
                            "Custom plate-mount profile requires source geometry and matching engagement.",
                            vec![part.id.clone()],
                        );
                    } else {
                        let (sin, cos) = stabilizer.rotation.unwrap_or(0.0).to_radians().sin_cos();
                        polygons.extend(custom.cutouts.iter().map(|polygon| {
                            polygon
                                .iter()
                                .map(|p| Vec2 {
                                    x: p.x * cos - p.y * sin,
                                    y: p.x * sin + p.y * cos,
                                })
                                .collect::<Vec<_>>()
                        }));
                        issue(
                            &format!("custom-stabilizer:{}", part.id),
                            Severity::Warning,
                            "Custom plate-mount geometry requires supplier review; compatibility has not been qualified.",
                            vec![part.id.clone()],
                        );
                    }
                } else {
                    issue(
                        &format!("plate-stabilizer:{}", part.id),
                        Severity::Error,
                        "Plate-mount stabilizer requires an explicit custom profile; PCB-mount geometry cannot substitute.",
                        vec![part.id.clone()],
                    );
                }
            } else if stabilizer.kind == MechanicalStabilizerKind::PcbMount {
                let source = if (stabilizer.units - 2.0).abs() < 0.001 {
                    Some(MechanicalBuiltinProfile::MxStab2u)
                } else if (stabilizer.units - 6.25).abs() < 0.001 {
                    Some(MechanicalBuiltinProfile::MxStab625u)
                } else {
                    None
                };
                if let Some(source) = source {
                    match builtin_profile(part.definition_id.clone(), source, config.plate_to_pcb) {
                        Ok(stab) => {
                            let (sin, cos) =
                                stabilizer.rotation.unwrap_or(0.0).to_radians().sin_cos();
                            pcb_holes.extend(stab.pcb_holes.unwrap_or_default().into_iter().map(
                                |mut hole| {
                                    hole.at = Vec2 {
                                        x: hole.at.x * cos - hole.at.y * sin,
                                        y: hole.at.x * sin + hole.at.y * cos,
                                    };
                                    hole
                                },
                            ));
                            polygons.extend(stab.cutouts.into_iter().map(|polygon| {
                                polygon
                                    .into_iter()
                                    .map(|p| Vec2 {
                                        x: p.x * cos - p.y * sin,
                                        y: p.x * sin + p.y * cos,
                                    })
                                    .collect::<Vec<_>>()
                            }));
                        }
                        Err(message) => issue(
                            &format!("stabilizer-source:{}", part.id),
                            Severity::Error,
                            &message,
                            vec![part.id.clone()],
                        ),
                    }
                } else {
                    issue(
                        &format!("stabilizer-size:{}", part.id),
                        Severity::Error,
                        "No qualified stabilizer profile exists for this key size.",
                        vec![part.id.clone()],
                    );
                }
            }
        } else if part.keycap.is_some_and(|size| size.x.max(size.y) >= 37.0) {
            issue(
                &format!("stabilizer-proposal:{}", part.id),
                Severity::Warning,
                "Wide keycap needs a stabilizer decision: confirm key units and PCB-mount orientation; no cutout was guessed.",
                vec![part.id.clone()],
            );
        }
        let (sin, cos) = part.pose.rotation.to_radians().sin_cos();
        if let Some(source) = &profile.source_geometry {
            use sha2::{Digest, Sha256};
            let hash = format!("{:x}", Sha256::digest(source.text.as_bytes()));
            if hash != source.sha256 {
                issue(
                    &format!("source-hash:{}", part.id),
                    Severity::Error,
                    "Mechanical source hash does not match retained source text.",
                    vec![part.id.clone()],
                );
            }
        }
        for hole in &pcb_holes {
            if !hole.diameter.is_finite()
                || hole.diameter <= 0.0
                || !hole.at.x.is_finite()
                || !hole.at.y.is_finite()
            {
                issue(
                    &format!("pcb-hole:{}", part.id),
                    Severity::Error,
                    "PCB hole references require finite positions and positive diameters.",
                    vec![part.id.clone()],
                );
                continue;
            }
            let x = if part.side == Side::Back {
                -hole.at.x
            } else {
                hole.at.x
            };
            let at = Vec2 {
                x: part.pose.at.x + x * cos - hole.at.y * sin,
                y: part.pose.at.y + x * sin + hole.at.y * cos,
            };
            let points = (0..64)
                .map(|index| {
                    let angle = index as f64 * std::f64::consts::TAU / 64.0;
                    Vec2 {
                        x: at.x + hole.diameter / 2.0 * angle.cos(),
                        y: at.y + hole.diameter / 2.0 * angle.sin(),
                    }
                })
                .collect();
            let linked = document
                .definitions
                .iter()
                .find(|d| d.id == part.definition_id)
                .is_some_and(|definition| {
                    definition.pads.iter().any(|pad| {
                        pad.drill
                            .is_some_and(|diameter| (diameter - hole.diameter).abs() < 0.001)
                            && (pad.at.x - hole.at.x).abs() < 0.001
                            && (pad.at.y - hole.at.y).abs() < 0.001
                    })
                });
            if linked {
                pcb_reference_contours.push(Contour { hole: true, points });
            }
            if !linked {
                issue(
                    &format!("pcb-hole-link:{}:{}", part.id, hole.source_id),
                    if board.traces.is_empty() {
                        Severity::Warning
                    } else {
                        Severity::Error
                    },
                    "Mechanical mounting hole is not linked to a matching electrical PCB hole; the PCB remains unchanged.",
                    vec![part.id.clone()],
                );
            }
        }
        for volume in profile.clearance_volumes.iter().flatten() {
            let transformed = CaseOpening {
                z: volume.z,
                height: volume.height,
                points: volume
                    .points
                    .iter()
                    .map(|p| {
                        let x = if part.side == Side::Back { -p.x } else { p.x };
                        Vec2 {
                            x: part.pose.at.x + x * cos - p.y * sin,
                            y: part.pose.at.y + x * sin + p.y * cos,
                        }
                    })
                    .collect(),
            };
            if transformed.points.len() < 3
                || transformed
                    .points
                    .iter()
                    .any(|p| !p.x.is_finite() || !p.y.is_finite())
                || !volume.z.is_finite()
                || !volume.height.is_finite()
                || volume.height <= 0.0
            {
                issue(
                    &format!("clearance-volume:{}", part.id),
                    Severity::Error,
                    "Clearance volumes need finite polygons/Z and positive height.",
                    vec![part.id.clone()],
                );
            } else {
                component_volumes.push((part.id.clone(), transformed));
            }
        }
        for opening in profile.openings.iter().flatten() {
            profile_openings.push(CaseOpening {
                z: opening.z,
                height: opening.height,
                points: opening
                    .points
                    .iter()
                    .map(|p| {
                        let x = if part.side == Side::Back { -p.x } else { p.x };
                        Vec2 {
                            x: part.pose.at.x + x * cos - p.y * sin,
                            y: part.pose.at.y + x * sin + p.y * cos,
                        }
                    })
                    .collect(),
            });
        }
        for polygon in profile.clearances.iter().flatten() {
            if polygon.len() < 3 || polygon.iter().any(|p| !p.x.is_finite() || !p.y.is_finite()) {
                issue(
                    &format!("clearance:{}", part.id),
                    Severity::Error,
                    "Profile clearance geometry must be finite polygons.",
                    vec![part.id.clone()],
                );
            } else {
                foam_clearances.push(Contour {
                    hole: true,
                    points: polygon
                        .iter()
                        .map(|p| {
                            let x = if part.side == Side::Back { -p.x } else { p.x };
                            Vec2 {
                                x: part.pose.at.x + x * cos - p.y * sin,
                                y: part.pose.at.y + x * sin + p.y * cos,
                            }
                        })
                        .collect(),
                });
                issue(
                    &format!("access:{}", part.id),
                    Severity::Warning,
                    "Component clearance is excluded from plate foam; case wall access still requires review.",
                    vec![part.id.clone()],
                );
            }
        }
        for polygon in &polygons {
            if polygon.len() < 3 || polygon.iter().any(|p| !p.x.is_finite() || !p.y.is_finite()) {
                issue(
                    &format!("polygon:{}", part.id),
                    Severity::Error,
                    "Mechanical profile has an invalid polygon.",
                    vec![part.id.clone()],
                );
                continue;
            }
            let cutout = Contour {
                hole: true,
                points: polygon
                    .iter()
                    .map(|p| Vec2 {
                        x: part.pose.at.x
                            + (if part.side == Side::Back { -p.x } else { p.x }) * cos
                            - p.y * sin,
                        y: part.pose.at.y
                            + (if part.side == Side::Back { -p.x } else { p.x }) * sin
                            + p.y * cos,
                    })
                    .collect(),
            };
            if !result
                .plate_contours
                .iter()
                .any(|existing| same_ring(existing, &cutout))
            {
                result.plate_contours.push(cutout);
            }
        }
    }
    let battery_height = config
        .battery
        .as_ref()
        .map_or(config.battery_height, |b| b.size.z);
    let mut bottom_foam_contours = contours.to_vec();
    if let Some(battery) = &config.battery {
        if [battery.size.x, battery.size.y, battery.size.z]
            .iter()
            .any(|v| !v.is_finite() || *v <= 0.0)
        {
            issue(
                "battery-size",
                Severity::Error,
                "Battery dimensions must be positive finite millimetres.",
                vec!["battery".into()],
            );
            return result;
        }
        let margin = config.clearance;
        let hx = battery.size.x / 2.0 + margin;
        let hy = battery.size.y / 2.0 + margin;
        let envelope = vec![
            Vec2 {
                x: battery.at.x - hx,
                y: battery.at.y - hy,
            },
            Vec2 {
                x: battery.at.x + hx,
                y: battery.at.y - hy,
            },
            Vec2 {
                x: battery.at.x + hx,
                y: battery.at.y + hy,
            },
            Vec2 {
                x: battery.at.x - hx,
                y: battery.at.y + hy,
            },
        ];
        if ![
            battery.at.x,
            battery.at.y,
            battery.cable_exit.x,
            battery.cable_exit.y,
        ]
        .iter()
        .all(|v| v.is_finite())
            || envelope.iter().any(|p| !inside_outline(*p, contours))
            || !inside_outline(battery.cable_exit, contours)
        {
            issue(
                "battery-containment",
                Severity::Error,
                "Battery envelope or cable exit lies outside the assembly outline.",
                vec!["battery".into()],
            );
        }
        for mount in config
            .mounts
            .iter()
            .chain(config.closure_mounts.iter().flatten())
        {
            let radius = mount.boss_diameter.unwrap_or(mount.hole_diameter) / 2.0;
            if (mount.at.x - battery.at.x).abs() < hx + radius
                && (mount.at.y - battery.at.y).abs() < hy + radius
            {
                issue(
                    &format!("battery-mount:{}", mount.id),
                    Severity::Error,
                    "Mount overlaps the battery access envelope.",
                    vec!["battery".into(), mount.id.clone()],
                );
            }
        }
        let cable_width = battery.cable_width.unwrap_or(2.0);
        if !cable_width.is_finite() || cable_width <= 0.0 {
            issue(
                "battery-cable-width",
                Severity::Error,
                "Battery cable clearance width must be positive finite millimetres.",
                vec!["battery".into()],
            );
        } else {
            let clearance = cable_width / 2.0 + config.clearance;
            let mut access_points = envelope;
            for (x, y) in [
                (-clearance, -clearance),
                (clearance, -clearance),
                (clearance, clearance),
                (-clearance, clearance),
            ] {
                access_points.push(Vec2 {
                    x: battery.cable_exit.x + x,
                    y: battery.cable_exit.y + y,
                });
            }
            let access = convex_envelope(access_points);
            if access.iter().any(|point| !inside_outline(*point, contours)) {
                issue(
                    "battery-cable-containment",
                    Severity::Error,
                    "Battery cable clearance envelope crosses the assembly outline.",
                    vec!["battery".into()],
                );
            }
            bottom_foam_contours.push(Contour {
                points: access,
                hole: true,
            });
            issue(
                "battery-cable-envelope",
                Severity::Info,
                if battery.cable_width.is_none() {
                    "Bottom foam excludes a conservative battery-to-cable envelope using the default 2 mm cable width; review cable fit."
                } else {
                    "Bottom foam excludes a conservative battery-to-cable envelope using the configured cable width."
                },
                vec!["battery".into(), "bottom-foam".into()],
            );
        }
        issue(
            "battery-fit",
            Severity::Warning,
            "Battery envelope and cable exit require mechanical fit review; retention features are not generated.",
            vec!["battery".into()],
        );
    }
    // PCB top is the stable zero plane; layers below it have negative Z.
    let pcb_bottom = -config.pcb_thickness;
    let bottom_foam_z = pcb_bottom - config.bottom_foam_thickness;
    let battery_z = bottom_foam_z - battery_height;
    let bottom_z = battery_z - config.bottom_thickness;
    for (id, z, thickness) in [
        ("plate", config.plate_to_pcb, config.plate_thickness),
        ("plate-foam", 0.0, config.plate_foam_thickness),
        ("pcb", pcb_bottom, config.pcb_thickness),
        ("bottom-foam", bottom_foam_z, config.bottom_foam_thickness),
        ("battery", battery_z, battery_height),
        ("bottom", bottom_z, config.bottom_thickness),
    ] {
        if thickness > 0.0 {
            result.stack.push(MechanicalStackLayer {
                id: id.into(),
                z,
                thickness,
            });
        }
    }
    for (part_id, volume) in &component_volumes {
        if let Some(battery) = &config.battery {
            let hx = battery.size.x / 2.0;
            let hy = battery.size.y / 2.0;
            let min_x = volume
                .points
                .iter()
                .map(|p| p.x)
                .fold(f64::INFINITY, f64::min);
            let max_x = volume
                .points
                .iter()
                .map(|p| p.x)
                .fold(f64::NEG_INFINITY, f64::max);
            let min_y = volume
                .points
                .iter()
                .map(|p| p.y)
                .fold(f64::INFINITY, f64::min);
            let max_y = volume
                .points
                .iter()
                .map(|p| p.y)
                .fold(f64::NEG_INFINITY, f64::max);
            if min_x < battery.at.x + hx
                && max_x > battery.at.x - hx
                && min_y < battery.at.y + hy
                && max_y > battery.at.y - hy
                && volume.z < bottom_foam_z
                && volume.z + volume.height > battery_z
            {
                issue(
                    &format!("component-battery:{part_id}"),
                    Severity::Error,
                    "Component clearance envelope intersects the battery space.",
                    vec![part_id.clone(), "battery".into()],
                );
            }
        }
        if volume.z < config.plate_to_pcb + config.plate_thickness
            && volume.z + volume.height > config.plate_to_pcb
        {
            issue(
                &format!("component-plate:{part_id}"),
                Severity::Warning,
                "Component clearance reaches the plate layer; review the profile aperture and connector access.",
                vec![part_id.clone(), "plate".into()],
            );
        }
    }
    result.pcb_reference = Some(CaseIR {
        revision: document.revision,
        contours: pcb_reference_contours,
        body: CaseBody {
            id: "pcb-reference".into(),
            name: "PCB reference".into(),
            board_id: config.board_id.clone(),
            kind: CaseKind::Plate,
            thickness: config.pcb_thickness,
            clearance: 0.0,
            material_id: None,
            z: Some(pcb_bottom),
            wall_height: None,
            wall_thickness: None,
            mounts: None,
            gasket: None,
            openings: None,
        },
    });
    let support_height = if config.mount == MechanicalMount::Tray {
        pcb_bottom - battery_z
    } else {
        config.plate_to_pcb - battery_z
    };
    let mut suspension_bosses = Vec::new();
    if config.mount != MechanicalMount::Gasket {
        for mount in &config.mounts {
            if mount.boss_diameter.is_none() {
                issue(
                    &format!("support-diameter:{}", mount.id),
                    Severity::Error,
                    "Suspension mounting requires an explicit boss diameter for the mating support.",
                    vec![mount.id.clone()],
                );
            } else {
                let mut support = mount.clone();
                support.kind = MountKind::Boss;
                support.height = Some(support_height);
                suspension_bosses.push(support);
            }
        }
        if config.mount == MechanicalMount::Tray && !config.mounts.is_empty() {
            issue(
                "pcb-mount-review",
                Severity::Warning,
                "Tray support positions require matching PCB mounting holes; mechanical configuration does not modify the electrical board.",
                config.mounts.iter().map(|m| m.id.clone()).collect(),
            );
        }
    }
    let mut plate_foam_contours = result.plate_contours.clone();
    plate_foam_contours.extend(foam_clearances);
    let board_id = config.board_id.clone();
    let sheet_bottom = config.bottom_style == Some(MechanicalBottomStyle::Sheet)
        || config.part_processes.iter().flatten().any(|process| {
            process.part_id == "bottom"
                && matches!(process.method, PlateMethod::PcbFr4 | PlateMethod::CutSheet)
        });
    if sheet_bottom && config.mount == MechanicalMount::Gasket {
        issue(
            "gasket-sheet",
            Severity::Error,
            "Gasket grooves require a shell bottom; sheet/frame gasket seats are not configured.",
            vec!["bottom".into()],
        );
    }
    if sheet_bottom && !config.middle_frame.unwrap_or(false) && !config.integrated_plate_frame {
        issue(
            "sheet-enclosure",
            Severity::Warning,
            "A sheet bottom without a middle frame leaves the assembly sides open.",
            vec!["bottom".into()],
        );
    }
    if config.middle_frame.unwrap_or(false) && (!sheet_bottom || config.integrated_plate_frame) {
        issue(
            "middle-frame-configuration",
            Severity::Error,
            "A separate middle frame requires a sheet bottom and a separate plate.",
            vec!["middle-frame".into()],
        );
    }
    let frame_outer = frame_contours.clone();
    for (id, kind, z, thickness, body_contours) in [
        (
            "plate",
            if config.integrated_plate_frame {
                CaseKind::Lid
            } else {
                CaseKind::Plate
            },
            if config.integrated_plate_frame {
                bottom_z + config.bottom_thickness
            } else {
                config.plate_to_pcb
            },
            config.plate_thickness,
            result.plate_contours.clone(),
        ),
        (
            "bottom",
            if config.integrated_plate_frame || sheet_bottom {
                CaseKind::Plate
            } else {
                CaseKind::Tray
            },
            bottom_z,
            config.bottom_thickness,
            frame_contours,
        ),
        (
            "plate-foam",
            CaseKind::Plate,
            0.0,
            config.plate_foam_thickness,
            plate_foam_contours,
        ),
        (
            "bottom-foam",
            CaseKind::Plate,
            bottom_foam_z,
            config.bottom_foam_thickness,
            bottom_foam_contours,
        ),
    ] {
        if thickness <= 0.0 {
            continue;
        }
        result.case.bodies.push(CaseIR {
            revision: document.revision,
            contours: body_contours,
            body: CaseBody {
                openings: if (id == "bottom" && !config.integrated_plate_frame)
                    || (id == "plate" && config.integrated_plate_frame)
                {
                    let mut openings = config.openings.clone().unwrap_or_default();
                    openings.extend(profile_openings.clone());
                    Some(openings)
                } else {
                    None
                },
                id: id.into(),
                name: id.into(),
                board_id: board_id.clone(),
                kind,
                thickness,
                clearance: 0.0,
                material_id: None,
                z: Some(z),
                wall_height: if (id == "bottom" && !config.integrated_plate_frame)
                    || (id == "plate" && config.integrated_plate_frame)
                {
                    Some(
                        config.plate_to_pcb
                            - bottom_z
                            - config.bottom_thickness
                            - if config.mount == MechanicalMount::Gasket {
                                config.gasket_travel.unwrap_or(0.0)
                            } else {
                                0.0
                            },
                    )
                } else {
                    None
                },
                wall_thickness: Some(config.wall_thickness),
                mounts: Some(if id == "bottom" {
                    let mut mounts = config.closure_mounts.clone().unwrap_or_default();
                    mounts.extend(suspension_bosses.clone());
                    mounts
                } else if id == "plate" && config.mount == MechanicalMount::Rigid {
                    let mut mounts: Vec<Mount> = config
                        .mounts
                        .iter()
                        .map(|mount| {
                            let mut hole = mount.clone();
                            hole.kind = MountKind::Hole;
                            hole.height = None;
                            hole.boss_diameter = None;
                            hole
                        })
                        .collect();
                    if config.integrated_plate_frame {
                        mounts.extend(config.closure_mounts.clone().unwrap_or_default());
                    }
                    mounts
                } else {
                    vec![]
                }),
                gasket: if id == "bottom" && config.mount == MechanicalMount::Gasket {
                    config.gasket.clone()
                } else {
                    None
                },
            },
        });
    }
    if sheet_bottom && config.middle_frame.unwrap_or(false) && !config.integrated_plate_frame {
        if let Some(bottom) = result
            .case
            .bodies
            .iter()
            .find(|body| body.body.id == "bottom")
        {
            let mut frame = bottom.clone();
            frame.body.id = "middle-frame".into();
            frame.body.name = "Middle frame".into();
            frame.body.kind = CaseKind::Tray;
            frame.body.wall_height = Some(config.plate_to_pcb - bottom_z - config.bottom_thickness);
            frame.contours = frame_outer;
            if let Ok(prepared) = crate::case::prepare(&CaseAssemblyIR {
                revision: document.revision,
                bodies: vec![frame.clone()],
            }) {
                let mut rings = Vec::new();
                for region in &prepared.bodies[0].regions {
                    rings.push(Contour {
                        hole: false,
                        points: region.outer.clone(),
                    });
                    rings.extend(region.cavities.iter().map(|points| Contour {
                        hole: true,
                        points: points.clone(),
                    }));
                }
                frame.contours = rings;
                frame.body.kind = CaseKind::Plate;
                frame.body.z = Some(bottom_z + config.bottom_thickness);
                frame.body.thickness = config.plate_to_pcb - bottom_z - config.bottom_thickness;
                frame.body.wall_height = None;
                frame.body.gasket = None;
                result.stack.push(MechanicalStackLayer {
                    id: "middle-frame".into(),
                    z: frame.body.z.unwrap(),
                    thickness: frame.body.thickness,
                });
                result.case.bodies.push(frame);
            }
        }
    }
    if sheet_bottom {
        if let Some(bottom) = result
            .case
            .bodies
            .iter_mut()
            .find(|body| body.body.id == "bottom")
        {
            for mount in bottom.body.mounts.iter_mut().flatten() {
                mount.kind = MountKind::Hole;
                mount.boss_diameter = None;
                mount.height = None;
            }
        }
        for support in &suspension_bosses {
            let Some(diameter) = support.boss_diameter else {
                continue;
            };
            let ring = |diameter: f64, hole: bool| Contour {
                hole,
                points: (0..64)
                    .map(|index| {
                        let angle = index as f64 * std::f64::consts::TAU / 64.0;
                        Vec2 {
                            x: support.at.x + diameter / 2.0 * angle.cos(),
                            y: support.at.y + diameter / 2.0 * angle.sin(),
                        }
                    })
                    .collect(),
            };
            let id = format!("spacer:{}", support.id);
            result.case.bodies.push(CaseIR {
                revision: document.revision,
                contours: vec![ring(diameter, false), ring(support.hole_diameter, true)],
                body: CaseBody {
                    id: id.clone(),
                    name: id.clone(),
                    board_id: config.board_id.clone(),
                    kind: CaseKind::Plate,
                    thickness: support_height,
                    clearance: 0.0,
                    material_id: None,
                    z: Some(battery_z),
                    wall_height: None,
                    wall_thickness: None,
                    mounts: None,
                    gasket: None,
                    openings: None,
                },
            });
            result.stack.push(MechanicalStackLayer {
                id,
                z: battery_z,
                thickness: support_height,
            });
        }
    }
    crate::mechanical_checks::apply_allowance(config, &mut result);
    if config.mount == MechanicalMount::Gasket {
        if let (Some(gasket), Some(travel), Ok(prepared)) = (
            &config.gasket,
            config.gasket_travel,
            crate::case::prepare(&result.case),
        ) {
            if travel.is_finite() && travel > 0.0 {
                let gasket_contours: Vec<Contour> = prepared
                    .bodies
                    .iter()
                    .filter(|body| body.body.id == "bottom")
                    .flat_map(|body| body.regions.iter())
                    .flat_map(|region| region.gaskets.iter())
                    .flat_map(|ring| {
                        std::iter::once(Contour {
                            hole: false,
                            points: ring.outer.clone(),
                        })
                        .chain(ring.holes.iter().map(|points| Contour {
                            hole: true,
                            points: points.clone(),
                        }))
                    })
                    .collect();
                if !gasket_contours.is_empty() {
                    let z = config.plate_to_pcb - travel - gasket.depth;
                    result.stack.push(MechanicalStackLayer {
                        id: "gasket".into(),
                        z,
                        thickness: travel + gasket.depth,
                    });
                    result.case.bodies.push(CaseIR {
                        revision: document.revision,
                        contours: gasket_contours,
                        body: CaseBody {
                            id: "gasket".into(),
                            name: "Gasket support".into(),
                            board_id: config.board_id.clone(),
                            kind: CaseKind::Plate,
                            thickness: travel + gasket.depth,
                            clearance: 0.0,
                            material_id: None,
                            z: Some(z),
                            wall_height: None,
                            wall_thickness: None,
                            mounts: None,
                            gasket: None,
                            openings: None,
                        },
                    });
                }
            }
        }
    }
    if let Err(message) = crate::case::prepare(&result.case) {
        result.diagnostics.push(Finding {
            id: "mechanical:case-preparation".into(),
            severity: Severity::Error,
            scope: Scope::Case,
            message,
            target_ids: vec![],
        });
    }
    result.suggested_mounts =
        crate::mechanical_checks::propose_mounts(config, &result.plate_contours);
    result.diagnostics.extend(crate::mechanical_checks::check(
        config,
        &result.plate_contours,
    ));
    result
        .diagnostics
        .extend(crate::mechanical_checks::check_specifications(
            config,
            &result.case,
        ));
    result
}

fn expanded_outline(
    contours: &[Contour],
    amount: f64,
    revision: u64,
) -> Result<Vec<Contour>, String> {
    let body = CaseBody {
        id: "mechanical-frame-outline".into(),
        name: "Frame outline".into(),
        board_id: String::new(),
        kind: CaseKind::Plate,
        thickness: 1.0,
        clearance: amount,
        material_id: None,
        z: None,
        wall_height: None,
        wall_thickness: None,
        mounts: None,
        gasket: None,
        openings: None,
    };
    let ir = CaseAssemblyIR {
        revision,
        bodies: vec![CaseIR {
            revision,
            body,
            contours: contours.iter().filter(|c| !c.hole).cloned().collect(),
        }],
    };
    let prepared = crate::case::prepare(&ir)?;
    let mut expanded: Vec<Contour> = prepared.bodies[0]
        .regions
        .iter()
        .map(|region| Contour {
            points: region.outer.clone(),
            hole: false,
        })
        .collect();
    expanded.extend(contours.iter().filter(|c| c.hole).cloned());
    Ok(expanded)
}

fn convex_envelope(mut points: Vec<Vec2>) -> Vec<Vec2> {
    points.sort_by(|a, b| a.x.total_cmp(&b.x).then(a.y.total_cmp(&b.y)));
    points.dedup();
    let turn = |a: Vec2, b: Vec2, c: Vec2| (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    let mut lower: Vec<Vec2> = Vec::new();
    for point in points.iter().copied() {
        while lower.len() >= 2 && turn(lower[lower.len() - 2], lower[lower.len() - 1], point) <= 0.0
        {
            lower.pop();
        }
        lower.push(point);
    }
    let mut upper: Vec<Vec2> = Vec::new();
    for point in points.into_iter().rev() {
        while upper.len() >= 2 && turn(upper[upper.len() - 2], upper[upper.len() - 1], point) <= 0.0
        {
            upper.pop();
        }
        upper.push(point);
    }
    lower.pop();
    upper.pop();
    lower.extend(upper);
    lower
}

fn same_ring(a: &Contour, b: &Contour) -> bool {
    if a.hole != b.hole {
        return false;
    }
    let clean = |ring: &Contour| {
        let mut points = ring.points.clone();
        if points.len() > 1 && points.first() == points.last() {
            points.pop();
        }
        points
    };
    let a = clean(a);
    let b = clean(b);
    if a.len() != b.len() || a.is_empty() {
        return false;
    }
    let equal = |p: Vec2, q: Vec2| (p.x - q.x).abs() < 0.000001 && (p.y - q.y).abs() < 0.000001;
    (0..b.len()).any(|offset| {
        (0..a.len()).all(|i| equal(a[i], b[(offset + i) % b.len()]))
            || (0..a.len()).all(|i| equal(a[i], b[(offset + b.len() - i) % b.len()]))
    })
}

fn inside_outline(point: Vec2, contours: &[Contour]) -> bool {
    let contains = |ring: &Contour| {
        let mut inside = false;
        for i in 0..ring.points.len() {
            let a = ring.points[i];
            let b = ring.points[(i + 1) % ring.points.len()];
            if (a.y > point.y) != (b.y > point.y)
                && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x
            {
                inside = !inside;
            }
        }
        inside
    };
    contours.iter().any(|c| !c.hole && contains(c))
        && !contours.iter().any(|c| c.hole && contains(c))
}

#[cfg(test)]
mod tests {
    use super::*;
    fn config() -> MechanicalConfiguration {
        MechanicalConfiguration {
            hardware: None,
            critical_fits: None,
            bottom_style: None,
            middle_frame: None,
            gasket_travel: None,
            openings: None,
            opening_allowance: None,
            stabilizers: None,
            part_processes: None,
            gasket: None,
            closure_mounts: None,
            board_id: "board".into(),
            method: PlateMethod::Printed,
            mount: MechanicalMount::Tray,
            integrated_plate_frame: false,
            battery: None,
            mounts: vec![],
            plate_thickness: 1.5,
            plate_foam_thickness: 1.0,
            pcb_thickness: 1.6,
            bottom_foam_thickness: 0.5,
            battery_height: 3.0,
            bottom_thickness: 2.0,
            plate_to_pcb: 3.5,
            wall_thickness: 2.0,
            clearance: 0.2,
            profiles: vec![],
        }
    }
    #[test]
    fn optional_configuration_preserves_legacy_serialization() {
        let doc = ProjectDoc::empty("test", "test");
        assert!(
            serde_json::to_value(&doc)
                .unwrap()
                .get("mechanical")
                .is_none()
        );
        assert!(resolve(&doc, &[]).stack.is_empty());
    }
    #[test]
    fn stack_is_explicit_and_revision_tagged() {
        let mut doc = ProjectDoc::empty("test", "test");
        doc.revision = 7;
        doc.boards.push(Board {
            id: "board".into(),
            name: "Board".into(),
            outline_ids: vec![],
            part_ids: vec![],
            net_ids: vec![],
            thickness: 1.6,
            traces: vec![],
            vias: vec![],
        });
        doc.mechanical = Some(config());
        let result = resolve(&doc, &[]);
        assert_eq!(result.revision, 7);
        assert_eq!(
            result.stack.iter().find(|l| l.id == "bottom").unwrap().z,
            -7.1
        );
        assert_eq!(result.case.bodies[0].contours, result.plate_contours);
    }
    #[test]
    fn integrated_frame_uses_lid_and_separate_bottom() {
        let mut doc = ProjectDoc::empty("test", "test");
        doc.boards.push(Board {
            id: "board".into(),
            name: "Board".into(),
            outline_ids: vec![],
            part_ids: vec![],
            net_ids: vec![],
            thickness: 1.6,
            traces: vec![],
            vias: vec![],
        });
        let mut c = config();
        c.integrated_plate_frame = true;
        c.mount = MechanicalMount::Rigid;
        doc.mechanical = Some(c);
        let resolved = resolve(
            &doc,
            &[Contour {
                hole: false,
                points: vec![
                    Vec2 { x: 0.0, y: 0.0 },
                    Vec2 { x: 50.0, y: 0.0 },
                    Vec2 { x: 50.0, y: 50.0 },
                    Vec2 { x: 0.0, y: 50.0 },
                ],
            }],
        );
        let plate = &resolved
            .case
            .bodies
            .iter()
            .find(|b| b.body.id == "plate")
            .unwrap()
            .body;
        assert_eq!(plate.kind, CaseKind::Lid);
        assert!((plate.z.unwrap() + plate.wall_height.unwrap() - 3.5).abs() < 1e-9);
        assert_eq!(
            resolved
                .case
                .bodies
                .iter()
                .find(|b| b.body.id == "bottom")
                .unwrap()
                .body
                .kind,
            CaseKind::Plate
        );
    }
    #[test]
    fn gasket_support_reaches_plate_without_rigid_contact() {
        let mut doc = ProjectDoc::empty("test", "test");
        doc.boards.push(Board {
            id: "board".into(),
            name: "Board".into(),
            outline_ids: vec![],
            part_ids: vec![],
            net_ids: vec![],
            thickness: 1.6,
            traces: vec![],
            vias: vec![],
        });
        let mut c = config();
        c.mount = MechanicalMount::Gasket;
        c.gasket_travel = Some(0.5);
        c.gasket = Some(Gasket {
            inset: 0.2,
            width: 1.0,
            depth: 0.4,
        });
        doc.mechanical = Some(c);
        let resolved = resolve(
            &doc,
            &[Contour {
                hole: false,
                points: vec![
                    Vec2 { x: 0.0, y: 0.0 },
                    Vec2 { x: 50.0, y: 0.0 },
                    Vec2 { x: 50.0, y: 50.0 },
                    Vec2 { x: 0.0, y: 50.0 },
                ],
            }],
        );
        let bottom = &resolved
            .case
            .bodies
            .iter()
            .find(|b| b.body.id == "bottom")
            .unwrap()
            .body;
        let ring = &resolved
            .case
            .bodies
            .iter()
            .find(|b| b.body.id == "gasket")
            .unwrap()
            .body;
        assert!(
            (bottom.z.unwrap() + bottom.thickness + bottom.wall_height.unwrap() - 3.0).abs() < 1e-9
        );
        assert!((ring.z.unwrap() + ring.thickness - 3.5).abs() < 1e-9);
        assert!(bottom.mounts.as_ref().unwrap().is_empty());
    }
    #[test]
    fn cable_exit_regenerates_single_foam_envelope_without_mutation() {
        let mut doc = ProjectDoc::empty("test", "test");
        doc.boards.push(Board {
            id: "board".into(),
            name: "Board".into(),
            outline_ids: vec![],
            part_ids: vec![],
            net_ids: vec![],
            thickness: 1.6,
            traces: vec![],
            vias: vec![],
        });
        let mut c = config();
        c.battery = Some(MechanicalBattery {
            size: Vec3 {
                x: 8.0,
                y: 8.0,
                z: 3.0,
            },
            at: Vec2 { x: 20.0, y: 20.0 },
            cable_exit: Vec2 { x: 35.0, y: 20.0 },
            cable_width: Some(2.0),
        });
        doc.mechanical = Some(c);
        let outline = [Contour {
            hole: false,
            points: vec![
                Vec2 { x: 0.0, y: 0.0 },
                Vec2 { x: 50.0, y: 0.0 },
                Vec2 { x: 50.0, y: 50.0 },
                Vec2 { x: 0.0, y: 50.0 },
            ],
        }];
        let saved = doc.clone();
        let first = resolve(&doc, &outline);
        assert_eq!(doc, saved);
        doc.mechanical
            .as_mut()
            .unwrap()
            .battery
            .as_mut()
            .unwrap()
            .cable_exit
            .y = 35.0;
        let second = resolve(&doc, &outline);
        let foam = |assembly: MechanicalAssembly| {
            assembly
                .case
                .bodies
                .into_iter()
                .find(|body| body.body.id == "bottom-foam")
                .unwrap()
                .contours
        };
        let a = foam(first);
        let b = foam(second);
        assert_ne!(a, b);
        assert_eq!(a.iter().filter(|contour| contour.hole).count(), 1);
        assert_eq!(b.iter().filter(|contour| contour.hole).count(), 1);
    }
    #[test]
    fn switch_profiles_drive_spacing_and_reject_incompatible_engagement() {
        let mut doc = ProjectDoc::empty("test", "test");
        doc.boards.push(Board {
            id: "board".into(),
            name: "Board".into(),
            outline_ids: vec![],
            part_ids: vec!["key".into(), "key2".into()],
            net_ids: vec![],
            thickness: 1.6,
            traces: vec![],
            vias: vec![],
        });
        for (id, definition_id) in [("key", "switch"), ("key2", "switch2")] {
            doc.parts.push(serde_json::from_value(serde_json::json!({"id":id,"definitionId":definition_id,"reference":id,"pose":{"at":{"x":20,"y":20},"rotation":0},"side":"front"})).unwrap());
            doc.definitions.push(serde_json::from_value(serde_json::json!({"id":definition_id,"name":"Switch","kind":"switch","courtyard":[],"pads":[]})).unwrap());
        }
        let mut c = config();
        c.plate_to_pcb = 5.0;
        c.profiles.push(
            builtin_profile("switch".into(), MechanicalBuiltinProfile::MxSwitch, 4.0).unwrap(),
        );
        c.profiles.push(
            builtin_profile("switch2".into(), MechanicalBuiltinProfile::MxSwitch, 4.0).unwrap(),
        );
        doc.mechanical = Some(c);
        let first = resolve(&doc, &[]);
        assert_eq!(
            first
                .stack
                .iter()
                .find(|layer| layer.id == "plate")
                .unwrap()
                .z,
            4.0
        );
        assert_eq!(doc.mechanical.as_ref().unwrap().plate_to_pcb, 5.0);
        doc.mechanical.as_mut().unwrap().profiles[1].plate_to_pcb = 3.5;
        let second = resolve(&doc, &[]);
        assert!(
            second
                .diagnostics
                .iter()
                .any(|finding| finding.id == "mechanical:engagement:key2"
                    && finding.severity == Severity::Error)
        );
    }
    #[test]
    fn duplicate_rings_ignore_winding_start_and_closure() {
        let a = Contour {
            hole: true,
            points: vec![
                Vec2 { x: 0.0, y: 0.0 },
                Vec2 { x: 1.0, y: 0.0 },
                Vec2 { x: 1.0, y: 1.0 },
            ],
        };
        let b = Contour {
            hole: true,
            points: vec![a.points[1], a.points[0], a.points[2], a.points[1]],
        };
        assert!(same_ring(&a, &b));
    }
    #[test]
    fn profiles_follow_rotation_and_back_side_mirror() {
        let mut doc = ProjectDoc::empty("test", "test");
        doc.boards.push(Board {
            id: "board".into(),
            name: "Board".into(),
            outline_ids: vec![],
            part_ids: vec!["key".into()],
            net_ids: vec![],
            thickness: 1.6,
            traces: vec![],
            vias: vec![],
        });
        doc.parts.push(serde_json::from_value(serde_json::json!({"id":"key","definitionId":"switch","reference":"SW1","pose":{"at":{"x":10,"y":20},"rotation":90},"side":"back"})).unwrap());
        let mut configuration = config();
        configuration.profiles.push(MechanicalPartProfile {
            source_geometry: None,
            pcb_holes: None,
            clearance_volumes: None,
            openings: None,
            clearances: None,
            definition_id: "switch".into(),
            source: "custom".into(),
            cutouts: vec![vec![
                Vec2 { x: 1.0, y: 0.0 },
                Vec2 { x: 2.0, y: 0.0 },
                Vec2 { x: 1.0, y: 1.0 },
            ]],
            plate_to_pcb: 3.5,
            supported_thickness: None,
        });
        doc.mechanical = Some(configuration);
        let resolved = resolve(&doc, &[]);
        assert!((resolved.plate_contours[0].points[0].x - 10.0).abs() < 1e-9);
        assert!((resolved.plate_contours[0].points[0].y - 19.0).abs() < 1e-9);
    }
    #[test]
    fn combined_switch_stabilizer_deduplicates_and_regenerates_with_pose() {
        let mut doc = ProjectDoc::empty("test", "test");
        doc.boards.push(Board {
            id: "board".into(),
            name: "Board".into(),
            outline_ids: vec![],
            part_ids: vec!["key".into()],
            net_ids: vec![],
            thickness: 1.6,
            traces: vec![],
            vias: vec![],
        });
        doc.parts.push(serde_json::from_value(serde_json::json!({"id":"key","definitionId":"switch","reference":"SW1","pose":{"at":{"x":30,"y":30},"rotation":0},"side":"front"})).unwrap());
        let mut c = config();
        let mut profile =
            builtin_profile("switch".into(), MechanicalBuiltinProfile::MxSwitch, 3.5).unwrap();
        profile.cutouts.extend(
            builtin_profile("switch".into(), MechanicalBuiltinProfile::MxStab2u, 3.5)
                .unwrap()
                .cutouts,
        );
        let expected = profile.cutouts.len();
        c.profiles.push(profile);
        c.stabilizers = Some(vec![MechanicalStabilizerOverride {
            part_id: "key".into(),
            kind: MechanicalStabilizerKind::PcbMount,
            units: 2.0,
            rotation: None,
            profile: None,
        }]);
        doc.mechanical = Some(c);
        let first = resolve(&doc, &[]);
        assert_eq!(first.plate_contours.len(), expected);
        doc.parts[0].pose.at.x += 10.0;
        doc.revision += 1;
        let second = resolve(&doc, &[]);
        assert_eq!(second.plate_contours.len(), expected);
        assert!(
            (second.plate_contours[0].points[0].x - first.plate_contours[0].points[0].x - 10.0)
                .abs()
                < 1e-9
        );
        assert_eq!(second.revision, 1);
    }
    #[test]
    fn outer_expansion_preserves_nominal_holes() {
        let outer = Contour {
            hole: false,
            points: vec![
                Vec2 { x: 0.0, y: 0.0 },
                Vec2 { x: 20.0, y: 0.0 },
                Vec2 { x: 20.0, y: 20.0 },
                Vec2 { x: 0.0, y: 20.0 },
            ],
        };
        let hole = Contour {
            hole: true,
            points: vec![
                Vec2 { x: 5.0, y: 5.0 },
                Vec2 { x: 5.0, y: 10.0 },
                Vec2 { x: 10.0, y: 10.0 },
                Vec2 { x: 10.0, y: 5.0 },
            ],
        };
        let expanded = expanded_outline(&[outer, hole.clone()], 2.0, 1).unwrap();
        assert!(expanded.iter().any(|c| *c == hole));
        assert!(
            expanded
                .iter()
                .filter(|c| !c.hole)
                .flat_map(|c| c.points.iter())
                .any(|p| p.x < 0.0)
        );
    }
    #[test]
    fn builtin_profiles_have_library_cutouts() {
        for source in [
            MechanicalBuiltinProfile::MxSwitch,
            MechanicalBuiltinProfile::MxStab2u,
            MechanicalBuiltinProfile::MxStab625u,
        ] {
            let profile = builtin_profile("switch".into(), source, 3.5).unwrap();
            assert!(!profile.cutouts.is_empty());
            assert!(profile.cutouts.iter().all(|p| p.len() >= 3));
            assert!(profile.supported_thickness.is_none());
        }
    }
    #[test]
    fn rejects_impossible_foam_and_rigid_gasket() {
        let mut doc = ProjectDoc::empty("test", "test");
        let mut c = config();
        c.plate_foam_thickness = 4.0;
        c.mount = MechanicalMount::Gasket;
        c.integrated_plate_frame = true;
        doc.mechanical = Some(c);
        let result = resolve(&doc, &[]);
        assert!(
            result
                .diagnostics
                .iter()
                .any(|d| d.id == "mechanical:foam-engagement")
        );
        assert!(
            result
                .diagnostics
                .iter()
                .any(|d| d.id == "mechanical:gasket-rigid-frame")
        );
    }
}

/// Reviewed library geometry, with an explicit caller-supplied engagement distance.
/// The footprints establish cutout geometry only, not switch stack qualification.
pub fn builtin_profile(
    definition_id: String,
    source: MechanicalBuiltinProfile,
    plate_to_pcb: f64,
) -> Result<MechanicalPartProfile, String> {
    use crate::artifact::mechanical_extract::{
        MechanicalPurpose, PurposeMapping, extract, pcb_mounting_holes, plate_cutout_contours,
        profile_source,
    };
    if !plate_to_pcb.is_finite() || plate_to_pcb <= 0.0 {
        return Err("Profile engagement must be positive finite millimetres".into());
    }
    let (name, source_text) = match source {
        MechanicalBuiltinProfile::MxSwitch => (
            "SW_MX_1u",
            include_str!("../tests/fixtures/mechanical/SW_MX_1u.kicad_mod"),
        ),
        MechanicalBuiltinProfile::MxStab2u => (
            "STAB_MX_2u",
            include_str!("../tests/fixtures/mechanical/STAB_MX_2u.kicad_mod"),
        ),
        MechanicalBuiltinProfile::MxStab625u => (
            "STAB_MX_6.25u",
            include_str!("../tests/fixtures/mechanical/STAB_MX_6.25u.kicad_mod"),
        ),
    };
    let raw = extract(source_text, &[]).map_err(|e| format!("{e:?}"))?;
    let mappings: Vec<_> = raw
        .primitives
        .iter()
        .filter_map(|primitive| {
            let purpose = if primitive.layer.as_deref() == Some("Eco2.User") {
                MechanicalPurpose::PlateCutout
            } else if matches!(
                &primitive.geometry,
                MechanicalShape::Drill {
                    plated: Some(false),
                    ..
                }
            ) {
                MechanicalPurpose::ElectricalPcbMountingHole
            } else {
                return None;
            };
            Some(PurposeMapping {
                source_id: Some(primitive.id.clone()),
                kind: None,
                layer: None,
                purpose,
            })
        })
        .collect();
    let geometry = extract(source_text, &mappings).map_err(|e| format!("{e:?}"))?;
    let cutouts = plate_cutout_contours(&geometry, 0.005).map_err(|e| format!("{e:?}"))?;
    if cutouts.is_empty() {
        return Err("Bundled profile has no mapped plate contours".into());
    }
    Ok(MechanicalPartProfile {
        source_geometry: Some(
            profile_source(source_text, &mappings).map_err(|e| format!("{e:?}"))?,
        ),
        pcb_holes: Some(pcb_mounting_holes(&geometry).map_err(|e| format!("{e:?}"))?),
        clearance_volumes: None,
        openings: None,
        clearances: None,
        definition_id,
        source: format!(
            "marbastlib@6b0a9a73f579e377816d60b58eac2b3252de7868:footprints/marbastlib-mx.pretty/{name}.kicad_mod:CERN-OHL-P-2.0:Eco2.User; chord deviation <=0.005mm; engagement user-specified; PCB-mount stabilizers only"
        ),
        cutouts,
        plate_to_pcb,
        supported_thickness: None,
    })
}
