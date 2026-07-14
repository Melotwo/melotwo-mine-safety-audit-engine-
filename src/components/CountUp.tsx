import React, { useState, useEffect } from 'react';

interface CountUpProps {
  value?: number;
  end?: number;
  duration?: number;
}

export const CountUp: React.FC<CountUpProps> = ({ value, end, duration = 0.8 }) => {
  const targetValue = value !== undefined ? value : (end !== undefined ? end : 0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const startValue = count;

    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      // Easing: smooth easeOutQuart curve
      const easeProgress = 1 - Math.pow(1 - progress, 4); 
      
      const currentCount = Math.round(startValue + (targetValue - startValue) * easeProgress);
      setCount(currentCount);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetValue, duration]);

  return <span>{count}</span>;
};

