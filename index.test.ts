import { it, describe, expect } from "vitest";
import { registry, withMock } from ".";

const r = registry({
  async hello() {
    return  "hello";
  },

  async world() {
    return "world";
  },

  async foo() {
    const h = await this.hello();
    const w = await this.world();
    return `${h} ${w}`;
  },
});

describe("withMock", () => {
  it("mocks the returned object", async () => {
    await withMock(r, "hello", "goodbye", async () => {
      expect(await r.hello()).toBe("goodbye");
      expect(await r.foo()).toBe("goodbye world");
    });
  });
  it("resets the mocks afterwards", async () => {
    await withMock(r, "hello", "goodbye", async () => {
      expect(await r.hello()).toBe("goodbye");
    });
    expect(await r.hello()).toBe("hello");
  });
});
