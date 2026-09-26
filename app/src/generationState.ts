import type { CadProgress } from '@boardstudio/v2-cad';

export type GenerationState = {
  status: 'required' | 'preparing' | 'running' | 'ready' | 'blocked' | 'failed' | 'cancelled';
  revision?: number;
  progress?: CadProgress;
  message?: string;
};

export function generationMessage(state: GenerationState): string {
  if (state.status === 'preparing') return 'Preparing geometry…';
  if (state.status === 'running') {
    const progress = state.progress;
    if (!progress || progress.stage === 'loading') return 'Loading CAD…';
    return `${progress.stage === 'building' ? 'Building' : 'Tessellating'} ${progress.body ?? 'assembly'} · ${progress.completed}/${progress.total} parts`;
  }
  if (state.status === 'ready') return 'Generated geometry is current';
  if (state.status === 'blocked') return 'Generation blocked · review mechanical findings';
  if (state.status === 'failed') return state.message ?? 'Generation failed';
  if (state.status === 'cancelled') return 'Generation cancelled · previous geometry retained';
  return 'Generate required · edits are not yet in the CAD solids';
}
