export const DEPLOYMENT_PATH = '/boardstudio/';

export function resolvePublicBase(
  mode: string,
  configuredBase?: string,
  fallback = DEPLOYMENT_PATH
): string {
  if (mode === 'development') {
    return '/';
  }

  const base = configuredBase || fallback;
  return `${base.replace(/\/+$/, '')}/`;
}
