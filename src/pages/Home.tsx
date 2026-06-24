import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, BookOpen, Settings, RotateCcw } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { RoleCard, RoleDetailCard } from '../components/role/RoleCard';
import { ROLES, RoleType } from '../data/roles';
import { hasSavedGame } from '../utils/storage';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [showRoleDetail, setShowRoleDetail] = useState(false);
  const savedGame = hasSavedGame();
  
  const handleStartNewGame = () => {
    navigate('/setup');
  };
  
  const handleContinueGame = () => {
    navigate('/game');
  };
  
  const handleRoleClick = (roleType: RoleType) => {
    setSelectedRole(roleType);
    setShowRoleDetail(true);
  };
  
  const roles = Object.keys(ROLES) as RoleType[];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 to-transparent" />
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative px-4 py-12 text-center"
        >
          <div className="text-6xl mb-4">🐺</div>
          <h1 className="text-4xl font-bold text-gray-100 mb-3">
            狼人杀
          </h1>
          <p className="text-lg text-gray-400 mb-8">
            无需法官，无需卡牌，单设备多人游戏
          </p>
          
          <div className="flex flex-col gap-4 max-w-xs mx-auto">
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartNewGame}
              className="flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              开始新游戏
            </Button>
            
            {savedGame && (
              <Button
                variant="secondary"
                size="lg"
                onClick={handleContinueGame}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                继续游戏
              </Button>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Role Introduction Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="px-4 py-8"
      >
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-semibold text-gray-100">
            角色介绍
          </h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
          {roles.map(roleType => (
            <RoleCard
              key={roleType}
              roleType={roleType}
              onClick={() => handleRoleClick(roleType)}
              size="md"
            />
          ))}
        </div>
        
        {/* Game Rules */}
        <Card variant="bordered" className="mb-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">
            游戏规则
          </h3>
          
          <div className="space-y-4 text-sm text-gray-300">
            <div>
              <h4 className="font-medium text-gray-200 mb-2">夜晚阶段</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>狼人睁眼，选择击杀目标</li>
                <li>预言家睁眼，查验玩家身份</li>
                <li>女巫睁眼，选择使用解药或毒药</li>
                <li>其他特殊角色依次行动</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-200 mb-2">白天阶段</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>法官公布昨晚死讯</li>
                <li>幸存玩家依次发言</li>
                <li>投票选出最可疑的玩家</li>
                <li>被投票玩家出局并发表遗言</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-200 mb-2">胜利条件</h4>
              <ul className="list-disc list-inside space-y-1">
                <li className="text-red-400">狼人阵营：狼人数量 ≥ 好人数量</li>
                <li className="text-blue-400">好人阵营：消灭所有狼人</li>
              </ul>
            </div>
          </div>
        </Card>
        
        {/* Features */}
        <Card variant="bordered">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">
            应用特色
          </h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <div className="text-purple-400">✓</div>
              <div className="text-gray-300">
                <div className="font-medium text-gray-200">无需法官</div>
                <div className="text-xs">自动引导游戏流程</div>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="text-purple-400">✓</div>
              <div className="text-gray-300">
                <div className="font-medium text-gray-200">无需卡牌</div>
                <div className="text-xs">电子角色分配</div>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="text-purple-400">✓</div>
              <div className="text-gray-300">
                <div className="font-medium text-gray-200">隐私保护</div>
                <div className="text-xs">防偷窥设计</div>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="text-purple-400">✓</div>
              <div className="text-gray-300">
                <div className="font-medium text-gray-200">语音播报</div>
                <div className="text-xs">普通话语音提示</div>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="text-purple-400">✓</div>
              <div className="text-gray-300">
                <div className="font-medium text-gray-200">离线运行</div>
                <div className="text-xs">无需网络连接</div>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="text-purple-400">✓</div>
              <div className="text-gray-300">
                <div className="font-medium text-gray-200">游戏存档</div>
                <div className="text-xs">支持暂停恢复</div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
      
      {/* Role Detail Modal */}
      {showRoleDetail && selectedRole && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setShowRoleDetail(false)}
        >
          <RoleDetailCard
            role={ROLES[selectedRole]}
            onClose={() => setShowRoleDetail(false)}
          />
        </motion.div>
      )}
    </div>
  );
};