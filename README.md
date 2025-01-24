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
  private aws() {
    return {
      upload: async (file: string) => {
        // ...
      },
    };
  }

  private local() {
    return {
      upload: async (file: string) => {
        // ...
      },
    };
  }
});

// elsewhere:
const cloud = await deps.cloud();
await cloud.upload("./README.md");
```

Mocking:

```typescript
const upload = vi.fn();
const testCloud = { upload };

await withMock(deps, "cloud", testCloud, async () => {
  const cloud = await deps.cloud();
  await cloud.upload("./tsconfig.json");
  expect(upload).toHaveBeenCalledOnce();
});
```
