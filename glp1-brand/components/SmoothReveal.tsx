'use client';

import { motion, type Variants } from 'framer-motion';
import { type ReactNode } from 'react';

interface SmoothRevealProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  once?: boolean;
  amount?: number;
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const getItemVariants = (direction: string): Variants => {
  const offsets: Record<string, { x?: number; y?: number }> = {
    up: { y: 30 },
    down: { y: -30 },
    left: { x: 30 },
    right: { x: -30 },
  };

  const offset = offsets[direction] || { y: 30 };

  return {
    hidden: { opacity: 0, ...offset },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeInOut" as const,
      },
    },
  };
};

export default function SmoothReveal({
  children,
  className = '',
  staggerDelay = 0.12,
  direction = 'up',
  once = true,
  amount = 0.15,
}: SmoothRevealProps) {
  const customContainer: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      variants={customContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SmoothRevealItem({
  children,
  className = '',
  direction = 'up',
}: {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}) {
  return (
    <motion.div variants={getItemVariants(direction)} className={className}>
      {children}
    </motion.div>
  );
}
