import { GameState, GameSettings } from '../types';
import { encryptObject, decryptObject } from './crypto';

const STORAGE_KEY = 'werewolf-game-state';
const SETTINGS_KEY = 'werewolf-game-settings';

// 保存游戏状态
export const saveGameState = (state: GameState): void => {
  try {
    const encrypted = encryptObject(state);
    localStorage.setItem(STORAGE_KEY, encrypted);
  } catch (error) {
    console.error('保存游戏状态失败:', error);
  }
};

// 加载游戏状态
export const loadGameState = (): GameState | null => {
  try {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    if (!encrypted) return null;
    return decryptObject<GameState>(encrypted);
  } catch (error) {
    console.error('加载游戏状态失败:', error);
    return null;
  }
};

// 清除游戏状态
export const clearGameState = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

// 保存设置
export const saveSettings = (settings: GameSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('保存设置失败:', error);
  }
};

// 加载设置
export const loadSettings = (): GameSettings | null => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) return null;
    return JSON.parse(data) as GameSettings;
  } catch (error) {
    console.error('加载设置失败:', error);
    return null;
  }
};

// 检查是否有保存的游戏
export const hasSavedGame = (): boolean => {
  return localStorage.getItem(STORAGE_KEY) !== null;
};