'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring, type SpringOptions } from 'framer-motion';

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
  decimals?: number;
}

const springConfig: SpringOptions = {
  stiffness: 50,
  damping: 30,
  mass: 1,
};

export default function AnimatedCounter({
  target,
  suffix = '',
  prefix = '',
  className = '',
  decimals = 0,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, springConfig);
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (isInView) {
      motionValue.set(target);
    }
  }, [isInView, target, motionValue]);

  useEffect(() => {
    const unsubscribe = spring.on('change', (v) => {
      setDisplay(
        decimals > 0
          ? v.toFixed(decimals)
          : Math.round(v).toLocaleString()
      );
    });
    return unsubscribe;
  }, [spring, decimals]);

  return (
    <motion.span ref={ref} className={className}>
      {prefix}{display}{suffix}
    </motion.span>
  );
}
