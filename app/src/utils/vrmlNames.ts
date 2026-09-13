const alias = (name: string) =>
  `BS_${Array.from(name, (char) => char.codePointAt(0)!.toString(16)).join('_')}`;

// StepUp uses hyphenated names that Three's VRML lexer rejects.
// Encode references injectively, leaving comments, strings and field names intact.
export function vrmlNames(source: string) {
  let reference: 'node' | 'route' | undefined;
  return source.replace(
    /#[^\r\n]*|"(?:\\.|[^"\\])*"|[^\s{}[\],]+/g,
    (token) => {
      if (token.startsWith('#')) {
        return token;
      }
      if (reference) {
        const kind = reference;
        reference = undefined;
        if (token.startsWith('"')) {
          return token;
        }
        const field = kind === 'route' ? token.lastIndexOf('.') : -1;
        return field < 0
          ? alias(token)
          : alias(token.slice(0, field)) + token.slice(field);
      }
      if (token === 'DEF' || token === 'USE') {
        reference = 'node';
      } else if (token === 'ROUTE' || token === 'TO') {
        reference = 'route';
      }
      return token;
    }
  );
}
