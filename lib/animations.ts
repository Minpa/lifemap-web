/**
 * Animation utilities using Framer Motion
 * Day One-inspired smooth, natural animations
 */

import { Variants } from 'framer-motion';

// ===== Fade Animations =====
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// ===== Slide Animations =====
export const slideInLeft: Variants = {
  initial: { x: -100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -100, opacity: 0 },
};

export const slideInRight: Variants = {
  initial: { x: 100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 100, opacity: 0 },
};

export const slideInUp: Variants = {
  initial: { y: 100, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 100, opacity: 0 },
};

// ===== Scale Animations =====
export const scaleIn: Variants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
};

export const scaleInCenter: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
};

// ===== Modal/Dialog Animations =====
export const modalBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalContent: Variants = {
  initial: { scale: 0.95, opacity: 0, y: 20 },
  animate: { scale: 1, opacity: 1, y: 0 },
  exit: { scale: 0.95, opacity: 0, y: 20 },
};

// ===== List/Stagger Animations =====
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

// ===== Transition Presets =====
export const transitions = {
  fast: {
    duration: 0.15,
    ease: [0.4, 0, 0.2, 1],
  },
  base: {
    duration: 0.25,
    ease: [0.4, 0, 0.2, 1],
  },
  slow: {
    duration: 0.4,
    ease: [0.4, 0, 0.2, 1],
  },
  spring: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
  },
  springGentle: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 25,
  },
};

// ===== Hover/Tap Animations =====
export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
};

export const hoverLift = {
  whileHover: { y: -2, transition: transitions.fast },
  whileTap: { y: 0 },
};

export const hoverGlow = {
  whileHover: {
    boxShadow: '0 0 20px rgba(106, 227, 255, 0.3)',
    transition: transitions.base,
  },
};

// ===== Page Transition =====
export const pageTransition: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

// ===== Card Animations =====
export const cardHover = {
  whileHover: {
    y: -4,
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.35)',
    transition: transitions.base,
  },
};

// ===== Utility Functions =====
export const getStaggerDelay = (index: number, baseDelay = 0.05) => {
  return index * baseDelay;
};

export const createStaggerVariants = (
  itemVariant: Variants,
  staggerDelay = 0.05
): Variants => {
  return {
    animate: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };
};
