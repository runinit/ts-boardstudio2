use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase")]
pub struct ArchiveEntry {
    pub path: String,
    pub buffer_index: u32,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase")]
pub struct ArchiveAssetBuffer {
    pub sha256: String,
    pub buffer_index: u32,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(tag = "kind", rename_all = "kebab-case")]
pub enum ArchiveRequest {
    PackProject {
        #[serde(rename = "projectJson")]
        project_json: String,
        #[serde(
            rename = "archiveJson",
            default,
            skip_serializing_if = "Option::is_none"
        )]
        #[cfg_attr(feature = "export-types", ts(optional))]
        archive_json: Option<String>,
        assets: Vec<ArchiveEntry>,
    },
    UnpackProject,
    PackFiles {
        entries: Vec<ArchiveEntry>,
    },
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(tag = "kind", rename_all = "kebab-case")]
pub enum ArchiveReply {
    Packed,
    Unpacked {
        #[serde(rename = "projectJson")]
        project_json: String,
        assets: Vec<ArchiveAssetBuffer>,
    },
    Error {
        message: String,
    },
}

#[derive(Clone, Copy, Debug, Default, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
pub struct Vec2 {
    pub x: f64,
    pub y: f64,
}
#[derive(Clone, Copy, Debug, Default, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
pub struct Vec3 {
    pub x: f64,
    pub y: f64,
    pub z: f64,
}
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
pub struct Pose2 {
    pub at: Vec2,
    pub rotation: f64,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
pub struct Material {
    pub id: String,
    pub name: String,
    pub thickness: f64,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
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
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "lowercase")]
pub enum PadShape {
    Circle,
    Oval,
    Rect,
    Roundrect,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
pub struct PartModel {
    #[serde(rename = "assetId")]
    pub asset_id: String,
    pub offset: Vec3,
    pub rotation: Vec3,
    pub scale: Vec3,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase")]
pub struct KicadSource {
    #[cfg_attr(feature = "export-types", ts(type = "1"))]
    pub format_version: u8,
    pub source: String,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
pub struct PartDefinition {
    pub id: String,
    pub name: String,
    pub kind: PartKind,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub keycap: Option<Vec2>,
    #[serde(
        rename = "envelopeSource",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub envelope_source: Option<EnvelopeSource>,
    #[serde(
        rename = "kicadSource",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub kicad_source: Option<KicadSource>,
    #[cfg_attr(
        feature = "export-types",
        ts(as = "Option<BTreeMap<String, Vec<String>>>", optional)
    )]
    #[serde(default, skip_serializing_if = "BTreeMap::is_empty")]
    pub terminals: BTreeMap<String, Vec<String>>,
    #[serde(
        rename = "matrixTerminals",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub matrix_terminals: Option<MatrixTerminals>,
    #[serde(
        rename = "envelopeNotice",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub envelope_notice: Option<String>,
    pub courtyard: Vec<Vec2>,
    pub pads: Vec<Pad>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub model: Option<PartModel>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub models: Option<Vec<PartModel>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub generator: Option<PartGenerator>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Default)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase", default)]
pub struct EnvelopeSource {
    #[cfg_attr(feature = "export-types", ts(optional = nullable))]
    pub courtyard: Option<EnvelopeOrigin>,
    #[cfg_attr(feature = "export-types", ts(optional = nullable))]
    pub keycap: Option<EnvelopeOrigin>,
}
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "lowercase")]
pub enum EnvelopeOrigin {
    Generated,
    Authored,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
pub struct MatrixTerminals {
    pub row: String,
    pub column: String,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
pub struct PartGenerator {
    pub source: String,
    pub version: String,
    pub parameters: BTreeMap<String, serde_json::Value>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "lowercase")]
pub enum PartKind {
    Switch,
    Controller,
    Connector,
    Encoder,
    Passive,
    Custom,
    Utility,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
pub struct Part {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub keycap: Option<Vec2>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub outline: Option<PartOutline>,
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
    #[serde(
        rename = "generatorParameters",
        skip_serializing_if = "Option::is_none"
    )]
    pub generator_parameters: Option<BTreeMap<String, serde_json::Value>>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "lowercase")]
pub enum Side {
    Front,
    Back,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
pub struct Pin {
    #[serde(rename = "partId")]
    pub part_id: String,
    #[serde(rename = "padId")]
    pub pad_id: String,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
pub struct Net {
    pub id: String,
    pub name: String,
    pub pins: Vec<Pin>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
pub struct Matrix {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
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
    #[cfg_attr(feature = "export-types", ts(as = "Option<Vec<Vec2>>", optional))]
    #[serde(rename = "rowOffsets", default, skip_serializing_if = "Vec::is_empty")]
    pub row_offsets: Vec<Vec2>,
    #[cfg_attr(feature = "export-types", ts(as = "Option<Vec<Vec2>>", optional))]
    #[serde(
        rename = "columnOffsets",
        default,
        skip_serializing_if = "Vec::is_empty"
    )]
    pub column_offsets: Vec<Vec2>,
    #[cfg_attr(feature = "export-types", ts(as = "Option<Vec<f64>>", optional))]
    #[serde(
        rename = "columnStaggers",
        default,
        skip_serializing_if = "Vec::is_empty"
    )]
    pub column_staggers: Vec<f64>,
    #[cfg_attr(feature = "export-types", ts(as = "Option<Vec<f64>>", optional))]
    #[serde(
        rename = "columnSplays",
        default,
        skip_serializing_if = "Vec::is_empty"
    )]
    pub column_splays: Vec<f64>,
    #[cfg_attr(
        feature = "export-types",
        ts(as = "Option<Vec<Option<Vec2>>>", optional)
    )]
    #[serde(
        rename = "columnOrigins",
        default,
        skip_serializing_if = "Vec::is_empty"
    )]
    pub column_origins: Vec<Option<Vec2>>,
    #[cfg_attr(feature = "export-types", ts(as = "Option<Vec<MatrixCell>>", optional))]
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub cells: Vec<MatrixCell>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
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
    #[cfg_attr(
        feature = "export-types",
        ts(as = "Option<Vec<MatrixAssembly>>", optional)
    )]
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub assemblies: Vec<MatrixAssembly>,
    #[serde(
        rename = "assembliesLocal",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub assemblies_local: Option<bool>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
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
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "lowercase")]
pub enum Mirror {
    None,
    X,
    Y,
}
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "lowercase")]
pub enum DiodeDirection {
    Row2col,
    Col2row,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Default)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase", default)]
pub struct PartOutline {
    #[cfg_attr(feature = "export-types", ts(as = "Option<bool>", optional))]
    pub excluded: bool,
    #[cfg_attr(feature = "export-types", ts(as = "Option<f64>", optional))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub margin: Option<f64>,
}
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize, Default)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "lowercase")]
pub enum CornerStyle {
    #[default]
    Sharp,
    Fillet,
    Chamfer,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase", default)]
pub struct OutlineSettings {
    pub corners: CornerStyle,
    pub size: f64,
    pub bridge_width: f64,
}
impl Default for OutlineSettings {
    fn default() -> Self {
        Self {
            corners: CornerStyle::Sharp,
            size: 2.0,
            bridge_width: 10.0,
        }
    }
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
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
        #[cfg_attr(feature = "export-types", ts(as = "Option<OutlineSettings>", optional))]
        #[serde(default)]
        settings: OutlineSettings,
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
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "lowercase")]
pub enum Operation {
    Add,
    Subtract,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
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
    #[cfg_attr(
        feature = "export-types",
        ts(as = "Option<Vec<CopperTrace>>", optional)
    )]
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub traces: Vec<CopperTrace>,
    #[cfg_attr(feature = "export-types", ts(as = "Option<Vec<CopperVia>>", optional))]
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub vias: Vec<CopperVia>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
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
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
pub struct CopperVia {
    pub id: String,
    pub at: Vec2,
    pub size: f64,
    pub drill: f64,
    #[serde(rename = "netId", skip_serializing_if = "Option::is_none")]
    pub net_id: Option<String>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
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
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
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
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "lowercase")]
pub enum MountKind {
    Hole,
    Boss,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
pub struct Gasket {
    pub inset: f64,
    pub width: f64,
    pub depth: f64,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "lowercase")]
pub enum CaseKind {
    Plate,
    Tray,
    Lid,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
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
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
pub struct Script {
    pub id: String,
    pub name: String,
    pub source: String,
    pub enabled: bool,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
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
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "lowercase")]
pub enum MirrorAxis {
    Vertical,
    Horizontal,
}
/// A named key layout and its independent, board-owned components.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
#[serde(rename_all = "camelCase")]
pub struct Layout {
    pub id: String,
    pub name: String,
    pub board_id: String,
    pub matrix_id: String,
    pub part_ids: Vec<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub mirror_link: Option<LayoutMirrorLink>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase")]
pub struct LayoutMirrorLink {
    pub source_id: String,
    pub axis_x: f64,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
pub struct ProjectDoc {
    #[cfg_attr(feature = "export-types", ts(type = "\"boardstudio/v2\""))]
    pub format: String,
    pub id: String,
    pub name: String,
    pub revision: u64,
    pub parameters: BTreeMap<String, serde_json::Value>,
    pub definitions: Vec<PartDefinition>,
    pub parts: Vec<Part>,
    pub matrices: Vec<Matrix>,
    #[cfg_attr(feature = "export-types", ts(as = "Option<Vec<Layout>>", optional))]
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub layouts: Vec<Layout>,
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
            layouts: vec![],
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
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "kebab-case")]
pub enum MatrixSplayAffect {
    Column,
    Following,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(tag = "kind", rename_all = "kebab-case")]
pub enum MatrixSplayChange {
    Origin {
        world: Option<Vec2>,
    },
    Angle {
        angle: f64,
        affect: MatrixSplayAffect,
    },
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
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
        #[cfg_attr(feature = "export-types", ts(optional))]
        #[serde(rename = "boardId", skip_serializing_if = "Option::is_none")]
        board_id: Option<String>,
    },
    RemoveMatrix {
        id: String,
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
    SetMatrixSplay {
        #[serde(rename = "matrixId")]
        matrix_id: String,
        column: u32,
        change: MatrixSplayChange,
    },
    SetConstraint {
        constraint: Constraint,
    },
    CreateMirroredPair {
        left: Layout,
        right: Layout,
        matrix: Matrix,
        #[serde(default, skip_serializing_if = "Option::is_none")]
        definitions: Option<Vec<PartDefinition>>,
    },
    SetLayout {
        layout: Layout,
    },
    RemoveConstraint {
        id: String,
    },
    ReplaceDocument {
        document: ProjectDoc,
    },
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
pub struct Position {
    pub id: String,
    pub at: Vec2,
}
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "lowercase")]
pub enum EditPhase {
    Preview,
    Commit,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
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
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
pub struct Contour {
    pub points: Vec<Vec2>,
    pub hole: bool,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
pub struct CaseIR {
    pub revision: u64,
    pub body: CaseBody,
    pub contours: Vec<Contour>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
pub struct CaseAssemblyIR {
    pub revision: u64,
    pub bodies: Vec<CaseIR>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
pub struct PreparedCaseIR {
    pub revision: u64,
    pub body: CaseBody,
    pub regions: Vec<PreparedCaseRegion>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
pub struct PreparedCaseRegion {
    pub outer: Vec<Vec2>,
    pub holes: Vec<Vec<Vec2>>,
    pub cavities: Vec<Vec<Vec2>>,
    pub gaskets: Vec<PreparedGasketRegion>,
    pub mounts: Vec<Mount>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
pub struct PreparedGasketRegion {
    pub outer: Vec<Vec2>,
    pub holes: Vec<Vec<Vec2>>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
pub struct PreparedCaseAssemblyIR {
    pub revision: u64,
    pub bodies: Vec<PreparedCaseIR>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "lowercase")]
pub enum Severity {
    Error,
    Warning,
    Info,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "lowercase")]
pub enum Scope {
    Layout,
    Outline,
    Pcb,
    Case,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
pub struct Finding {
    pub id: String,
    pub severity: Severity,
    pub scope: Scope,
    pub message: String,
    #[serde(rename = "targetIds")]
    pub target_ids: Vec<String>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
pub struct Readiness {
    pub layout: bool,
    pub outline: bool,
    pub pcb: bool,
    #[serde(rename = "case")]
    pub case_ready: bool,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
pub struct Transform {
    pub id: String,
    pub pose: Pose2,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
pub struct BoardContours {
    #[serde(rename = "boardId")]
    pub board_id: String,
    pub contours: Vec<Contour>,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
pub struct BoardReadiness {
    #[serde(rename = "boardId")]
    pub board_id: String,
    pub outline: bool,
    pub pcb: bool,
    #[serde(rename = "case")]
    pub case_ready: bool,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[cfg_attr(feature = "export-types", ts(optional_fields))]
pub struct SceneDelta {
    pub revision: u64,
    #[serde(rename = "transactionId")]
    pub transaction_id: String,
    #[serde(rename = "changedIds")]
    pub changed_ids: Vec<String>,
    pub transforms: Vec<Transform>,
    #[serde(rename = "matrixScenes")]
    pub matrix_scenes: Vec<MatrixScene>,
    pub contours: Vec<Contour>,
    #[serde(rename = "boardContours")]
    pub board_contours: Vec<BoardContours>,
    #[serde(rename = "boardReadiness")]
    pub board_readiness: Vec<BoardReadiness>,
    pub findings: Vec<Finding>,
    pub readiness: Readiness,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
pub struct MatrixScene {
    #[serde(rename = "matrixId")]
    pub matrix_id: String,
    pub cells: Vec<MatrixSceneCell>,
    pub columns: Vec<MatrixColumnBasis>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
pub struct MatrixSceneCell {
    pub row: u32,
    pub column: u32,
    pub enabled: bool,
    #[serde(rename = "memberId", skip_serializing_if = "Option::is_none")]
    #[cfg_attr(feature = "export-types", ts(optional))]
    pub member_id: Option<String>,
    pub pose: Pose2,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
pub struct MatrixColumnBasis {
    pub column: u32,
    #[serde(rename = "splayOrigin")]
    pub splay_origin: Vec2,
    #[serde(rename = "splayAngle")]
    pub splay_angle: f64,
    #[serde(rename = "customOrigin")]
    pub custom_origin: bool,
    #[serde(rename = "axisX")]
    pub axis_x: Vec2,
    #[serde(rename = "axisY")]
    pub axis_y: Vec2,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(tag = "kind", rename_all = "lowercase")]
pub enum CoreRequest {
    Open {
        id: String,
        document: ProjectDoc,
    },
    Edit {
        id: String,
        command: EditCommand,
    },
    Undo {
        id: String,
    },
    Redo {
        id: String,
    },
    Snapshot {
        id: String,
    },
    #[serde(rename = "project-matrices")]
    ProjectMatrices {
        id: String,
        #[serde(rename = "baseRevision")]
        base_revision: u64,
        matrices: Vec<Matrix>,
    },
    #[serde(rename = "prepare-case")]
    PrepareCase {
        id: String,
        ir: CaseAssemblyIR,
    },
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
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
    #[serde(rename = "matrix-projections")]
    MatrixProjections {
        id: String,
        revision: u64,
        #[serde(rename = "matrixScenes")]
        matrix_scenes: Vec<MatrixScene>,
    },
    Error {
        id: String,
        message: String,
        revision: u64,
    },
    #[serde(rename = "case-prepared")]
    CasePrepared {
        id: String,
        ir: PreparedCaseAssemblyIR,
    },
}

#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "lowercase")]
pub enum OutlineExportFormat {
    Svg,
    Dxf,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase")]
pub struct LocalTrace {
    pub id: String,
    pub start: Vec2,
    pub end: Vec2,
    pub width: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pad_id: Option<String>,
    pub layer: Side,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase")]
pub struct LocalVia {
    pub id: String,
    pub at: Vec2,
    pub size: f64,
    pub drill: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pad_id: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase")]
pub struct FootprintGeometry {
    pub side: Side,
    pub courtyard: Vec<Vec2>,
    pub pads: Vec<Pad>,
    pub traces: Vec<LocalTrace>,
    pub vias: Vec<LocalVia>,
}

#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "kebab-case")]
pub enum ArtifactDiagnosticKind {
    Approximation,
    UnavailableModel,
    ExportUnsupported,
    ParseError,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase")]
pub struct ArtifactDiagnostic {
    pub kind: ArtifactDiagnosticKind,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub target_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub source_start: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub source_end: Option<u64>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase")]
pub struct CompiledFootprint {
    pub definition: PartDefinition,
    pub geometry: FootprintGeometry,
    pub diagnostics: Vec<ArtifactDiagnostic>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub preview_svg: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase")]
pub struct FootprintCompileJob {
    pub id: String,
    pub definition: PartDefinition,
    pub parameters: BTreeMap<String, serde_json::Value>,
    pub side: Side,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "kebab-case")]
pub enum ArtifactErrorCode {
    ParseError,
    Validation,
    Unsupported,
    StaleResult,
    MismatchedResults,
    NotFound,
    Internal,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase")]
pub struct ArtifactError {
    pub code: ArtifactErrorCode,
    pub message: String,
    pub diagnostics: Vec<ArtifactDiagnostic>,
}

impl ArtifactError {
    pub(crate) fn new(code: ArtifactErrorCode, message: impl Into<String>) -> Self {
        Self {
            code,
            message: message.into(),
            diagnostics: Vec::new(),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase")]
pub struct FootprintPatch {
    #[cfg_attr(feature = "export-types", ts(optional))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub footprint_name: Option<String>,
    #[cfg_attr(feature = "export-types", ts(optional))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reference: Option<String>,
    #[cfg_attr(feature = "export-types", ts(optional))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<String>,
    #[cfg_attr(feature = "export-types", ts(optional))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub placement: Option<Pose2>,
    pub side: Side,
    pub pad_nets: BTreeMap<String, (u32, String)>,
    pub uuid_scope: String,
    #[cfg_attr(feature = "export-types", ts(as = "Option<Vec<String>>", optional))]
    #[serde(default)]
    pub model_forms: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase")]
pub struct PrepareExportRequest {
    pub snapshot_token: String,
    pub expected_revision: u64,
    pub document: ProjectDoc,
    pub target: ExportTarget,
    pub contours: Vec<Contour>,
    pub model_paths: BTreeMap<String, String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(tag = "kind", rename_all = "kebab-case")]
#[serde(rename_all_fields = "camelCase")]
pub enum ExportTarget {
    Board { board_id: String },
    StandaloneFootprints { definition_ids: Vec<String> },
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase")]
pub struct ErgogenJob {
    pub job_id: String,
    pub definition: PartDefinition,
    pub part: Part,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase")]
pub struct ReservedNet {
    pub name: String,
    pub index: u32,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase")]
pub struct ExportPlan {
    pub snapshot_token: String,
    pub fingerprint: String,
    pub revision: u64,
    pub target: ExportTarget,
    pub jobs: Vec<ErgogenJob>,
    pub reserved_nets: Vec<ReservedNet>,
    pub next_net_index: u32,
    pub contours: Vec<Contour>,
    pub captured_document: ProjectDoc,
    pub model_paths: BTreeMap<String, String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase")]
pub struct ErgogenJobResult {
    pub snapshot_token: String,
    pub revision: u64,
    pub job_id: String,
    pub source: String,
    pub nets: Vec<ReservedNet>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase")]
pub struct FinishExportRequest {
    pub plan: ExportPlan,
    pub results: Vec<ErgogenJobResult>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase")]
pub struct ArtifactFile {
    pub filename: String,
    pub content: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase")]
pub struct ExportArtifact {
    pub snapshot_token: String,
    pub revision: u64,
    pub files: Vec<ArtifactFile>,
    #[cfg_attr(feature = "export-types", ts(as = "Option<Vec<String>>", optional))]
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub skipped_utilities: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase")]
pub struct OutlineExportRequest {
    pub filename: String,
    pub board: Board,
    pub contours: Vec<Contour>,
    pub format: OutlineExportFormat,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(tag = "kind", rename_all = "kebab-case")]
#[serde(rename_all_fields = "camelCase")]
pub enum ArtifactRequest {
    CompileFootprints {
        id: String,
        jobs: Vec<FootprintCompileJob>,
    },
    ImportFootprint {
        id: String,
        definition_id: String,
        source: String,
    },
    PrepareExport {
        id: String,
        request: PrepareExportRequest,
    },
    FinishExport {
        id: String,
        request: FinishExportRequest,
    },
    ExportOutline {
        id: String,
        request: OutlineExportRequest,
    },
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(tag = "kind", rename_all = "kebab-case")]
#[serde(rename_all_fields = "camelCase")]
pub enum ArtifactReply {
    CompileFootprints {
        id: String,
        result: Vec<CompiledFootprint>,
    },
    ImportFootprint {
        id: String,
        result: CompiledFootprint,
    },
    PrepareExport {
        id: String,
        result: ExportPlan,
    },
    FinishExport {
        id: String,
        result: ExportArtifact,
    },
    ExportOutline {
        id: String,
        result: ArtifactFile,
    },
    Error {
        id: String,
        error: ArtifactError,
    },
}
