import type {
  MechanicalConfiguration,
  MechanicalPartProcess,
  MechanicalSwitchFamily,
  PartDefinition,
  ProjectDoc,
} from '@boardstudio/v2-contracts';

const constraintsVersion = '2026-09-24';
const standardProcessIds = ['plate', 'plate-foam', 'bottom-foam', 'bottom'] as const;
type StandardProcessId = (typeof standardProcessIds)[number];
type ProcessMethod = MechanicalConfiguration['method'];

export const materialOptionsForProcess = (
  partId: string,
  method: ProcessMethod,
): string[] => {
  if (partId.endsWith('foam')) return ['EVA'];
  switch (method) {
    case 'printed': return ['PLA', 'ABS'];
    case 'cnc': return ['Aluminium'];
    case 'cut-sheet': return ['Acrylic'];
    case 'pcb-fr4': return ['FR-4'];
  }
};

export const materialForProcess = (
  partId: string,
  method: MechanicalConfiguration['method'],
): string => {
  if (partId.endsWith('foam')) return 'EVA';
  switch (method) {
    case 'printed': return 'PLA';
    case 'cnc': return 'Aluminium';
    case 'cut-sheet': return 'Acrylic';
    case 'pcb-fr4': return 'FR-4';
  }
};

export const defaultPlateThickness = (family: MechanicalSwitchFamily | undefined): number =>
  family === 'choc-v1' ? 1.3 : family === 'choc-v2' ? 1.5 : 1.5;

export const switchMountingDatum = (family: MechanicalSwitchFamily): number =>
  family === 'choc-v1' ? 3.5 : 5.0;

export const plateToPcbGap = (
  family: MechanicalSwitchFamily,
  plateThickness: number,
): number => switchMountingDatum(family) - plateThickness;

export const defaultPlateFoamThickness = (gap: number): number =>
  Math.max(0, Math.floor((Math.min(3, gap - 0.2) + 1e-6) * 10) / 10);

function processThickness(
  partId: string,
  configuration: Pick<MechanicalConfiguration, 'plateThickness' | 'plateFoamThickness' | 'bottomFoamThickness' | 'bottomThickness'>,
): number {
  switch (partId) {
    case 'plate': return configuration.plateThickness;
    case 'plate-foam': return configuration.plateFoamThickness;
    case 'bottom-foam': return configuration.bottomFoamThickness;
    case 'bottom': return configuration.bottomThickness;
    default: return 1;
  }
}

function validMaterial(partId: string, method: ProcessMethod, material: string): boolean {
  return materialOptionsForProcess(partId, method).includes(material);
}

function makeProcess(
  partId: StandardProcessId,
  method: ProcessMethod,
  thickness: number,
): MechanicalPartProcess {
  const processMethod = partId.endsWith('foam') ? 'cut-sheet' : method;
  return {
    partId,
    method: processMethod,
    material: materialForProcess(partId, processMethod),
    thickness,
    constraintsVersion,
  };
}

export function createMechanicalConfiguration(
  document: ProjectDoc,
  boardId?: string,
): MechanicalConfiguration {
  const selectedBoardId = boardId ?? document.boards[0]?.id ?? '';
  const family = initialSwitchFamily(document, selectedBoardId) ?? 'mx';
  const plateThickness = defaultPlateThickness(family);
  const plateToPcb = plateToPcbGap(family, plateThickness);
  const plateFoamThickness = defaultPlateFoamThickness(plateToPcb);
  const thicknesses = {
    plateThickness,
    plateFoamThickness,
    bottomFoamThickness: 2,
    bottomThickness: 3,
  };
  return {
    boardId: selectedBoardId,
    method: 'printed',
    mount: 'tray',
    integratedPlateFrame: false,
    bottomStyle: 'shell',
    middleFrame: false,
    plateThickness,
    plateFoamThickness,
    pcbThickness: validPositive(document.boards.find((board) => board.id === selectedBoardId)?.thickness)
      ? document.boards.find((board) => board.id === selectedBoardId)!.thickness
      : 1.6,
    bottomFoamThickness: 2,
    batteryHeight: 0,
    bottomThickness: 3,
    plateToPcb,
    wallThickness: 2,
    clearance: 0.3,
    mounts: [],
    closureMounts: [],
    partProcesses: [
      makeProcess('plate', 'printed', thicknesses.plateThickness),
      makeProcess('plate-foam', 'printed', thicknesses.plateFoamThickness),
      makeProcess('bottom-foam', 'printed', thicknesses.bottomFoamThickness),
      makeProcess('bottom', 'printed', thicknesses.bottomThickness),
    ],
    profiles: [],
  };
}

export function normalizeMechanicalConfiguration(
  document: ProjectDoc,
  configuration: MechanicalConfiguration,
): MechanicalConfiguration {
  const board = document.boards.find((entry) => entry.id === configuration.boardId);
  const family = profileSwitchFamily(configuration)
    ?? initialSwitchFamily(document, configuration.boardId)
    ?? 'mx';
  const plateThickness = validPositive(configuration.plateThickness)
    ? configuration.plateThickness
    : defaultPlateThickness(family);
  const plateToPcb = plateToPcbGap(family, plateThickness);
  const resolved: MechanicalConfiguration = {
    ...configuration,
    method: configuration.method ?? 'printed',
    plateThickness,
    plateFoamThickness: validNonnegative(configuration.plateFoamThickness)
      ? configuration.plateFoamThickness
      : defaultPlateFoamThickness(plateToPcb),
    pcbThickness: validPositive(configuration.pcbThickness)
      ? configuration.pcbThickness
      : board?.thickness || 1.6,
    bottomFoamThickness: validNonnegative(configuration.bottomFoamThickness)
      ? configuration.bottomFoamThickness
      : 2,
    batteryHeight: configuration.battery
      ? validNonnegative(configuration.batteryHeight) ? configuration.batteryHeight : configuration.battery.size.z
      : 0,
    bottomThickness: validPositive(configuration.bottomThickness) ? configuration.bottomThickness : 3,
    plateToPcb,
    wallThickness: validPositive(configuration.wallThickness) ? configuration.wallThickness : 2,
    clearance: validNonnegative(configuration.clearance) ? configuration.clearance : 0.3,
  };
  const existing = configuration.partProcesses ?? [];
  const standard = standardProcessIds.map((partId) => {
    const prior = existing.find((entry) => entry.partId === partId);
    const method = partId.endsWith('foam') ? 'cut-sheet' : partId === 'plate'
      ? resolved.method
      : prior?.method ?? resolved.method;
    const material = prior?.material && validMaterial(partId, method, prior.material)
      ? prior.material
      : materialForProcess(partId, method);
    return {
      ...(prior ?? makeProcess(partId, method, processThickness(partId, resolved))),
      partId,
      method,
      material,
      thickness: processThickness(partId, resolved),
      constraintsVersion: prior?.constraintsVersion || constraintsVersion,
    };
  });
  const others = existing.filter((entry) => !standardProcessIds.includes(entry.partId as StandardProcessId));
  return { ...resolved, partProcesses: [...standard, ...others] };
}

export function profileSwitchFamily(configuration: MechanicalConfiguration): MechanicalSwitchFamily | undefined {
  const families = new Set(configuration.profiles
    .filter((profile) => profile.switchFamily)
    .map((profile) => profile.switchFamily));
  return families.size === 1 ? [...families][0] : undefined;
}

function validPositive(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function validNonnegative(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function inferSwitchFamily(
  definition: PartDefinition | undefined,
  partParameters?: Record<string, unknown>,
): MechanicalSwitchFamily | undefined {
  if (!definition) return undefined;
  const id = definition.id.toLowerCase();
  const source = definition.generator?.source.toLowerCase() ?? '';
  if (['mx-switch', 'mx-hotswap'].includes(id) || source.endsWith('/switch_mx') || ['builtin:mx-switch', 'builtin:mx-hotswap'].includes(source)) return 'mx';
  if (['choc-switch', 'choc-hotswap'].includes(id) || source === 'infused-kim/choc' || ['builtin:choc-switch', 'builtin:choc-hotswap'].includes(source)) return 'choc-v1';
  if (!source.endsWith('/switch_choc_v1_v2')) return undefined;
  const getEnabled = (name: string): boolean | undefined => {
    const value = partParameters?.[name] ?? definition.generator?.parameters[name];
    if (typeof value === 'boolean') return value;
    if (value && typeof value === 'object' && 'value' in value) {
      const parameterValue = (value as { value?: unknown }).value;
      return typeof parameterValue === 'boolean' ? parameterValue : undefined;
    }
    return undefined;
  };
  const v1 = getEnabled('choc_v1_support') ?? true;
  const v2 = getEnabled('choc_v2_support') ?? true;
  return v1 === v2 ? undefined : v1 ? 'choc-v1' : 'choc-v2';
}

export function initialSwitchFamily(
  document: ProjectDoc,
  boardId: string,
): MechanicalSwitchFamily | undefined {
  const board = document.boards.find((entry) => entry.id === boardId);
  const parts = document.parts.filter((part) => {
    const definition = document.definitions.find((item) => item.id === part.definitionId);
    return board?.partIds.includes(part.id) && (definition?.kind === 'switch'
      || inferSwitchFamily(definition, part.generatorParameters)
      || definition?.generator?.source.endsWith('/switch_choc_v1_v2'));
  });
  if (!parts.length) return undefined;
  const families = parts.map((part) => inferSwitchFamily(
    document.definitions.find((definition) => definition.id === part.definitionId),
    part.generatorParameters,
  ));
  if (families.some((family) => !family)) return undefined;
  const distinct = new Set(families);
  return distinct.size === 1 ? families[0] : undefined;
}
