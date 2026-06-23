import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Users, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { RoleCard } from '../components/role/RoleCard';
import { useGameStore } from '../store/gameStore';
import { getRecommendedConfig, ROLES, RoleType } from '../data/roles';
import { RecommendedConfig, RoleConfig, GameSettings } from '../types';

export const Setup: React.FC = () => {
  const navigate = useNavigate();
  const initGame = useGameStore(state => state.initGame);
  const updateSettings = useGameStore(state => state.updateSettings);
  const settings = useGameStore(state => state.settings);
  
  const [playerCount, setPlayerCount] = useState(6);
  const [roleConfig, setRoleConfig] = useState<RoleConfig>({
    werewolf: 0,
    villager: 0,
    seer: 0,
    witch: 0,
    hunter: 0,
    idiot: 0,
    wolfKing: 0
  });
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [useRecommended, setUseRecommended] = useState(true);
  
  // 初始化推荐配置
  useEffect(() => {
    const recommended = getRecommendedConfig(playerCount);
    setRoleConfig({
      werewolf: recommended.werewolf,
      villager: recommended.villager,
      seer: recommended.seer,
      witch: recommended.witch,
      hunter: recommended.hunter,
      idiot: recommended.idiot,
      wolfKing: recommended.wolfKing
    });
  }, [playerCount]);
  
  const handlePlayerCountChange = (count: number) => {
    if (count < 4 || count > 10) return;
    setPlayerCount(count);
    
    if (useRecommended) {
      const recommended = getRecommendedConfig(count);
      setRoleConfig({
        werewolf: recommended.werewolf,
        villager: recommended.villager,
        seer: recommended.seer,
        witch: recommended.witch,
        hunter: recommended.hunter,
        idiot: recommended.idiot,
        wolfKing: recommended.wolfKing
      });
    }
  };
  
  const handleRoleConfigChange = (role: RoleType, delta: number) => {
    setUseRecommended(false);
    const newCount = Math.max(0, (roleConfig[role] || 0) + delta);
    
    // 检查总数是否超出
    const currentTotal = Object.values(roleConfig).reduce((sum, count) => sum + count, 0);
    const newTotal = currentTotal + delta;
    
    if (newTotal > playerCount) return;
    
    setRoleConfig(prev => ({
      ...prev,
      [role]: newCount
    }));
  };
  
  const getTotalRoles = () => {
    return Object.values(roleConfig).reduce((sum, count) => sum + count, 0);
  };
  
  const getWerewolfCount = () => {
    return (roleConfig['werewolf'] || 0) + (roleConfig['wolfKing'] || 0);
  };
  
  const getVillagerCount = () => {
    return playerCount - getWerewolfCount();
  };
  
  const isValidConfig = () => {
    const total = getTotalRoles();
    const werewolves = getWerewolfCount();
    const villagers = getVillagerCount();
    
    return total === playerCount && werewolves > 0 && villagers > werewolves;
  };
  
  const handleNext = () => {
    if (!isValidConfig()) return;
    
    initGame(playerCount, roleConfig);
    navigate('/players');
  };
  
  const handleAdvancedSettingsSave = (newSettings: typeof settings) => {
    updateSettings(newSettings);
    setShowAdvancedSettings(false);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          
          <h1 className="text-xl font-bold text-gray-100">游戏配置</h1>
          
          <button
            onClick={() => setShowAdvancedSettings(true)}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <SettingsIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        {/* Player Count */}
        <Card variant="bordered" className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-gray-100">
              玩家人数
            </h2>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handlePlayerCountChange(playerCount - 1)}
              disabled={playerCount <= 4}
              className="p-3 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              -
            </button>
            
            <div className="text-4xl font-bold text-purple-400 w-16 text-center">
              {playerCount}
            </div>
            
            <button
              onClick={() => handlePlayerCountChange(playerCount + 1)}
              disabled={playerCount >= 10}
              className="p-3 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              +
            </button>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-400">
            支持 4-10 人游戏
          </div>
        </Card>
        
        {/* Role Configuration */}
        <Card variant="bordered" className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-100">
              角色配置
            </h2>
            
            {!useRecommended && (
              <button
                onClick={() => setUseRecommended(true)}
                className="text-xs text-purple-400 hover:text-purple-300"
              >
                使用推荐配置
              </button>
            )}
          </div>
          
          {useRecommended && (
            <div className="text-xs text-purple-400 mb-4">
              ✓ 已自动应用推荐配置
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            {(Object.keys(ROLES) as RoleType[]).map(roleType => (
              <div
                key={roleType}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-800/50"
              >
                <div className="flex items-center gap-2">
                  <div className="text-xl">{ROLES[roleType].icon}</div>
                  <div className="text-sm text-gray-300">
                    {ROLES[roleType].name}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRoleConfigChange(roleType, -1)}
                    disabled={roleConfig[roleType] === 0}
                    className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                  >
                    -
                  </button>
                  
                  <div className="w-6 text-center text-sm font-medium text-gray-100">
                    {roleConfig[roleType] || 0}
                  </div>
                  
                  <button
                    onClick={() => handleRoleConfigChange(roleType, 1)}
                    disabled={getTotalRoles() >= playerCount}
                    className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Summary */}
          <div className="border-t border-gray-700 pt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">角色总数</span>
              <span className={clsx(
                'font-medium',
                getTotalRoles() === playerCount ? 'text-green-400' : 'text-red-400'
              )}>
                {getTotalRoles()} / {playerCount}
              </span>
            </div>
            
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">狼人阵营</span>
              <span className="font-medium text-red-400">
                {getWerewolfCount()} 人
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">好人阵营</span>
              <span className="font-medium text-blue-400">
                {getVillagerCount()} 人
              </span>
            </div>
            
            {/* Balance Warning */}
            {!isValidConfig() && (
              <div className="mt-3 text-xs text-red-400 bg-red-900/20 rounded p-2">
                {getTotalRoles() !== playerCount && '角色总数必须等于玩家人数'}
                {getWerewolfCount() === 0 && '至少需要1名狼人'}
                {getVillagerCount() <= getWerewolfCount() && '好人数量必须多于狼人'}
              </div>
            )}
          </div>
        </Card>
        
        {/* Next Button */}
        <Button
          variant="primary"
          size="lg"
          onClick={handleNext}
          disabled={!isValidConfig()}
          className="w-full flex items-center justify-center gap-2"
        >
          下一步：登记玩家
          <ArrowRight className="w-5 h-5" />
        </Button>
      </motion.div>
      
      {/* Advanced Settings Modal */}
      <Modal
        isOpen={showAdvancedSettings}
        onClose={() => setShowAdvancedSettings(false)}
        title="高级设置"
        size="md"
      >
        <AdvancedSettingsContent
          settings={settings}
          onSave={handleAdvancedSettingsSave}
          onCancel={() => setShowAdvancedSettings(false)}
        />
      </Modal>
    </div>
  );
};

// 高级设置内容组件
const AdvancedSettingsContent: React.FC<{
  settings: GameSettings;
  onSave: (settings: GameSettings) => void;
  onCancel: () => void;
}> = ({ settings, onSave, onCancel }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  
  return (
    <div className="space-y-4">
      {/* Sound Settings */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">语音设置</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">启用语音</span>
            <button
              onClick={() => setLocalSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
              className={clsx(
                'w-12 h-6 rounded-full transition-colors',
                localSettings.soundEnabled ? 'bg-purple-600' : 'bg-gray-700'
              )}
            >
              <div className={clsx(
                'w-5 h-5 rounded-full bg-white transition-transform',
                localSettings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
              )} />
            </button>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">音量</span>
              <span className="text-gray-300">{Math.round(localSettings.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={localSettings.volume}
              onChange={e => setLocalSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">语速</span>
              <span className="text-gray-300">{localSettings.speechRate}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={localSettings.speechRate}
              onChange={e => setLocalSettings(prev => ({ ...prev, speechRate: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </div>
        </div>
      </div>
      
      {/* Privacy Settings */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">隐私设置</h3>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">防偷窥模式</span>
          <button
            onClick={() => setLocalSettings(prev => ({ ...prev, antiPeekMode: !prev.antiPeekMode }))}
            className={clsx(
              'w-12 h-6 rounded-full transition-colors',
              localSettings.antiPeekMode ? 'bg-purple-600' : 'bg-gray-700'
            )}
          >
            <div className={clsx(
              'w-5 h-5 rounded-full bg-white transition-transform',
              localSettings.antiPeekMode ? 'translate-x-6' : 'translate-x-1'
            )} />
          </button>
        </div>
      </div>
      
      {/* Timer Settings */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">计时设置</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">启用计时器</span>
            <button
              onClick={() => setLocalSettings(prev => ({ ...prev, timerEnabled: !prev.timerEnabled }))}
              className={clsx(
                'w-12 h-6 rounded-full transition-colors',
                localSettings.timerEnabled ? 'bg-purple-600' : 'bg-gray-700'
              )}
            >
              <div className={clsx(
                'w-5 h-5 rounded-full bg-white transition-transform',
                localSettings.timerEnabled ? 'translate-x-6' : 'translate-x-1'
              )} />
            </button>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">发言时间</span>
              <span className="text-gray-300">{localSettings.speechTime}秒</span>
            </div>
            <input
              type="range"
              min="30"
              max="120"
              step="10"
              value={localSettings.speechTime}
              onChange={e => setLocalSettings(prev => ({ ...prev, speechTime: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">行动时间</span>
              <span className="text-gray-300">{localSettings.actionTime}秒</span>
            </div>
            <input
              type="range"
              min="15"
              max="60"
              step="5"
              value={localSettings.actionTime}
              onChange={e => setLocalSettings(prev => ({ ...prev, actionTime: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          取消
        </Button>
        <Button variant="primary" onClick={() => onSave(localSettings)} className="flex-1">
          保存
        </Button>
      </div>
    </div>
  );
};

// clsx helper (imported at top but used here)
function clsx(...args: any[]) {
  return args.filter(Boolean).join(' ');
}