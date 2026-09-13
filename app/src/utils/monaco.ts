import { Monaco } from '@monaco-editor/react';
import { theme } from '../theme/theme';

let themeDefined = false;

export const defineErgogenTheme = (monaco: Monaco) => {
  if (themeDefined) {
    return;
  }
  monaco.editor.defineTheme('ergogen-theme', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': theme.colors.backgroundLight,
    },
  });
  themeDefined = true;
};
