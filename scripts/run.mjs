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

function getWorkspaceRoots() {
    const yamlPath = path.join(cwd, "pnpm-workspace.yaml");
    if (!fs.existsSync(yamlPath)) return ["apps", "packages"]; // 兜底默认值

    const content = fs.readFileSync(yamlPath, "utf-8");
    const lines = content.split(/\r?\n/);
    const dirs = [];

    for (const line of lines) {
        // 兼容: - apps/*  |  - "apps/*"  |  - 'apps/**'  |  - apps/**/*
        const m = line.match(/^\s*-\s*['"]?([a-zA-Z0-9_-]+)\/(?:\*\*?\/?\*?)['"]?\s*$/);
        if (m) dirs.push(m[1]);
    }

    return dirs.length ? [...new Set(dirs)] : ["apps", "packages"];
}

const workspaceRoots = getWorkspaceRoots();

function isWorkspaceTarget(name) {
    if (!name) return false;
    return workspaceRoots.some((root) => fs.existsSync(path.join(cwd, root, name)));
}

// 统一解析 target 与透传参数（e2e / 普通命令 / 多段透传命令共用）
function resolveTargetAndArgs() {
    // 1) 显式声明优先: --app=<target> 或 --target=<target>
    //    适用于 target 名恰好和某个子命令/flag 冲突、或想强制指定的场景
    const explicitIdx = rest.findIndex((a) => /^--(app|target)=/.test(a));
    if (explicitIdx !== -1) {
        const target = rest[explicitIdx].split("=")[1];
        const extraArgs = [...rest.slice(0, explicitIdx), ...rest.slice(explicitIdx + 1)];
        return { target, extraArgs };
    }

    // 2) 在整个参数列表中查找第一个能匹配 workspace 目录的 token 作为 target
    //    不再局限于 rest[0]，从而支持 `tauri dev <target>` / `vite <target> --host` 等
    //    "子命令 + target" 或 "target 在中间" 的多段透传写法
    const targetIdx = rest.findIndex((token) => isWorkspaceTarget(token));
    if (targetIdx !== -1) {
        const target = rest[targetIdx];
        const extraArgs = [...rest.slice(0, targetIdx), ...rest.slice(targetIdx + 1)];
        return { target, extraArgs };
    }

    // 3) 均未匹配到，回退到默认 app，其余参数原样透传
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

const e2eActions = ["wdio", "test:e2e"];
if (e2eActions.includes(action)) {
    const cmd = action === "test:e2e" ? "test" : action;
    runVpr(["--filter", `${target}-e2e`, cmd, ...extraArgs]);
}

const isTauri = workspaceRoots.some((root) =>
    fs.existsSync(path.join(cwd, root, target, "src-tauri")),
);

const baseArgs = ["--filter", target];

if (action === "dev" || action === "build") {
    baseArgs.push(...(isTauri ? ["tauri", action] : [action]));
} else if (action === "tauri" && !isTauri) {
    console.error(`应用 ${target} 并非 Tauri 项目（未找到 src-tauri 目录）`);
    process.exit(1);
} else {
    // 任意其他命令（tauri、wdio、astro、vite、eslint ...）原样穿透给对应 app
    baseArgs.push(action);
}

runVpr([...baseArgs, ...extraArgs]);
