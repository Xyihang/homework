# Checklist

## Critical 级别
- [x] Game.tsx L50-55: 夜晚阶段 useEffect 闭包问题已修复，startCurrentPhaseAction 使用 useCallback 包裹且依赖完整
- [x] Game.tsx L29-38: useTimer 的 onTimeUp 回调不再引用未定义的 handleActionComplete（改用 ref 模式）
- [x] Game.tsx L41-47: 语音播报 useEffect 依赖数组完整（包含 speak）

## Major 级别
- [x] Setup.tsx: 已移除自定义 clsx 函数（L457-458），改用 clsx 包导入
- [x] gameStore.ts: 平票处理逻辑已实现（随机淘汰机制，完整处理白痴/猎人/游戏结束分支）
- [x] gameStore.ts: 猎人死亡开枪逻辑已实现（pendingHunterShoot 状态 + confirmHunterShoot/skipHunterShoot 方法）
- [x] PlayerCard.tsx: 状态指示器 absolute 定位的父容器已添加 relative 类
- [x] useTimer.ts: 不再因 time 变化每秒重建 interval（改用 timeRef）
- [x] DayPhase 组件 (Game.tsx): useEffect 依赖完整（speak/navigate 使用 ref 存储）

## Minor 级别
- [x] 死代码已清理：Empty.tsx 已删除、useTheme.ts 已删除、showVoteResult 已移除、Home.tsx 无用导入已清理
- [x] 存档功能已集成：saveGameState 在 8 个关键阶段转换点调用、loadGameState 在"继续游戏"时恢复状态
- [x] App.tsx 添加了 catch-all 兜底路由（path="*"）
