export const createRequestId = (): string => {
  try {
    const cryptoAny = globalThis.crypto as any;
    if (cryptoAny?.randomUUID) return cryptoAny.randomUUID();
  } catch {
    // ignore
  }

  const rnd = Math.random().toString(16).slice(2);
  return `req_${Date.now().toString(16)}_${rnd}`;
};
