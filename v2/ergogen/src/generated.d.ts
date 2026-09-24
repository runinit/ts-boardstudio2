declare module '../generated/catalogue.mjs' {
  const catalogue: Record<string, { params: Record<string, unknown>; body: (context: Record<string, unknown>) => string }>;
  export default catalogue;
}
