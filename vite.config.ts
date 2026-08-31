import { defineConfig } from "vite-plus";

// https://viteplus.dev/config
export default defineConfig({
    staged: {
        "*": ["vp check --fix"],
    },
    fmt: {
        ignorePatterns: ["dist/*"],
    },
    lint: {
        options: {
            typeAware: true,
            typeCheck: true,
        },
        ignorePatterns: ["scripts/*"],
    },
    check: {
        fmt: true,
        lint: true,
    },
    test: {
        projects: ["apps/*", "packages/*", "tools/*"],
    },
});
