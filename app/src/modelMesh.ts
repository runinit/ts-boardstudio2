import type { StepModel } from '@boardstudio/v2-cad';
import { readMeshModel } from './renderClient';

export type ModelMesh = StepModel['mesh'] & { colors?: Float32Array };
export { readMeshModel };
