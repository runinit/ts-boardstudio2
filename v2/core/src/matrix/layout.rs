use crate::{matrix, model::*};
use std::collections::{BTreeMap, BTreeSet};

pub(crate) fn validate(doc: &ProjectDoc) -> Result<(), String> {
    if doc.layouts.is_empty() {
        return Ok(());
    }
    let mut ids = BTreeSet::new();
    let mut matrices = BTreeSet::new();
    let mut parts = BTreeSet::new();
    let mut linked = BTreeSet::new();
    for layout in &doc.layouts {
        if layout.id.trim().is_empty() || layout.name.trim().is_empty() || !ids.insert(&layout.id) {
            return Err("Layout names and identities must be present and unique".into());
        }
        let board = doc
            .boards
            .iter()
            .find(|board| board.id == layout.board_id)
            .ok_or("Layout board is missing")?;
        let matrix = doc
            .matrices
            .iter()
            .find(|matrix| matrix.id == layout.matrix_id)
            .ok_or("Layout matrix is missing")?;
        if !matrices.insert(&matrix.id) || matrix.board_id.as_ref() != Some(&board.id) {
            return Err("Each layout must own a distinct matrix on its board".into());
        }
        for id in &layout.part_ids {
            if !parts.insert(id)
                || !board.part_ids.contains(id)
                || !doc.parts.iter().any(|part| &part.id == id)
                || doc
                    .matrices
                    .iter()
                    .any(|matrix| matrix.part_ids.contains(id))
            {
                return Err("Layout components must be independent parts on the same board".into());
            }
        }
        if let Some(link) = &layout.mirror_link {
            let source = doc
                .layouts
                .iter()
                .find(|other| other.id == link.source_id)
                .ok_or("Linked layout is missing")?;
            if !link.axis_x.is_finite()
                || source.id == layout.id
                || source.board_id != layout.board_id
                || source.mirror_link.is_some()
                || !linked.insert(&source.id)
                || !linked.insert(&layout.id)
            {
                return Err("A mirrored pair must link two distinct layouts on one board".into());
            }
        }
    }
    for constraint in &doc.constraints {
        if primary_member(doc, constraint.target())
            .is_some_and(|(matrix, _, _)| partner(doc, &matrix.id).is_some())
        {
            return Err("Unlink the halves before constraining a linked key's position".into());
        }
    }
    Ok(())
}

/// The relationship is stored once, but geometry can be edited from either half.
pub(crate) fn partner(doc: &ProjectDoc, matrix_id: &str) -> Option<(String, f64)> {
    let owner = doc
        .layouts
        .iter()
        .find(|layout| layout.matrix_id == matrix_id)?;
    if let Some(link) = &owner.mirror_link {
        let source = doc
            .layouts
            .iter()
            .find(|layout| layout.id == link.source_id)?;
        return Some((source.matrix_id.clone(), link.axis_x));
    }
    let other = doc.layouts.iter().find(|layout| {
        layout
            .mirror_link
            .as_ref()
            .is_some_and(|link| link.source_id == owner.id)
    })?;
    Some((other.matrix_id.clone(), other.mirror_link.as_ref()?.axis_x))
}

pub(crate) fn reflected(source: &Matrix, target: &Matrix, axis_x: f64) -> Result<Matrix, String> {
    // The pair uses a vertical reflection of the local None/X frames.
    // Switching to a horizontal local frame requires an independent layout.
    if source.mirror == Some(Mirror::Y) {
        return Err("Unlink the halves before changing to a horizontal matrix mirror".into());
    }
    let mut result = target.clone();
    result.rows = source.rows;
    result.columns = source.columns;
    result.pitch = source.pitch;
    result.edge_gap = source.edge_gap;
    result.origin = Vec2 {
        x: 2.0 * axis_x - source.origin.x,
        y: source.origin.y,
    };
    result.rotation = source.rotation.map(|angle| -angle);
    result.mirror = Some(if source.mirror == Some(Mirror::X) {
        Mirror::None
    } else {
        Mirror::X
    });
    result.row_offsets = source.row_offsets.clone();
    result.column_offsets = source.column_offsets.clone();
    result.column_staggers = source.column_staggers.clone();
    result.column_splays = source.column_splays.clone();
    result.column_origins = source.column_origins.clone();
    let source_cells: BTreeMap<_, _> = source
        .cells
        .iter()
        .map(|cell| ((cell.row, cell.column), cell))
        .collect();
    let mut cells: BTreeMap<_, _> = target
        .cells
        .iter()
        .filter(|cell| cell.row < source.rows && cell.column < source.columns)
        .map(|cell| ((cell.row, cell.column), cell.clone()))
        .collect();
    for (coordinate, source_cell) in &source_cells {
        cells.entry(*coordinate).or_insert_with(|| MatrixCell {
            row: source_cell.row,
            column: source_cell.column,
            enabled: true,
            diode: None,
            definition_id: None,
            variant: None,
            offset: None,
            rotation: None,
            assemblies: vec![],
        });
    }
    for (coordinate, cell) in &mut cells {
        let source_cell = source_cells.get(coordinate);
        cell.enabled = source_cell.is_none_or(|cell| cell.enabled);
        cell.offset = source_cell.and_then(|cell| cell.offset);
        cell.rotation = source_cell
            .and_then(|cell| cell.rotation)
            .map(|angle| -angle);
        // Definition, variant, diode and companions deliberately remain local.
    }
    result.cells = cells.into_values().collect();
    Ok(result)
}

pub(crate) fn sync(doc: &mut ProjectDoc, matrix_id: &str) -> Result<Vec<String>, String> {
    let Some((target_id, axis_x)) = partner(doc, matrix_id) else {
        return Ok(vec![]);
    };
    let source = doc
        .matrices
        .iter()
        .find(|matrix| matrix.id == matrix_id)
        .ok_or("Linked matrix is missing")?;
    let target = doc
        .matrices
        .iter()
        .find(|matrix| matrix.id == target_id)
        .ok_or("Linked matrix is missing")?;
    let reflected = reflected(source, target, axis_x)?;
    matrix::set_matrix(doc, &reflected)
}

pub(crate) fn resolve(doc: &mut ProjectDoc) -> Result<(), String> {
    validate(doc)?;
    let sources: Vec<_> = doc
        .layouts
        .iter()
        .filter_map(|layout| {
            let link = layout.mirror_link.as_ref()?;
            doc.layouts
                .iter()
                .find(|source| source.id == link.source_id)
                .map(|source| source.matrix_id.clone())
        })
        .collect();
    for source in sources {
        sync(doc, &source)?;
    }
    Ok(())
}

pub(crate) fn remove_matrix(doc: &mut ProjectDoc, matrix_id: &str) {
    let removed: BTreeSet<_> = doc
        .layouts
        .iter()
        .filter(|layout| layout.matrix_id == matrix_id)
        .map(|layout| layout.id.clone())
        .collect();
    doc.layouts.retain(|layout| !removed.contains(&layout.id));
    for layout in &mut doc.layouts {
        if layout
            .mirror_link
            .as_ref()
            .is_some_and(|link| removed.contains(&link.source_id))
        {
            layout.mirror_link = None;
        }
    }
}

fn primary_member<'a>(doc: &'a ProjectDoc, id: &str) -> Option<(&'a Matrix, u32, u32)> {
    for matrix in &doc.matrices {
        if !matrix.part_ids.iter().any(|part| part == id) {
            continue;
        }
        if let Some(((row, column), _)) = matrix::cell_members(matrix)
            .into_iter()
            .find(|(_, member)| member == id)
        {
            return Some((matrix, row, column));
        }
    }
    None
}

pub(crate) fn has_linked_positions(doc: &ProjectDoc, positions: &[Position]) -> bool {
    if doc.layouts.is_empty() {
        return false;
    }
    positions.iter().any(|position| {
        primary_member(doc, &position.id)
            .is_some_and(|(matrix, _, _)| partner(doc, &matrix.id).is_some())
    })
}

/// Numeric moves and keyboard nudges must update the same parametric geometry
/// as pointer edits; absolute part overrides would break the next linked edit.
pub(crate) fn move_keys(
    doc: &mut ProjectDoc,
    positions: &[Position],
) -> Result<(Vec<String>, BTreeSet<String>), String> {
    if doc.layouts.is_empty() {
        return Ok((vec![], BTreeSet::new()));
    }
    let mut matrices = BTreeMap::new();
    let mut handled = BTreeSet::new();
    for position in positions {
        let Some((source, row, column)) = primary_member(doc, &position.id) else {
            continue;
        };
        if partner(doc, &source.id).is_none() {
            continue;
        }
        let part = doc
            .parts
            .iter()
            .find(|part| part.id == position.id)
            .ok_or("Key is missing")?;
        if part.locked == Some(true) {
            return Err(format!("Part {} is locked", part.id));
        }
        if !position.at.x.is_finite() || !position.at.y.is_finite() {
            return Err("Position must be finite".into());
        }
        let matrix = matrices
            .entry(source.id.clone())
            .or_insert_with(|| source.clone());
        let delta = Vec2 {
            x: position.at.x - part.pose.at.x,
            y: position.at.y - part.pose.at.y,
        };
        let rotate = |point: Vec2, angle: f64| {
            let (sin, cos) = angle.to_radians().sin_cos();
            Vec2 {
                x: point.x * cos - point.y * sin,
                y: point.x * sin + point.y * cos,
            }
        };
        let mut local = rotate(delta, -source.rotation.unwrap_or(0.0));
        if source.mirror == Some(Mirror::X) {
            local.x = -local.x;
        }
        local = rotate(
            local,
            -source
                .column_splays
                .iter()
                .take(column as usize + 1)
                .sum::<f64>(),
        );
        let index = matrix
            .cells
            .iter()
            .position(|cell| cell.row == row && cell.column == column)
            .unwrap_or_else(|| {
                matrix.cells.push(MatrixCell {
                    row,
                    column,
                    enabled: true,
                    diode: None,
                    definition_id: None,
                    variant: None,
                    offset: None,
                    rotation: None,
                    assemblies: vec![],
                });
                matrix.cells.len() - 1
            });
        let cell = &mut matrix.cells[index];
        let offset = cell.offset.unwrap_or_default();
        cell.offset = Some(Vec2 {
            x: offset.x + local.x,
            y: offset.y + local.y,
        });
        handled.insert(position.id.clone());
    }
    // Editing both sides at once would give two competing values for one link.
    if matrices
        .keys()
        .any(|id| partner(doc, id).is_some_and(|(other, _)| matrices.contains_key(&other)))
    {
        return Err("Move one linked half at a time".into());
    }
    let mut changed = vec![];
    for matrix in matrices.values() {
        changed.extend(matrix::set_matrix(doc, matrix)?);
        changed.extend(sync(doc, &matrix.id)?);
    }
    Ok((changed, handled))
}
