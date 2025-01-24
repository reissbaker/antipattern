export type Registry = {
  [k: string]: () => Promise<any>,
};

export function registry<T extends Registry>(r: T) {
  return r;
}

export async function withMock<T extends Registry, K extends keyof T>(
  r: T,
  key: K,
  replacement: Awaited<ReturnType<T[K]>>,
  cb: () => any,
) {
  const original = r[key];
  // @ts-ignore
  r[key] = async function() {
    return replacement;
  }.bind(r);
  try {
    await Promise.resolve(cb());
  } finally {
    r[key] = original;
  }
}
