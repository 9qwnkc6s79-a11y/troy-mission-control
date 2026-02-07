'use client';

import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface MarqueeProps {
  children: ReactNode;
  speed?: number;
  direction?: 'left' | 'right';
  className?: string;
  pauseOnHover?: boolean;
}

export default function Marquee({
  children,
  speed = 30,
  direction = 'left',
  className = '',
  pauseOnHover = true,
}: MarqueeProps) {
  const xStart = direction === 'left' ? '0%' : '-50%';
  const xEnd = direction === 'left' ? '-50%' : '0%';

  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        className={`flex gap-8 items-center w-max ${pauseOnHover ? 'hover:[animation-play-state:paused]' : ''}`}
        animate={{ x: [xStart, xEnd] }}
        transition={{
          x: {
            duration: speed,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear',
          },
        }}
        style={{ willChange: 'transform' }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
