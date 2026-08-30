import { defineConfig } from "vite-plus";

// 判断是否在 CI 环境（GitHub Actions、GitLab CI 等都会自动设置 CI=true）
const isCI = process.env.CI === "true" || process.env.CI === "1" || !!process.env.CI;

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
