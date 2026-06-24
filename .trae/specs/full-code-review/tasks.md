# Tasks

- [ ] Task 1: 修复 Game.tsx 闭包陷阱和 useEffect 依赖问题
  - [ ] 修复 L50-55 夜晚阶段自动开始行动的 useEffect：将 `startCurrentPhaseAction` 用 useCallback 包裹，补全依赖数组
  - [ ] 修复 useTimer 的 `onTimeUp` 回调引用问题：将 `handleActionComplete` 提取到 useTimer 定义之前，或使用 ref 包装
  - [ ] 修复 L41-47 语音播报 useEffect 缺少 speak 依赖的问题

- [ ] Task 2: 修复 Setup.tsx clsx 重复定义
  - [ ] 删除文件底部 L457-458 自定义的 clsx 函数
  - [ ] 在文件顶部添加 `import { clsx } from 'clsx'` 导入

- [ ] Task 3: 修复 PlayerCard.tsx 布局问题
  - [ ] 在 PlayerCard 组件的父容器 div 上添加 `relative` 定位类（L53 附近）

- [ ] Task 4: 补全 gameStore.ts TODO 功能
  - [ ] 实现平票处理逻辑（L291-293）：添加重新投票或随机淘汰机制
  - [ ] 实现猎人死亡开枪逻辑（L347-350）：在投票出局后触发猎人技能选择界面

- [ ] Task 5: 优化 useTimer.ts 性能
  - [ ] 将 time 状态用 ref 同步存储，从 useEffect 依赖数组中移除 time，避免每秒重建 interval

- [ ] Task 6: 修复 DayPhase 组件依赖问题
  - [ ] 补全 L525-540 useEffect 的依赖数组，或对 speak/navigate 使用 useRef 包装

- [ ] Task 7: 清理死代码
  - [ ] 删除或标记 src/components/Empty.tsx（确认无引用后删除）
  - [ ] 删除或标记 src/hooks/useTheme.ts（确认无引用后删除）
  - [ ] 移除 Game.tsx 中未使用的 `showVoteResult` 状态变量（L520）
  - [ ] 检查 Home.tsx 中 RoleDetailCard 导入是否实际使用，未使用则移除

- [ ] Task 8: 集成存档功能
  - [ ] 在 gameStore 的关键状态变更点（initGame、startGame、endNightPhase 等）调用 saveGameState
  - [ ] 在 Home 页面"继续游戏"按钮点击时调用 loadGameState 恢复状态
  - [ ] 在 Result 页面的"新游戏"/"返回首页"按钮中已正确调用 clearGameState（确认现有实现）

- [ ] Task 9: 添加 App.tsx 兜底路由
  - [ ] 添加 404/catch-all 路由，处理未匹配路径

# Task Dependencies
- [Task 2] 无依赖，可并行
- [Task 3] 无依赖，可并行
- [Task 5] 无依赖，可并行
- [Task 7] 无依赖，可并行
- [Task 1] 应优先完成（Critical）
- [Task 4] 依赖于 Task 1（游戏主流程修复后再完善功能）
- [Task 6] 与 Task 1 相关，建议同时处理
- [Task 8] 依赖于 Task 4（存档功能需要完整的状态管理）
- [Task 9] 无依赖，可并行
