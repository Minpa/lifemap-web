'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { fadeIn, transitions } from '@/lib/animations';

interface AnimatedWrapperProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  variant?: 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'slideInLeft' | 'slideInRight';
  delay?: number;
}

/**
 * Reusable animated wrapper component
 * Provides common animation patterns with Day One-inspired timing
 */
export function AnimatedWrapper({
  children,
  variant = 'fadeIn',
  delay = 0,
  ...props
}: AnimatedWrapperProps) {
  const variants = {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    fadeInUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
    },
    fadeInDown: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
    slideInLeft: {
      initial: { x: -100, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -100, opacity: 0 },
    },
    slideInRight: {
      initial: { x: 100, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: 100, opacity: 0 },
    },
  };

  return (
    <motion.div
      variants={variants[variant]}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ ...transitions.base, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
