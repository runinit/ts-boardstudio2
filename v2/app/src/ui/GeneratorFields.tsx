import type { JsonValue, PartDefinition } from '../../../contracts/src/index';
import { generatorParameters, type GeneratorEdits } from './generatorSettings';

const labelFor = (key: string) => key.replaceAll('_', ' ').replace(/\b(pcb|xyz|led|rgb)\b/gi, (word) => word.toUpperCase()).replace(/^./, (letter) => letter.toUpperCase());

export function GeneratorFields({ definition, edits, onChange, onImportModel, error = '' }: {
  definition: PartDefinition; edits: GeneratorEdits; onChange: (key: string, value: JsonValue) => void;
  onImportModel?: (file: File, definitionId: string, parameter: string) => void;
  error?: string;
}) {
  const entries = Object.entries(generatorParameters(definition));
  const groups = [
    { name: 'Dimensions', kind: 'dimensions', open: true },
    { name: 'Footprint options', kind: 'options', open: true },
    { name: 'Identification', kind: 'identity', open: true },
    { name: 'Connections', kind: 'connections', open: false },
    { name: '3D model placement', kind: 'models', open: true },
    { name: 'Advanced parameters', kind: 'advanced', open: false },
  ];
  const groupFor = (key: string, type: string) => /3dmodel|model_/.test(key) ? 'models' : type === 'number' ? 'dimensions' : type === 'boolean' ? 'options' : type === 'net' ? 'connections' : type === 'string' ? 'identity' : 'advanced';
  return <div className="wb-generator-groups">{groups.map((group) => {
    const fields = entries.filter(([key, parameter]) => groupFor(key, parameter.type) === group.kind);
    if (!fields.length) return null;
    return <details key={`${definition.id}:${group.kind}`} open={group.open} className="wb-generator-group"><summary>{group.name}</summary>
      <div role="group" aria-label={group.name} className={`wb-generator-fields is-${group.kind}`}>
        {fields.map(([key, parameter]) => {
          const current = edits[key] ?? definition.generator?.parameters[key] ?? parameter.value;
          const label = labelFor(key);
          if (parameter.type === 'boolean') return <label className="wb-generator-toggle" key={key}><span>{label}</span><input type="checkbox" aria-label={key} checked={current === true} onChange={(event) => onChange(key, event.target.checked)} /></label>;
          if (parameter.type === 'array' || parameter.type === 'object' || parameter.type === 'anchor') {
            const value = typeof current === 'string' ? current : JSON.stringify(current ?? (parameter.type === 'array' ? [] : {}), null, 2);
            return <label className="wb-generator-field" key={key}>{label}<textarea rows={3} aria-label={key} spellCheck={false} value={value} onChange={(event) => onChange(key, event.target.value)} /></label>;
          }
          if (/3dmodel_filename$/iu.test(key)) return <div className="wb-generator-field wb-generator-model-field" key={key}>
            <label>{label}<input type="text" aria-label={key} readOnly value={String(current ?? '')} /></label>
            {onImportModel && <label className="wb-footprint-import">Attach STEP / WRL<input type="file" accept=".step,.stp,.wrl,model/step,model/vrml" onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) onImportModel(file, definition.id, key);
              event.currentTarget.value = '';
            }} /></label>}
            {current && <button type="button" className="wb-secondary" onClick={() => onChange(key, '')}>Remove model</button>}
            {error.toLowerCase().startsWith(key.replaceAll('_', ' ').toLowerCase()) && <span className="wb-generator-error" role="alert">{error}</span>}
          </div>;
          return <label className="wb-generator-field" key={key}>{label}<input type={parameter.type === 'number' ? 'number' : 'text'} step={parameter.type === 'number' ? 'any' : undefined} aria-label={parameter.type === 'number' ? key.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : key} value={String(current ?? '')} onChange={(event) => onChange(key, event.target.value)} /></label>;
        })}
      </div>
    </details>;
  })}</div>;
}
