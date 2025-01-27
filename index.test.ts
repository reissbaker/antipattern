import { it, describe, expect } from "vitest";
import { memo } from "radash";
import { registry, withMock, mock } from "./index";

const r = registry(class {
  async hello() {
    return  "hello";
  }

  async world() {
    return "world";
  }

  async foo() {
    const h = await this.hello();
    const w = await this.world();
    return `${h}${this.space()}${w}`;
  }

  private space = memo(() => this.noop() + " ");
  private noop = memo(() => "");
})

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
describe("mock", () => {
  it("mocks the returned object and restores when restore is called", async () => {
    const restore = mock(r, "hello", "goodbye");
    expect(await r.hello()).toBe("goodbye");
    expect(await r.foo()).toBe("goodbye world");
    restore();
    expect(await r.hello()).toBe("hello");
    expect(await r.foo()).toBe("hello world");
  });
});
