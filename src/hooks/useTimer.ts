import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerOptions {
  initialTime: number;
  onTimeUp?: () => void;
  onWarning?: () => void;
  warningTime?: number;
}

export const useTimer = (options: UseTimerOptions) => {
  const { initialTime, onTimeUp, onWarning, warningTime = 10 } = options;
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const warningCalledRef = useRef(false);
  const timeRef = useRef(initialTime);
  
  const start = useCallback(() => {
    setIsRunning(true);
    warningCalledRef.current = false;
  }, []);
  
  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);
  
  const reset = useCallback((newTime?: number) => {
    const resetTime = newTime || initialTime;
    setTime(resetTime);
    timeRef.current = resetTime;
    setIsRunning(false);
    warningCalledRef.current = false;
  }, [initialTime]);
  
  useEffect(() => {
    if (isRunning && timeRef.current > 0) {
      timerRef.current = setInterval(() => {
        const newTime = timeRef.current - 1;
        timeRef.current = newTime;
        setTime(newTime);

        // 检查是否需要警告
        if (newTime === warningTime && !warningCalledRef.current) {
          warningCalledRef.current = true;
          onWarning?.();
        }

        // 检查是否时间结束
        if (newTime === 0) {
          setIsRunning(false);
          onTimeUp?.();
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, onTimeUp, onWarning, warningTime]);
  
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);
  
  return {
    time,
    formattedTime: formatTime(time),
    isRunning,
    start,
    pause,
    reset
  };
};