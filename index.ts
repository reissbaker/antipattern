export type Registry = {
  [k: string]: () => Promise<any>,
};

export function registry<T extends Registry>(r: T) {
  return r;
}

const unset = Symbol();
export function memoize<T>(cb: () => T | Promise<T>) {
  let val: T | typeof unset = unset;
  return async (): Promise<T> => {
    if(val !== unset) return val;
    val = await Promise.resolve(cb());
    return val;
  };
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
