use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

#[derive(Clone, Copy, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct Vec2 {
    pub x: f64,
    pub y: f64,
}
#[derive(Clone, Copy, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct Vec3 {
    pub x: f64,
    pub y: f64,
    pub z: f64,
}
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
pub struct Pose2 {
    pub at: Vec2,
    pub rotation: f64,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Material {
    pub id: String,
    pub name: String,
    pub thickness: f64,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Pad {
    pub id: String,
    pub number: String,
    pub at: Vec2,
    pub size: Vec2,
    pub shape: PadShape,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub drill: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub plated: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub side: Option<Side>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rotation: Option<f64>,
    #[serde(rename = "netId", skip_serializing_if = "Option::is_none")]
    pub net_id: Option<String>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PadShape {
    Circle,
    Oval,
    Rect,
    Roundrect,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PartModel {
    #[serde(rename = "assetId")]
    pub asset_id: String,
    pub offset: Vec3,
    pub rotation: Vec3,
    pub scale: Vec3,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PartDefinition {
    pub id: String,
    pub name: String,
    pub kind: PartKind,
    pub courtyard: Vec<Vec2>,
    pub pads: Vec<Pad>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub model: Option<PartModel>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub generator: Option<PartGenerator>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PartGenerator {
    pub source: String,
    pub version: String,
    pub parameters: BTreeMap<String, serde_json::Value>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PartKind {
    Switch,
    Controller,
    Connector,
    Encoder,
    Passive,
    Custom,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Part {
    pub id: String,
    #[serde(rename = "definitionId")]
    pub definition_id: String,
    pub reference: String,
    pub pose: Pose2,
    pub side: Side,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub locked: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub properties: Option<BTreeMap<String, serde_json::Value>>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Side {
    Front,
    Back,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Pin {
    #[serde(rename = "partId")]
    pub part_id: String,
    #[serde(rename = "padId")]
    pub pad_id: String,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Net {
    pub id: String,
    pub name: String,
    pub pins: Vec<Pin>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Matrix {
    pub id: String,
    pub rows: u32,
    pub columns: u32,
    pub pitch: Vec2,
    pub origin: Vec2,
    #[serde(rename = "definitionId")]
    pub definition_id: String,
    #[serde(rename = "partIds")]
    pub part_ids: Vec<String>,
    #[serde(rename = "boardId", skip_serializing_if = "Option::is_none")]
    pub board_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mirror: Option<Mirror>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rotation: Option<f64>,
    #[serde(rename = "edgeGap", skip_serializing_if = "Option::is_none")]
    pub edge_gap: Option<Vec2>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub diodes: Option<bool>,
    #[serde(rename = "diodeDirection", skip_serializing_if = "Option::is_none")]
    pub diode_direction: Option<DiodeDirection>,
    #[serde(rename = "rowOffsets", default, skip_serializing_if = "Vec::is_empty")]
    pub row_offsets: Vec<Vec2>,
    #[serde(
        rename = "columnOffsets",
        default,
        skip_serializing_if = "Vec::is_empty"
    )]
    pub column_offsets: Vec<Vec2>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub cells: Vec<MatrixCell>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct MatrixCell {
    pub row: u32,
    pub column: u32,
    pub enabled: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub diode: Option<bool>,
    #[serde(rename = "definitionId", skip_serializing_if = "Option::is_none")]
    pub definition_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub variant: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub offset: Option<Vec2>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rotation: Option<f64>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub assemblies: Vec<MatrixAssembly>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct MatrixAssembly {
    pub id: String,
    #[serde(rename = "definitionId")]
    pub definition_id: String,
    pub offset: Vec2,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rotation: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub side: Option<Side>,
}
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Mirror {
    None,
    X,
    Y,
}
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum DiodeDirection {
    Row2col,
    Col2row,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "kebab-case")]
pub enum OutlineFeature {
    Polygon {
        id: String,
        points: Vec<Vec2>,
        operation: Operation,
    },
    Rect {
        id: String,
        center: Vec2,
        size: Vec2,
        radius: f64,
        operation: Operation,
    },
    PartEnvelope {
        id: String,
        #[serde(rename = "partIds")]
        part_ids: Vec<String>,
        margin: f64,
        operation: Operation,
    },
}
impl OutlineFeature {
    pub fn id(&self) -> &str {
        match self {
            Self::Polygon { id, .. } | Self::Rect { id, .. } | Self::PartEnvelope { id, .. } => id,
        }
    }
    pub fn operation(&self) -> Operation {
        match self {
            Self::Polygon { operation, .. }
            | Self::Rect { operation, .. }
            | Self::PartEnvelope { operation, .. } => *operation,
        }
    }
}
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Operation {
    Add,
    Subtract,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Board {
    pub id: String,
    pub name: String,
    #[serde(rename = "outlineIds")]
    pub outline_ids: Vec<String>,
    #[serde(rename = "partIds")]
    pub part_ids: Vec<String>,
    #[serde(rename = "netIds")]
    pub net_ids: Vec<String>,
    pub thickness: f64,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub traces: Vec<CopperTrace>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub vias: Vec<CopperVia>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CopperTrace {
    pub id: String,
    pub start: Vec2,
    pub end: Vec2,
    pub width: f64,
    pub layer: Side,
    #[serde(rename = "netId", skip_serializing_if = "Option::is_none")]
    pub net_id: Option<String>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CopperVia {
    pub id: String,
    pub at: Vec2,
    pub size: f64,
    pub drill: f64,
    #[serde(rename = "netId", skip_serializing_if = "Option::is_none")]
    pub net_id: Option<String>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CaseBody {
    pub id: String,
    pub name: String,
    #[serde(rename = "boardId")]
    pub board_id: String,
    pub kind: CaseKind,
    pub thickness: f64,
    pub clearance: f64,
    #[serde(rename = "materialId", skip_serializing_if = "Option::is_none")]
    pub material_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub z: Option<f64>,
    #[serde(rename = "wallHeight", skip_serializing_if = "Option::is_none")]
    pub wall_height: Option<f64>,
    #[serde(rename = "wallThickness", skip_serializing_if = "Option::is_none")]
    pub wall_thickness: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mounts: Option<Vec<Mount>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub gasket: Option<Gasket>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Mount {
    pub id: String,
    pub at: Vec2,
    pub kind: MountKind,
    #[serde(rename = "holeDiameter")]
    pub hole_diameter: f64,
    #[serde(rename = "bossDiameter", skip_serializing_if = "Option::is_none")]
    pub boss_diameter: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub height: Option<f64>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MountKind {
    Hole,
    Boss,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Gasket {
    pub inset: f64,
    pub width: f64,
    pub depth: f64,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum CaseKind {
    Plate,
    Tray,
    Lid,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Asset {
    pub id: String,
    pub name: String,
    #[serde(rename = "mediaType")]
    pub media_type: String,
    pub sha256: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub license: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub source: Option<String>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Script {
    pub id: String,
    pub name: String,
    pub source: String,
    pub enabled: bool,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "kebab-case")]
pub enum Constraint {
    Offset {
        id: String,
        #[serde(rename = "sourcePartId")]
        source_part_id: String,
        #[serde(rename = "targetPartId")]
        target_part_id: String,
        offset: Vec2,
        rotation: f64,
    },
    Mirror {
        id: String,
        #[serde(rename = "sourcePartId")]
        source_part_id: String,
        #[serde(rename = "targetPartId")]
        target_part_id: String,
        axis: MirrorAxis,
        coordinate: f64,
    },
}
impl Constraint {
    pub fn id(&self) -> &str {
        match self {
            Self::Offset { id, .. } | Self::Mirror { id, .. } => id,
        }
    }
    pub fn source(&self) -> &str {
        match self {
            Self::Offset { source_part_id, .. } | Self::Mirror { source_part_id, .. } => {
                source_part_id
            }
        }
    }
    pub fn target(&self) -> &str {
        match self {
            Self::Offset { target_part_id, .. } | Self::Mirror { target_part_id, .. } => {
                target_part_id
            }
        }
    }
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MirrorAxis {
    Vertical,
    Horizontal,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ProjectDoc {
    pub format: String,
    pub id: String,
    pub name: String,
    pub revision: u64,
    pub parameters: BTreeMap<String, serde_json::Value>,
    pub definitions: Vec<PartDefinition>,
    pub parts: Vec<Part>,
    pub matrices: Vec<Matrix>,
    pub nets: Vec<Net>,
    pub outline: Vec<OutlineFeature>,
    pub boards: Vec<Board>,
    #[serde(rename = "caseBodies")]
    pub case_bodies: Vec<CaseBody>,
    pub materials: Vec<Material>,
    pub assets: Vec<Asset>,
    pub scripts: Vec<Script>,
    #[serde(default)]
    pub constraints: Vec<Constraint>,
}
impl ProjectDoc {
    pub fn empty(id: &str, name: &str) -> Self {
        Self {
            format: "boardstudio/v2".into(),
            id: id.into(),
            name: name.into(),
            revision: 0,
            parameters: BTreeMap::new(),
            definitions: vec![],
            parts: vec![],
            matrices: vec![],
            nets: vec![],
            outline: vec![],
            boards: vec![],
            case_bodies: vec![],
            materials: vec![],
            assets: vec![],
            scripts: vec![],
            constraints: vec![],
        }
    }
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "kebab-case")]
pub enum EditOperation {
    MoveParts {
        positions: Vec<Position>,
    },
    SetOutline {
        feature: OutlineFeature,
    },
    AddPart {
        part: Part,
        #[serde(rename = "boardId", skip_serializing_if = "Option::is_none")]
        board_id: Option<String>,
    },
    RemoveParts {
        ids: Vec<String>,
    },
    SetNet {
        net: Net,
    },
    SetCase {
        body: CaseBody,
    },
    SetMatrix {
        matrix: Matrix,
        #[serde(default, skip_serializing_if = "Option::is_none")]
        definitions: Option<Vec<PartDefinition>>,
    },
    SetConstraint {
        constraint: Constraint,
    },
    RemoveConstraint {
        id: String,
    },
    ReplaceDocument {
        document: ProjectDoc,
    },
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Position {
    pub id: String,
    pub at: Vec2,
}
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum EditPhase {
    Preview,
    Commit,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct EditCommand {
    #[serde(rename = "baseRevision")]
    pub base_revision: u64,
    #[serde(rename = "transactionId")]
    pub transaction_id: String,
    pub phase: EditPhase,
    #[serde(rename = "targetIds")]
    pub target_ids: Vec<String>,
    pub operation: EditOperation,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Contour {
    pub points: Vec<Vec2>,
    pub hole: bool,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Severity {
    Error,
    Warning,
    Info,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Scope {
    Layout,
    Outline,
    Pcb,
    Case,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Finding {
    pub id: String,
    pub severity: Severity,
    pub scope: Scope,
    pub message: String,
    #[serde(rename = "targetIds")]
    pub target_ids: Vec<String>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Readiness {
    pub layout: bool,
    pub outline: bool,
    pub pcb: bool,
    #[serde(rename = "case")]
    pub case_ready: bool,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Transform {
    pub id: String,
    pub pose: Pose2,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct BoardContours {
    #[serde(rename = "boardId")]
    pub board_id: String,
    pub contours: Vec<Contour>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct BoardReadiness {
    #[serde(rename = "boardId")]
    pub board_id: String,
    pub outline: bool,
    pub pcb: bool,
    #[serde(rename = "case")]
    pub case_ready: bool,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct SceneDelta {
    pub revision: u64,
    #[serde(rename = "transactionId")]
    pub transaction_id: String,
    #[serde(rename = "changedIds")]
    pub changed_ids: Vec<String>,
    pub transforms: Vec<Transform>,
    pub contours: Vec<Contour>,
    #[serde(rename = "boardContours")]
    pub board_contours: Vec<BoardContours>,
    #[serde(rename = "boardReadiness")]
    pub board_readiness: Vec<BoardReadiness>,
    pub findings: Vec<Finding>,
    pub readiness: Readiness,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "lowercase")]
pub enum CoreRequest {
    Open { id: String, document: ProjectDoc },
    Edit { id: String, command: EditCommand },
    Undo { id: String },
    Redo { id: String },
    Snapshot { id: String },
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "lowercase")]
pub enum CoreReply {
    Preview {
        id: String,
        scene: SceneDelta,
    },
    Scene {
        id: String,
        scene: SceneDelta,
        document: ProjectDoc,
    },
    Error {
        id: String,
        message: String,
        revision: u64,
    },
}
