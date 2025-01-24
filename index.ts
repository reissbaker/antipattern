type IsAsync<T> = T extends { [K in keyof T]: (...args: any[]) => Promise<any> } ? T : never;

export function registry<T>(R: { new(): IsAsync<T> }): IsAsync<T> {
  return new R();
}

export async function withMock<T, K extends keyof T>(
  r: IsAsync<T>,
  key: K,
  replacement: Awaited<ReturnType<T[K] extends (...args: any[]) => any ? T[K] : never>>,
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
