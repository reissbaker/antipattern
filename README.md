```
            __  _           __  __
 ___ ____  / /_(_)__  ___ _/ /_/ /____ _______
/ _ `/ _ \/ __/ / _ \/ _ `/ __/ __/ -_) __/ _ \
\_,_/_//_/\__/_/ .__/\_,_/\__/\__/\__/_/ /_//_/
              /_/
```

A dependency injection framework for dummies.

Goals:

* Define your dependencies in a file
* Support robust dependency mocking

Anti-goals:

* Decorators
* Forcing the rest of your code to use classes
* Automatic memoization
* Graph algorithms

## Examples:

```typescript
import { registry } from "antipattern";
import { memo } from "radash";

export const deps = registry(class {
  // All public methods must be async, and can be mocked
  async user() {
    return process.env.USER;
  }
  async pass() {
    return process.env.PASS;
  }
  async login() {
    return `${await this.user()}:${await this.pass()}`;
  }
  async cloud() {
    if(process.env.NODE_ENV === "development") return this.local();
    return this.aws();
  }

  // Private methods can be whatever
  private aws = memo(() => ({
    upload: async (file: string) => {
      // ...
    },
  }));
  private local = memo(() => ({
    upload: async (file: string) => {
      // ...
    },
  }));
});

// elsewhere:
const cloud = await deps.cloud();
await cloud.upload("./README.md");
```

Mocking with automatic restoration:

```typescript
import { withMock } from "antipattern";

const upload = vi.fn();
const testCloud = { upload };

await withMock(deps, "cloud", testCloud, async () => {
  const cloud = await deps.cloud();
  await cloud.upload("./tsconfig.json");
  expect(upload).toHaveBeenCalledOnce();
});
```

Manually mocking + restoring:

```typescript
import { mock } from "antipattern";

beforeEach(() => {
  const restores: Array<() => any> = [];
  restores.push(mock(deps, "user", "reissbaker"));
  restores.push(mock(deps, "pass", "hunter2s"));
  return () => {
    restores.forEach(restore => restore());
  };
});
```
