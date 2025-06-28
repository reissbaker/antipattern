```
            __  _           __  __
 ___ ____  / /_(_)__  ___ _/ /_/ /____ _______
/ _ `/ _ \/ __/ / _ \/ _ `/ __/ __/ -_) __/ _ \
\_,_/_//_/\__/_/ .__/\_,_/\__/\__/\__/_/ /_//_/
              /_/
```

A tiny, simple dependency injection framework for dummies.

Goals:

* Define your dependencies in a file
* Support robust dependency mocking

Anti-goals:

* Decorators
* Forcing your code to use classes
* Automatic memoization
* Graph algorithms

## Examples:

The simplest possible dependency registry is just an object:

```typescript
import { registry } from "antipattern";
export const deps = registry({
  hello() {
    return "world";
  },
});

// elsewhere:
registry.hello(); // returns "world"

// mocking with automatic restoration:
await withMock(registry, "hello", () => "moon", async () => {
  registry.hello(); // returns "moon"
});

registry.hello(); // returns "world" again
```

To express dependency graphs, just use `this`, like with regular JS:

```typescript
import { registry } from "antipattern";
export const deps = registry({
  hello() {
    return `hello ${this.subject()}`;
  },
  subject() {
    return "world";
  },
});

// elsewhere:
await withMock(registry, "subject", () => "alligator", async () => {
  expect(registry.hello()).toBe("hello alligator");
});
```

If you don't want to expose everything to callers, but you still want the
internal functions to call the mockable methods, the `registry` function can
also take a class, allowing you to define private fields or methods:

```typescript
import { registry } from "antipattern";
import { memo } from "radash";

export const deps = registry(class {
  user() {
    return process.env.USER;
  }
  pass() {
    return process.env.PASS;
  }
  login() {
    return `${this.user()}:${this.pass()}`;
  }
  cloud() {
    if(process.env.NODE_ENV === "development") return this.local();
    return this.aws();
  }

  private aws() {
    // you can call this.user() in here, despite not exposing .aws publically,
    // and it'll use the mocked value if it's been mocked
  }

  private local() {
    // ditto
  }
});

// elsewhere:
const cloud = await deps.cloud();
await cloud.upload("./README.md");
```

You can also manually set and unset mocks using the plain `mock` function,
which returns a `restore` function that will restore the original value:

```typescript
import { mock } from "antipattern";

beforeEach(() => {
  const restores: Array<() => any> = [];
  restores.push(mock(deps, "user", () => "reissbaker"));
  restores.push(mock(deps, "pass", () => "hunter2s"));
  return () => {
    restores.forEach(restore => restore());
  };
});
```
