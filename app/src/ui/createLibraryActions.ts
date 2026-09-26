import type { Dispatch, SetStateAction } from 'react';
import type { EditOperation, EditPhase } from '@boardstudio/v2-contracts';
import type {
  PartDefinition,
  ProjectDoc
} from '../../../contracts/src/index';
import { courtyardSize, makeId } from './workbenchGeometry';

type Inputs = {
  activeModelDefinition: PartDefinition;
  onImportModel: ((file: File, definitionId: string, parameter?: string | undefined) => void) | undefined;
  document: ProjectDoc;
  emit: (operation: EditOperation, targetIds: string[], phase?: EditPhase, transactionId?: string | undefined) => void;
  editDefinition: PartDefinition;
  setDefinitionError: Dispatch<SetStateAction<string>>
};

export function createLibraryActions({ activeModelDefinition, onImportModel, document, emit, editDefinition, setDefinitionError }: Inputs) {
  const attachModel = (file: File) => {
    if (!activeModelDefinition || !onImportModel) return;
    onImportModel(file, activeModelDefinition.id);
  };

  const updateModel = (field: 'offset' | 'rotation' | 'scale', axis: 'x' | 'y' | 'z', value: number) => {
    if (!activeModelDefinition?.model) return;
    const definitions = document.definitions.map((definition) => definition.id === activeModelDefinition.id
      ? { ...definition, model: { ...definition.model!, [field]: { ...definition.model![field], [axis]: value } } }
      : definition);
    emit({ kind: 'replace-document', document: { ...document, definitions } }, [activeModelDefinition.id]);
  };

  const saveDefinition = (next: PartDefinition) => {
    const definitions = document.definitions.some((definition) => definition.id === next.id) ? document.definitions.map((definition) => definition.id === next.id ? next : definition) : [...document.definitions, next];
    emit({ kind: 'replace-document', document: { ...document, definitions } }, [next.id]);
  };

  const updateDefinition = (changes: Partial<PartDefinition>) => {
    if (!editDefinition) return;
    const envelopeSource = changes.courtyard
      ? { ...editDefinition.envelopeSource, courtyard: 'authored' as const }
      : editDefinition.envelopeSource;
    saveDefinition({ ...editDefinition, ...changes, ...(envelopeSource ? { envelopeSource } : {}) });
    setDefinitionError('');
  };

  const updateCourtyard = (axis: 'x' | 'y', value: string) => {
    const dimension = Number(value);
    if (!editDefinition || !Number.isFinite(dimension) || dimension <= 0) {
      setDefinitionError('Courtyard dimensions must be positive numbers.');
      return;
    }
    const size = courtyardSize(editDefinition.courtyard);
    const center = editDefinition.courtyard.length === 0 ? { x: 0, y: 0 } : {
      x: (Math.min(...editDefinition.courtyard.map((point) => point.x)) + Math.max(...editDefinition.courtyard.map((point) => point.x))) / 2,
      y: (Math.min(...editDefinition.courtyard.map((point) => point.y)) + Math.max(...editDefinition.courtyard.map((point) => point.y))) / 2,
    };
    const width = axis === 'x' ? dimension : size.x;
    const height = axis === 'y' ? dimension : size.y;
    const halfX = width / 2;
    const halfY = height / 2;
    updateDefinition({
      courtyard: [
        { x: center.x - halfX, y: center.y - halfY },
        { x: center.x + halfX, y: center.y - halfY },
        { x: center.x + halfX, y: center.y + halfY },
        { x: center.x - halfX, y: center.y + halfY },
      ]
    });
    setDefinitionError('');
  };

  const updatePad = (padId: string, changes: Partial<PartDefinition['pads'][number]>) => {
    if (!editDefinition || editDefinition.kicadSource) return;
    const current = editDefinition.pads.find((pad) => pad.id === padId);
    if (!current) return;
    const nextPad = { ...current, ...changes };
    if (changes.id && changes.id !== padId && editDefinition.pads.some((pad) => pad.id === changes.id)) {
      setDefinitionError('Pad IDs must be unique within the component.');
      return;
    }
    if (changes.number?.trim() && editDefinition.pads.some((pad) => pad.id !== padId && pad.number === changes.number?.trim())) {
      setDefinitionError('Pad numbers must be unique within the component.');
      return;
    }
    if (!nextPad.id.trim() || !nextPad.number.trim() || !Number.isFinite(nextPad.at.x) || !Number.isFinite(nextPad.at.y)
      || !Number.isFinite(nextPad.size.x) || !Number.isFinite(nextPad.size.y) || nextPad.size.x <= 0 || nextPad.size.y <= 0
      || (nextPad.drill !== undefined && (!Number.isFinite(nextPad.drill) || nextPad.drill <= 0))) {
      setDefinitionError('Pad IDs and numbers are required. Positions must be finite, sizes and drill must be positive.');
      return;
    }
    const pads = editDefinition.pads.map((pad) => pad.id === padId ? nextPad : pad);
    let nets = document.nets;
    if (nextPad.id !== padId) {
      const partIds = new Set(document.parts.filter((part) => part.definitionId === editDefinition.id).map((part) => part.id));
      nets = document.nets.map((net) => ({ ...net, pins: net.pins.map((pin) => partIds.has(pin.partId) && pin.padId === padId ? { ...pin, padId: nextPad.id } : pin) }));
    }
    emit({ kind: 'replace-document', document: { ...document, definitions: document.definitions.map((definition) => definition.id === editDefinition.id ? { ...editDefinition, pads } : definition), nets } }, [editDefinition.id, padId, nextPad.id]);
    setDefinitionError('');
  };

  const commitPadField = (padId: string, field: 'id' | 'number', value: string) => updatePad(padId, { [field]: value.trim() });

  const commitPadNumber = (padId: string, field: 'atX' | 'atY' | 'sizeX' | 'sizeY' | 'drill', value: string) => {
    const number = Number(value);
    if (field === 'drill') {
      updatePad(padId, { drill: value.trim() === '' ? undefined : number });
      return;
    }
    if (!Number.isFinite(number)) {
      setDefinitionError('Pad positions and dimensions must be finite numbers.');
      return;
    }
    const pad = editDefinition?.pads.find((item) => item.id === padId);
    if (!pad) return;
    if (field === 'atX') updatePad(padId, { at: { ...pad.at, x: number } });
    if (field === 'atY') updatePad(padId, { at: { ...pad.at, y: number } });
    if (field === 'sizeX') updatePad(padId, { size: { ...pad.size, x: number } });
    if (field === 'sizeY') updatePad(padId, { size: { ...pad.size, y: number } });
  };

  const addDefinitionPad = () => {
    if (!editDefinition || editDefinition.kicadSource) return;
    const pad = { id: makeId(), number: String(editDefinition.pads.length + 1), at: { x: 0, y: 0 }, size: { x: 2, y: 2 }, shape: 'circle' as const };
    updateDefinition({ pads: [...editDefinition.pads, pad] });
  };

  const removeDefinitionPad = (padId: string) => {
    if (!editDefinition || editDefinition.kicadSource) return;
    const partIds = new Set(document.parts.filter((part) => part.definitionId === editDefinition.id).map((part) => part.id));
    const nets = document.nets.map((net) => ({ ...net, pins: net.pins.filter((pin) => !partIds.has(pin.partId) || pin.padId !== padId) }));
    emit({ kind: 'replace-document', document: { ...document, definitions: document.definitions.map((definition) => definition.id === editDefinition.id ? { ...editDefinition, pads: editDefinition.pads.filter((pad) => pad.id !== padId) } : definition), nets } }, [editDefinition.id, padId]);
  };
  return { attachModel, updateModel, updateDefinition, updateCourtyard, updatePad, commitPadField, commitPadNumber, addDefinitionPad, removeDefinitionPad };
}
