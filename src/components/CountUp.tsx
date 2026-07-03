import React, { useEffect } from 'react';
import { animate, useMotionValue, useTransform, motion } from 'motion/react';

interface CountUpProps {
  value: number;
  duration?: number;
}

export const CountUp: React.FC<CountUpProps> = ({ value, duration = 0.8 }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, value, { 
      duration, 
      ease: [0.16, 1, 0.3, 1] // Custom smooth easeOutQuart curve
    });
    return () => controls.stop();
  }, [value, count, duration]);

  return <motion.span>{rounded}</motion.span>;
};
