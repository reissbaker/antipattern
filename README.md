```
            __  _           __  __
 ___ ____  / /_(_)__  ___ _/ /_/ /____ _______
/ _ `/ _ \/ __/ / _ \/ _ `/ __/ __/ -_) __/ _ \
\_,_/_//_/\__/_/ .__/\_,_/\__/\__/\__/_/ /_//_/
              /_/
```

A dependency injection framework for dummies.

Examples:

```typescript
import { registry, memoize } from "antipattern";

const aws = {
  upload: async (file: string) => {
    // ...
  },
};
const local = {
  upload: async (file: string) => {
    // ...
  },
};

export const deps = registry({
  async cloud() {
    if(process.env.NODE_ENV === "development") return local;
    return aws;
  },
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
