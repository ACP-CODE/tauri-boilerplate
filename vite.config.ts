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
    },
    check: {
        fmt: true,
        lint: true,
    },
    test: {
        projects: ["apps/*", "packages/*"],
    },
});
