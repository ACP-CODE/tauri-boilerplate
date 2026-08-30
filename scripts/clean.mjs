import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import readline from "readline";

const CACHE_FILE = path.join(process.cwd(), "node_modules/.cache/last-app.json");
let lastApp = null;

if (fs.existsSync(CACHE_FILE)) {
  try {
    lastApp = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8")).target;
  } catch (_) {}
}

console.log(`🧹 开始清理编译缓存... ${lastApp ? `(优先保留最近应用: ${lastApp})` : ''}\n`);

/**
 * 格式化字节大小为 KB / MB / GB
 * @param {number} bytes
 */
function formatSize(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * 原生手写删除函数（带动态空间与数量计算）
 * @param {string} targetPath 要删除的目录路径
 * @param {string} label 显示提示的前缀
 * @returns {number} 返回清理的总字节数
 */
function removeDirWithProgress(targetPath, label) {
  if (!fs.existsSync(targetPath)) return 0;

  let fileCount = 0;
  let dirCount = 0;
  let totalBytes = 0;
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let frameIndex = 0;

  // 刷新终端同一行的文本
  const renderProgress = (done = false) => {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);

    const sizeStr = formatSize(totalBytes);

    if (done) {
      process.stdout.write(`✅ ${label} | 清理完成: 释放了 ${sizeStr} (${fileCount} 文件, ${dirCount} 目录)\n`);
    } else {
      const icon = frames[frameIndex++ % frames.length];
      process.stdout.write(`${icon} ${label} | 已释放: ${sizeStr} (文件: ${fileCount}, 目录: ${dirCount})...`);
    }
  };

  // 递归遍历并删除
  function doDelete(currentPath) {
    let stats;
    try {
      // 使用 lstatSync 避免软链接导致的死循环或异常
      stats = fs.lstatSync(currentPath);
    } catch (_) {
      return;
    }

    if (stats.isDirectory()) {
      let files = [];
      try {
        files = fs.readdirSync(currentPath);
      } catch (_) {}

      for (const file of files) {
        doDelete(path.join(currentPath, file));
      }

      try {
        fs.rmdirSync(currentPath);
        dirCount++;
      } catch (_) {}
    } else {
      // 累加实际文件大小
      totalBytes += stats.size;
      try {
        fs.unlinkSync(currentPath);
        fileCount++;
      } catch (_) {}
    }

    // 每处理 30 个项目刷新一次界面，平衡动态效果与 IO 性能
    if ((fileCount + dirCount) % 30 === 0) {
      renderProgress();
    }
  }

  doDelete(targetPath);
  renderProgress(true); // 渲染最终完成状态

  return totalBytes;
}

// ------------------- 执行清理逻辑 -------------------

let totalFreedBytes = 0;

// 1. 清理子项目局部 target 目录
const appsDir = path.join(process.cwd(), "apps");
if (fs.existsSync(appsDir)) {
  fs.readdirSync(appsDir).forEach(app => {
    if (app === lastApp) {
      console.log(`⏭️  跳过保留应用: apps/${app}`);
      return;
    }

    const localTarget = path.join(appsDir, app, "src-tauri/target");
    if (fs.existsSync(localTarget)) {
      totalFreedBytes += removeDirWithProgress(localTarget, `清理 apps/${app}/src-tauri/target`);
    }
  });
}

// 2. 清理根目录残留 target
const rootTarget = path.join(process.cwd(), "target");
if (fs.existsSync(rootTarget)) {
  totalFreedBytes += removeDirWithProgress(rootTarget, `清理根目录 target`);
}

// 总结手动删除的空间
console.log(`\n🎉 手动清理累计释放空间: ${formatSize(totalFreedBytes)}`);

// 3. 执行 cargo-sweep
console.log("\n📦 正在呼叫 cargo-sweep 增量清理...");
try {
  execSync("cargo sweep --time 7", {
    stdio: "inherit",
    env: { ...process.env, FORCE_COLOR: "1" }
  });
} catch (_) {
  console.log("💡 未检测到 cargo-sweep，建议执行 `cargo install cargo-sweep` 获得更佳体验。");
}