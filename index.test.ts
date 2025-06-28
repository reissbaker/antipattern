import { it, describe, expect } from "vitest";
import { memo } from "radash";
import { registry, withMock, mock } from "./index.ts";

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

  sync() {
    return "sync";
  }

  private space = memo(() => this.noop() + " ");
  private noop = memo(() => "");
})

describe("simple object registries", async () => {
  it("allows mocking", async () => {
    const r = registry({
      async hi() {
        return "hello";
      },
      async world() {
        return "world";
      },
      async foo() {
        return `${await this.hi()} ${await this.world()}`
      },
    });
    await withMock(r, "hi", async () => "goodbye", async () => {
      expect(await r.hi()).toBe("goodbye");
      expect(await r.foo()).toBe("goodbye world");
    });
  });
});

describe("withMock", () => {
  it("mocks the returned object", async () => {
    await withMock(r, "hello", async () => "goodbye", async () => {
      expect(await r.hello()).toBe("goodbye");
      expect(await r.foo()).toBe("goodbye world");
    });
  });

  it("resets the mocks afterwards", async () => {
    await withMock(r, "hello", async () => "goodbye", async () => {
      expect(await r.hello()).toBe("goodbye");
    });
    expect(await r.hello()).toBe("hello");
  });

  it("works with non-async functions", async () => {
    await withMock(r, "sync", () => "ok", () => {
      expect(r.sync()).toBe("ok");
    });
    expect(r.sync()).toBe("sync");
  });
});

describe("mock", () => {
  it("mocks the returned object and restores when restore is called", async () => {
    const restore = mock(r, "hello", async () => "goodbye");
    expect(await r.hello()).toBe("goodbye");
    expect(await r.foo()).toBe("goodbye world");
    restore();
    expect(await r.hello()).toBe("hello");
    expect(await r.foo()).toBe("hello world");
  });
});
