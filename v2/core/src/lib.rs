mod constraints;
mod geometry;
mod matrix;
pub mod model;
mod script;
mod validate;

use geometry::{OutlineCache, outlines};
use model::*;
use std::collections::BTreeSet;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct CoreEngine {
    document: ProjectDoc,
    undo: Vec<ProjectDoc>,
    redo: Vec<ProjectDoc>,
    contours: Vec<Contour>,
    findings: Vec<Finding>,
    outline_cache: OutlineCache,
}

#[wasm_bindgen]
impl CoreEngine {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self::default()
    }

    // Worker transport keeps the Rust and TypeScript protocols identical.
    pub fn request(&mut self, json: &str) -> String {
        let reply = match serde_json::from_str::<CoreRequest>(json) {
            Ok(request) => self.handle(request),
            Err(error) => CoreReply::Error {
                id: String::new(),
                message: error.to_string(),
                revision: self.document.revision,
            },
        };
        serde_json::to_string(&reply).expect("reply serializes")
    }
}

impl Default for CoreEngine {
    fn default() -> Self {
        Self {
            document: ProjectDoc::empty("untitled", "Untitled"),
            undo: vec![],
            redo: vec![],
            contours: vec![],
            findings: vec![],
            outline_cache: OutlineCache::default(),
        }
    }
}

impl CoreEngine {
    pub fn handle(&mut self, request: CoreRequest) -> CoreReply {
        match request {
            CoreRequest::Open { id, mut document } => {
                if document.format != "boardstudio/v2" {
                    return self.error(id, "Unsupported document format");
                }
                if let Err(message) = script::apply_scripts(&mut document) {
                    return self.error(id, &message);
                }
                if let Err(message) = constraints::resolve(&mut document) {
                    return self.error(id, &message);
                }
                self.document = document;
                self.undo.clear();
                self.redo.clear();
                self.recompute();
                self.scene(
                    id,
                    "open",
                    vec![],
                    &self.document,
                    &self.contours,
                    &self.findings,
                    &self.outline_cache,
                    SceneKind::Committed,
                )
            }
            CoreRequest::Edit { id, command } => self.edit(id, command),
            CoreRequest::Undo { id } => self.history(id, History::Undo),
            CoreRequest::Redo { id } => self.history(id, History::Redo),
            CoreRequest::Snapshot { id } => self.scene(
                id,
                "snapshot",
                vec![],
                &self.document,
                &self.contours,
                &self.findings,
                &self.outline_cache,
                SceneKind::Committed,
            ),
        }
    }

    fn edit(&mut self, id: String, command: EditCommand) -> CoreReply {
        if command.base_revision != self.document.revision {
            return self.error(id, "Stale base revision");
        }
        if command.phase == EditPhase::Preview
            && matches!(
                &command.operation,
                EditOperation::MoveParts { .. } | EditOperation::SetMatrix { .. }
            )
        {
            return self.preview_edit(id, command);
        }
        let mut next = self.document.clone();
        let changed = match apply(&mut next, &command.operation) {
            Ok(changed) => changed,
            Err(message) => return self.error(id, &message),
        };
        let mut changed = changed;
        match constraints::resolve(&mut next) {
            Ok(ids) => changed.extend(ids),
            Err(message) => return self.error(id, &message),
        }
        changed.sort();
        changed.dedup();
        let (cache, contours, findings) = if affects_outline(&command.operation) {
            let previous = if matches!(command.operation, EditOperation::MoveParts { .. }) {
                Some(&self.outline_cache)
            } else {
                None
            };
            outlines(&next, previous, &changed)
        } else {
            (
                self.outline_cache.clone(),
                self.contours.clone(),
                self.findings.clone(),
            )
        };
        if command.phase == EditPhase::Preview {
            return self.scene(
                id,
                &command.transaction_id,
                changed,
                &next,
                &contours,
                &findings,
                &cache,
                SceneKind::Preview,
            );
        }
        next.revision = self.document.revision + 1;
        self.undo.push(self.document.clone());
        self.redo.clear();
        self.document = next;
        self.contours = contours;
        self.findings = findings;
        self.outline_cache = cache;
        self.scene(
            id,
            &command.transaction_id,
            changed,
            &self.document,
            &self.contours,
            &self.findings,
            &self.outline_cache,
            SceneKind::Committed,
        )
    }

    fn preview_edit(&mut self, id: String, command: EditCommand) -> CoreReply {
        let backup = PreviewBackup::capture(&self.document, &command.operation);
        let result = apply(&mut self.document, &command.operation).and_then(|mut changed| {
            changed.extend(constraints::resolve(&mut self.document)?);
            changed.sort();
            changed.dedup();
            Ok(changed)
        });
        let reply = match result {
            Err(message) => self.error(id, &message),
            Ok(changed) => {
                let previous = matches!(&command.operation, EditOperation::MoveParts { .. })
                    .then_some(&self.outline_cache);
                let (cache, contours, findings) = outlines(&self.document, previous, &changed);
                self.scene(
                    id,
                    &command.transaction_id,
                    changed,
                    &self.document,
                    &contours,
                    &findings,
                    &cache,
                    SceneKind::Preview,
                )
            }
        };
        backup.restore(&mut self.document);
        reply
    }

    fn history(&mut self, id: String, direction: History) -> CoreReply {
        let (from, to) = match direction {
            History::Undo => (&mut self.undo, &mut self.redo),
            History::Redo => (&mut self.redo, &mut self.undo),
        };
        let Some(mut next) = from.pop() else {
            return self.error(id, "History is empty");
        };
        let changed = changed_ids(&self.document, &next);
        to.push(self.document.clone());
        next.revision = self.document.revision + 1;
        self.document = next;
        self.recompute();
        let transaction = match direction {
            History::Undo => "undo",
            History::Redo => "redo",
        };
        self.scene(
            id,
            transaction,
            changed,
            &self.document,
            &self.contours,
            &self.findings,
            &self.outline_cache,
            SceneKind::Committed,
        )
    }

    fn recompute(&mut self) {
        (self.outline_cache, self.contours, self.findings) = outlines(&self.document, None, &[]);
    }

    fn scene(
        &self,
        id: String,
        transaction: &str,
        changed: Vec<String>,
        doc: &ProjectDoc,
        contours: &[Contour],
        geom_findings: &[Finding],
        cache: &OutlineCache,
        kind: SceneKind,
    ) -> CoreReply {
        let mut findings = geom_findings.to_vec();
        let definition_ids: BTreeSet<_> =
            doc.definitions.iter().map(|def| def.id.as_str()).collect();
        for part in &doc.parts {
            if !definition_ids.contains(part.definition_id.as_str()) {
                findings.push(Finding {
                    id: format!("part:{}:definition", part.id),
                    severity: Severity::Error,
                    scope: Scope::Layout,
                    message: "Part definition is missing".into(),
                    target_ids: vec![part.id.clone()],
                });
            }
        }
        findings.extend(validate::validate(doc));
        let (board_contours, board_findings) = geometry::board_contours(doc, cache);
        findings.extend(board_findings);
        for board in &board_contours {
            if board.contours.is_empty() {
                findings.push(Finding {
                    id: format!("board:{}:empty-outline", board.board_id),
                    severity: Severity::Error,
                    scope: Scope::Pcb,
                    message: "Board outline resolves to no area".into(),
                    target_ids: vec![board.board_id.clone()],
                });
            }
        }
        let layout = !findings
            .iter()
            .any(|f| matches!(f.scope, Scope::Layout) && matches!(f.severity, Severity::Error));
        let outline = !contours.is_empty()
            && !findings.iter().any(|f| {
                matches!(f.scope, Scope::Outline) && matches!(f.severity, Severity::Error)
            });
        let pcb = layout
            && !doc.boards.is_empty()
            && !findings
                .iter()
                .any(|f| matches!(f.scope, Scope::Pcb) && matches!(f.severity, Severity::Error));
        let board_readiness: Vec<BoardReadiness> = board_contours
            .iter()
            .map(|board| {
                let owner = doc
                    .boards
                    .iter()
                    .find(|item| item.id == board.board_id)
                    .unwrap();
                let relevant = |finding: &Finding| {
                    finding.target_ids.is_empty()
                        || finding.target_ids.iter().any(|id| {
                            id == &board.board_id
                                || owner.outline_ids.contains(id)
                                || owner.part_ids.contains(id)
                                || owner.net_ids.contains(id)
                        })
                };
                let invalid_pcb = findings.iter().any(|finding| {
                    matches!(finding.severity, Severity::Error)
                        && matches!(finding.scope, Scope::Pcb)
                        && relevant(finding)
                });
                let invalid_outline = findings.iter().any(|finding| {
                    matches!(finding.severity, Severity::Error)
                        && matches!(finding.scope, Scope::Pcb)
                        && finding
                            .id
                            .starts_with(&format!("board:{}:", board.board_id))
                        && (finding.id.contains(":outline")
                            || finding.id.contains(":feature:")
                            || finding.id.ends_with(":empty-outline"))
                });
                let outline = !board.contours.is_empty() && !invalid_outline;
                let pcb = layout && outline && !invalid_pcb;
                let bodies: Vec<_> = doc
                    .case_bodies
                    .iter()
                    .filter(|body| body.board_id == board.board_id)
                    .collect();
                let invalid_case = findings.iter().any(|finding| {
                    matches!(finding.severity, Severity::Error)
                        && matches!(finding.scope, Scope::Case)
                        && (finding.target_ids.is_empty()
                            || finding.target_ids.contains(&board.board_id)
                            || bodies
                                .iter()
                                .any(|body| finding.target_ids.contains(&body.id)))
                });
                BoardReadiness {
                    board_id: board.board_id.clone(),
                    outline,
                    pcb,
                    case_ready: pcb && !bodies.is_empty() && !invalid_case,
                }
            })
            .collect();
        let case_ready = !doc.case_bodies.is_empty()
            && doc.case_bodies.iter().all(|body| {
                board_readiness
                    .iter()
                    .any(|board: &BoardReadiness| board.board_id == body.board_id && board.pcb)
            })
            && !findings
                .iter()
                .any(|f| matches!(f.scope, Scope::Case) && matches!(f.severity, Severity::Error));
        let scene = SceneDelta {
            revision: doc.revision,
            transaction_id: transaction.into(),
            changed_ids: changed,
            transforms: doc
                .parts
                .iter()
                .map(|part| Transform {
                    id: part.id.clone(),
                    pose: part.pose,
                })
                .collect(),
            contours: contours.to_vec(),
            board_contours,
            board_readiness,
            findings,
            readiness: Readiness {
                layout,
                outline,
                pcb,
                case_ready,
            },
        };
        match kind {
            SceneKind::Preview => CoreReply::Preview { id, scene },
            SceneKind::Committed => CoreReply::Scene {
                id,
                scene,
                document: doc.clone(),
            },
        }
    }

    fn error(&self, id: String, message: &str) -> CoreReply {
        CoreReply::Error {
            id,
            message: message.into(),
            revision: self.document.revision,
        }
    }
}

enum History {
    Undo,
    Redo,
}
enum SceneKind {
    Preview,
    Committed,
}

enum PreviewBackup {
    Parts(
        Vec<(
            usize,
            Pose2,
            Option<std::collections::BTreeMap<String, serde_json::Value>>,
        )>,
    ),
    Matrix {
        definition_len: usize,
        parts: Vec<Part>,
        matrices: Vec<Matrix>,
        nets: Vec<Net>,
        outline: Vec<OutlineFeature>,
        boards: Vec<Board>,
        constraints: Vec<Constraint>,
    },
}

impl PreviewBackup {
    // Save only fields a preview can change so pointer moves avoid cloning the document.
    fn capture(doc: &ProjectDoc, operation: &EditOperation) -> Self {
        if let EditOperation::MoveParts { positions } = operation {
            let mut affected: BTreeSet<String> = positions
                .iter()
                .map(|position| position.id.clone())
                .collect();
            loop {
                let prior = affected.len();
                for constraint in &doc.constraints {
                    if affected.contains(constraint.source()) {
                        affected.insert(constraint.target().into());
                    }
                }
                if affected.len() == prior {
                    break;
                }
            }
            return Self::Parts(
                doc.parts
                    .iter()
                    .enumerate()
                    .filter(|(_, part)| affected.contains(&part.id))
                    .map(|(index, part)| (index, part.pose, part.properties.clone()))
                    .collect(),
            );
        }
        Self::Matrix {
            definition_len: doc.definitions.len(),
            parts: doc.parts.clone(),
            matrices: doc.matrices.clone(),
            nets: doc.nets.clone(),
            outline: doc.outline.clone(),
            boards: doc.boards.clone(),
            constraints: doc.constraints.clone(),
        }
    }

    fn restore(self, doc: &mut ProjectDoc) {
        match self {
            Self::Parts(parts) => {
                for (index, pose, properties) in parts {
                    doc.parts[index].pose = pose;
                    doc.parts[index].properties = properties;
                }
            }
            Self::Matrix {
                definition_len,
                parts,
                matrices,
                nets,
                outline,
                boards,
                constraints,
            } => {
                doc.definitions.truncate(definition_len);
                doc.parts = parts;
                doc.matrices = matrices;
                doc.nets = nets;
                doc.outline = outline;
                doc.boards = boards;
                doc.constraints = constraints;
            }
        }
    }
}

fn affects_outline(op: &EditOperation) -> bool {
    matches!(
        op,
        EditOperation::MoveParts { .. }
            | EditOperation::SetOutline { .. }
            | EditOperation::AddPart { .. }
            | EditOperation::RemoveParts { .. }
            | EditOperation::SetMatrix { .. }
            | EditOperation::SetConstraint { .. }
            | EditOperation::RemoveConstraint { .. }
            | EditOperation::ReplaceDocument { .. }
    )
}

fn apply(doc: &mut ProjectDoc, op: &EditOperation) -> Result<Vec<String>, String> {
    match op {
        EditOperation::MoveParts { positions } => {
            let mut changed = vec![];
            for position in positions {
                let Some(part) = doc.parts.iter_mut().find(|p| p.id == position.id) else {
                    return Err(format!("Unknown part {}", position.id));
                };
                if part.locked == Some(true) {
                    return Err(format!("Part {} is locked", part.id));
                }
                if doc
                    .constraints
                    .iter()
                    .any(|constraint| constraint.target() == part.id)
                {
                    return Err(format!("Part {} is controlled by a constraint", part.id));
                }
                if !position.at.x.is_finite() || !position.at.y.is_finite() {
                    return Err("Position must be finite".into());
                }
                part.pose.at = position.at;
                if doc
                    .matrices
                    .iter()
                    .any(|matrix| matrix.part_ids.contains(&part.id))
                {
                    matrix::mark_override(part);
                }
                changed.push(part.id.clone());
            }
            Ok(changed)
        }
        EditOperation::SetOutline { feature } => {
            let id = feature.id().to_string();
            if let Some(current) = doc.outline.iter_mut().find(|item| item.id() == id) {
                *current = feature.clone();
            } else {
                doc.outline.push(feature.clone());
            }
            Ok(vec![id])
        }
        EditOperation::AddPart { part, board_id } => {
            if doc.parts.iter().any(|item| item.id == part.id) {
                return Err(format!("Duplicate part {}", part.id));
            }
            if !geometry::part_valid(part, doc) {
                return Err(format!("Unknown definition {}", part.definition_id));
            }
            let board_index = if let Some(id) = board_id {
                Some(
                    doc.boards
                        .iter()
                        .position(|board| &board.id == id)
                        .ok_or_else(|| format!("Unknown board {id}"))?,
                )
            } else if doc.boards.is_empty() {
                None
            } else {
                Some(0)
            };
            let board_outline = board_index
                .and_then(|index| doc.boards.get(index))
                .map(|board| board.outline_ids.clone())
                .unwrap_or_default();
            if let Some(board) = board_index.and_then(|index| doc.boards.get_mut(index)) {
                board.part_ids.push(part.id.clone());
            }
            let mut attached = false;
            for feature in &mut doc.outline {
                if let OutlineFeature::PartEnvelope { id, part_ids, .. } = feature {
                    if board_outline.contains(id) {
                        part_ids.push(part.id.clone());
                        attached = true;
                    }
                }
            }
            if !attached && doc.boards.is_empty() {
                if let Some(OutlineFeature::PartEnvelope { part_ids, .. }) = doc
                    .outline
                    .iter_mut()
                    .find(|feature| matches!(feature, OutlineFeature::PartEnvelope { .. }))
                {
                    part_ids.push(part.id.clone());
                }
            }
            doc.parts.push(part.clone());
            Ok(vec![part.id.clone()])
        }
        EditOperation::RemoveParts { ids } => {
            doc.constraints.retain(|constraint| {
                !ids.iter()
                    .any(|id| id == constraint.source() || id == constraint.target())
            });
            doc.parts.retain(|part| !ids.contains(&part.id));
            for board in &mut doc.boards {
                board.part_ids.retain(|id| !ids.contains(id));
            }
            for net in &mut doc.nets {
                net.pins.retain(|pin| !ids.contains(&pin.part_id));
            }
            for feature in &mut doc.outline {
                if let OutlineFeature::PartEnvelope { part_ids, .. } = feature {
                    part_ids.retain(|id| !ids.contains(id));
                }
            }
            for matrix in &mut doc.matrices {
                matrix.part_ids.retain(|id| !ids.contains(id));
            }
            Ok(ids.clone())
        }
        EditOperation::SetNet { net } => {
            if let Some(current) = doc.nets.iter_mut().find(|item| item.id == net.id) {
                *current = net.clone();
            } else {
                doc.nets.push(net.clone());
            }
            if let Some(board) = doc.boards.first_mut() {
                if !board.net_ids.contains(&net.id) {
                    board.net_ids.push(net.id.clone());
                }
            }
            Ok(vec![net.id.clone()])
        }
        EditOperation::SetCase { body } => {
            if let Some(current) = doc.case_bodies.iter_mut().find(|item| item.id == body.id) {
                *current = body.clone();
            } else {
                doc.case_bodies.push(body.clone());
            }
            Ok(vec![body.id.clone()])
        }
        EditOperation::SetMatrix {
            matrix,
            definitions,
        } => {
            let mut changed = vec![];
            let mut provided = BTreeSet::new();
            for definition in definitions.iter().flatten() {
                if definition.id.is_empty()
                    || !definition
                        .id
                        .bytes()
                        .all(|c| c.is_ascii_alphanumeric() || c == b'-' || c == b'_')
                    || !provided.insert(&definition.id)
                {
                    return Err("Matrix definition ID is invalid or duplicated".into());
                }
                if let Some(existing) = doc.definitions.iter().find(|item| item.id == definition.id)
                {
                    if existing != definition {
                        return Err(format!("Conflicting definition {}", definition.id));
                    }
                    continue;
                }
                doc.definitions.push(definition.clone());
                changed.push(definition.id.clone());
            }
            changed.extend(matrix::set_matrix(doc, matrix)?);
            Ok(changed)
        }
        EditOperation::SetConstraint { constraint } => {
            if let Some(current) = doc
                .constraints
                .iter_mut()
                .find(|item| item.id() == constraint.id())
            {
                *current = constraint.clone();
            } else {
                doc.constraints.push(constraint.clone());
            }
            Ok(vec![constraint.id().into()])
        }
        EditOperation::RemoveConstraint { id } => {
            if !doc.constraints.iter().any(|item| item.id() == id) {
                return Err(format!("Unknown constraint {id}"));
            }
            doc.constraints.retain(|item| item.id() != id);
            Ok(vec![id.clone()])
        }
        EditOperation::ReplaceDocument { document } => {
            if document.format != "boardstudio/v2" {
                return Err("Unsupported document format".into());
            }
            let changed = changed_ids(doc, document);
            let mut prepared = document.clone();
            script::apply_scripts(&mut prepared)?;
            *doc = prepared;
            Ok(changed)
        }
    }
}

fn changed_ids(a: &ProjectDoc, b: &ProjectDoc) -> Vec<String> {
    let mut ids = BTreeSet::new();
    for part in a.parts.iter().chain(b.parts.iter()) {
        ids.insert(part.id.clone());
    }
    for feature in a.outline.iter().chain(b.outline.iter()) {
        ids.insert(feature.id().to_string());
    }
    ids.into_iter().collect()
}
