export function runLatest<T>(sequence: { current: number }, work: () => Promise<T>, accept: (value: T) => void, reject: (error: unknown) => void): () => void {
  const current = ++sequence.current;
  void work().then((value) => {
    if (current === sequence.current) accept(value);
  }).catch((error: unknown) => {
    if (current === sequence.current) reject(error);
  });
  return () => {
    if (current === sequence.current) sequence.current += 1;
  };
}
