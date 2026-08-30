# Agent Rules

[蓝图]: .agents/ARCHITECTURE.md
[日志]: .agents/MEMORIES.md
[铁律]: scripts/run.mjs

## Boot

1. 执行 `pnpm dev` 即可启动默认应用（已通过 npm config 预设 target）
2. 切换其他应用，可使用 `pnpm dev <target>`
3. 禁止直接 cd 进子包执行命令。所有命令必须经由[铁律]转发

## Navigation

1. 架构设计 -> [蓝图]（按需读取）
2. 踩坑记录 -> [日志]（遇到报错先搜这里）

## Loop

修复 `Bug` 后必须更新[日志];完成阶段性任务后必须同步[蓝图]

## Fallback

若[蓝图]里找不到对应内容，必须须先提问再动手
