# Tauri Monorepo Boilerplates

This is a modern Monorepo project template based on the Tauri framework, integrating frontend, backend, and desktop applications all in one.

## 🚀 Project Structrue

Inside of your Tauri monorepo, you'll see the following folders and files:

```sh
/
├── apps/
│   ├── application/                         # tauri project
│   │   ├── e2e/                             # wdio e2e test
│   │   │   └── test/
│   │   │   │   └── specs/
│   │   │   │       └── *.e2e.ts
│   │   │   ├── package.json
│   │   │   ├── tscofig.json
│   │   │   └── woid.conf.ts
│   │   ├── src/
│   │   ├── src-tauri/
│   │   ├── tests/                           # vitest powered by `vite-plus`
│   │   ├── tsconfig.json
│   │   ├── tsconfig.node.json
│   │   ├── package.json
│   │   └── vite.config.ts
│   ├── website/
│   │   ├── src
│   │   ├── tests
│   │   ├── package.json
│   │   └── *.config.ts                      # (`astro` or `vite`)
├── packages/                                # Shared `ui` or `lib`
├── scripts/
├── Cargo.toml
├── package.json
└── vite.config.ts
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command             | Action                                          |
| :------------------ | :---------------------------------------------- |
| `pnpm install`      | Installs dependencies                           |
| `pnpm dev`          | Starts local dev server at `localhost:1420`     |
| `pnpm build`        | Build your production site to `./dist/`         |
| `pnpm tauri ...`    | Run CLI commands like `tauri add`, `tauri info` |
| `pnpm tauri --help` | Get help using the tauri CLI                    |
