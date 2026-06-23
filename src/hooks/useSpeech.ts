import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';

export const useSpeech = () => {
  const settings = useGameStore(state => state.settings);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      // 优先选择中文语音
      const chineseVoice = voices.find(v => v.lang.includes('zh'));
      setVoice(chineseVoice || voices[0]);
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);
  
  const speak = useCallback((text: string): Promise<void> => {
    if (!settings.soundEnabled || !text) {
      return Promise.resolve();
    }
    
    return new Promise((resolve) => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voice;
      utterance.rate = settings.speechRate;
      utterance.volume = settings.volume;
      utterance.lang = 'zh-CN';
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        resolve();
      };
      
      window.speechSynthesis.speak(utterance);
    });
  }, [settings, voice]);
  
  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);
  
  return { speak, stop, isSpeaking };
};