type POJO = Record<any, any>;

export function registry<T>(R: { new(): T }): T;
export function registry<T extends POJO>(R: T): T;
export function registry<T extends POJO, R extends { new(): T }>(r: R | T): T {
  if(typeof r === "function") return new r();
  return r;
}

export async function withMock<T extends POJO, K extends keyof T>(
  r: T,
  key: K,
  replacement: T[K],
  cb: () => any,
) {
  const restore = mock(r, key, replacement);
  try {
    await Promise.resolve(cb());
  } finally {
    restore();
  }
}

export function mock<T extends POJO, K extends keyof T>(
  r: T,
  key: K,
  replacement: T[K],
) {
  const original = r[key];
  r[key] = replacement;

  return () => {
    r[key] = original;
  }
}
