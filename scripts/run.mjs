import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

const args = process.argv.slice(2);
const [action, ...rest] = args;

if (!action) {
    console.error("请指定 action，例如 dev / build / tauri / wdio / astro ...");
    process.exit(1);
}

const cwd = process.cwd();

// 判断某个名字是否是真实存在的 workspace 目标（apps/* 或 packages/*）
// 用真实目录存在性判断，而不是"是否以 - 开头"，
// 这样 `pnpm astro add react`、`pnpm wdio run wdio.conf.js` 这类命令的
// 第一个参数（add / run）不会被误判成 target。
function isWorkspaceTarget(name) {
    if (!name) return false;
    return (
        fs.existsSync(path.join(cwd, "apps", name)) ||
        fs.existsSync(path.join(cwd, "packages", name))
    );
}

// 统一解析 target 与透传参数（e2e / 普通命令共用）
function resolveTargetAndArgs() {
    if (isWorkspaceTarget(rest[0])) {
        // 显式指定了 target，例如: pnpm dev my-app --port 3000
        return { target: rest[0], extraArgs: rest.slice(1) };
    }
    // 未显式指定 target，回退到默认 app，其余参数全部原样透传
    return { target: process.env.npm_package_config_app, extraArgs: rest };
}

// 统一执行 vpr 并处理退出码（e2e / 普通命令共用，脚本只有一个出口）
function runVpr(vprArgs) {
    const result = spawnSync("vpr", vprArgs, { stdio: "inherit", shell: true });
    if (result.error) {
        console.error(`执行失败: ${result.error.message}`);
        process.exit(result.status || 1);
    }
    process.exit(result.status || 0);
}

const { target, extraArgs } = resolveTargetAndArgs();

if (!target) {
    console.error(
        "未指定 target（或 -e2e 对应的基础 app），请设置 npm_package_config_app 或通过参数传入",
    );
    process.exit(1);
}

// ---------- e2e 命令：仅在 target 后缀和命令映射上有差异 ----------
const e2eActions = ["wdio", "test:e2e"]; // 可按需扩展（如 test:no-build）
if (e2eActions.includes(action)) {
    // test:e2e 实际执行的是 workspace 中的 test 脚本
    const cmd = action === "test:e2e" ? "test" : action;
    runVpr(["--filter", `${target}-e2e`, cmd, ...extraArgs]);
}
// ---------- e2e 逻辑结束 ----------

const isTauri =
    fs.existsSync(path.join(cwd, `apps/${target}/src-tauri`)) ||
    fs.existsSync(path.join(cwd, `packages/${target}/src-tauri`));

const baseArgs = ["--filter", target];

if (action === "dev" || action === "build") {
    // dev / build 是内置动作：Tauri 项目自动补上 tauri 前缀
    baseArgs.push(...(isTauri ? ["tauri", action] : [action]));
} else if (action === "tauri" && !isTauri) {
    // 显式调用 tauri 但目标并非 Tauri 项目时给出明确报错
    console.error(`应用 ${target} 并非 Tauri 项目（未找到 src-tauri 目录）`);
    process.exit(1);
} else {
    // 任意其他命令（tauri、wdio、astro、vite、eslint ...）原样穿透给对应 app
    baseArgs.push(action);
}

runVpr([...baseArgs, ...extraArgs]);
