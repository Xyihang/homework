# 狼人杀项目全面代码审查 Spec

## Why
项目已实现完整的游戏流程，但存在多个 Critical/Major 级别的 Bug 和代码质量问题，需要系统性排查和修复以确保游戏可正常运行。

## What Changes
- 修复 Critical 级别的运行时 Bug（闭包陷阱、状态管理缺陷）
- 修复 Major 级别的不完整功能（TODO 标记、未使用的工具模块）
- 清理 Minor 级别的代码质量问题（死代码、重复定义、缺失依赖）
- **不涉及**新功能开发，仅修复和清理现有代码

## Impact
- Affected code: 全部 src/ 目录下的源文件
- Affected specs: 无前置 spec 依赖

---

## ADDED Requirements

### Requirement: 修复 Game.tsx 闭包陷阱
- [x] 已在之前修复：gameStore 添加 `setNightPhase` 方法，`nextNightPhase` 使用 `setNightPhase` 推进阶段

#### Scenario: 夜晚阶段 useEffect 闭包过期
- **WHEN** `useEffect` (L50-55) 触发时引用了 `startCurrentPhaseAction`、`showHandoff`、`showRoleReveal`、`currentActionPlayer`
- **THEN** 这些值应为最新状态，而非初始渲染时的快照（当前缺少 useCallback 包裹 + 缺少依赖项）

#### Scenario: useTimer 回调引用 handleActionComplete
- **WHEN** useTimer 的 `onTimeUp` 回调触发
- **THEN** 应正确调用最新的 `handleActionComplete`（当前 L33 引用了一个尚未定义的函数）

### Requirement: 修复 Setup.tsx clsx 重复定义
- **WHEN** Setup.tsx 使用 clsx 进行条件类名拼接
- **THEN** 应使用从 'clsx' 包导入的版本，而非文件底部 L457 自定义的简化版函数

### Requirement: 实现存档功能集成
- **WHEN** 用户开始或继续游戏
- **THEN** storage.ts 中定义的 saveGameState / loadGameState 应被实际调用（当前已定义但从未使用）

### Requirement: 补全 TODO 功能
- **WHEN** 投票出现平票情况
- **THEN** gameStore.ts L291-293 的平票处理逻辑应完整实现
- **WHEN** 猎人死亡触发技能
- **THEN** gameStore.ts L347-350 的猎人开枪逻辑应完整实现

## MODIFIED Requirements

### Requirement: PlayerCard 组件布局修正
**问题**: L62-68 状态指示器使用 `absolute` 定位但父容器缺少 `relative`
**修复**: 在父容器 div 上添加 `relative` 定位

### Requirement: DayPhase 组件 useEffect 依赖补全
**问题**: L525-540 useEffect 缺少 `speak`、`navigate` 等依赖
**修复**: 补全依赖数组或使用 ref 避免不必要的重渲染

### Requirement: useTimer 性能优化
**问题**: L32-60 useEffect 将 `time` 放入依赖数组导致每秒重建 interval
**修复**: 使用 ref 存储 time 值，避免频繁重建定时器

## REMOVED Requirements

### Requirement: 移除死代码
**原因**: 以下文件/代码已定义但从未被使用：
- `src/components/Empty.tsx` — 从未被任何文件 import
- `src/hooks/useTheme.ts` — 主题 Hook 未在任何组件中使用
- `Game.tsx L520` — `showVoteResult` 状态变量声明后从未读取
- `Home.tsx` 导入的 `RoleDetailCard` — 如未实际使用则移除导入
**迁移**: 直接删除或注释说明保留理由

### Requirement: 移除 crypto.ts 死代码链
**原因**: `crypto.ts` 仅被 `storage.ts` 使用，而 `storage.ts` 的存档功能又未被调用，形成整条死代码链
**迁移**: 如果实现存档功能则保留，否则标记为待用
