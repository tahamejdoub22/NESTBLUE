import { Variants, Transition } from "framer-motion";

/**
 * Standard animation durations (in seconds)
 */
export const motionDurations = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
} as const;

/**
 * Standard easing curves
 */
export const motionEasing = {
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  spring: [0.68, -0.55, 0.265, 1.55],
} as const;

/**
 * Common transition presets
 */
export const transitions = {
  default: {
    duration: motionDurations.normal,
    ease: motionEasing.easeOut,
  } as Transition,
  spring: {
    type: "spring",
    stiffness: 300,
    damping: 30,
  } as Transition,
  smooth: {
    duration: motionDurations.slow,
    ease: motionEasing.easeInOut,
  } as Transition,
  fast: {
    duration: motionDurations.fast,
    ease: motionEasing.easeOut,
  } as Transition,
};

/**
 * Fade animations
 */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

/**
 * Scale animations
 */
export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

/**
 * Slide animations
 */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Stagger container for children
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Card hover animations
 */
export const cardHover: Variants = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -4 },
};

/**
 * Button press animation
 */
export const buttonPress: Variants = {
  rest: { scale: 1 },
  pressed: { scale: 0.95 },
};

/**
 * Modal/Overlay animations
 */
export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

/**
 * List item animations
 */
export const listItem: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
    },
  }),
};

/**
 * Progress bar animation
 */
export const progressBar: Variants = {
  hidden: { width: 0 },
  visible: (width: number) => ({
    width: `${width}%`,
    transition: {
      duration: 0.8,
      ease: motionEasing.easeOut,
    },
  }),
};

/**
 * Chart bar animation
 */
export const chartBar: Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: (height: number) => ({
    height: `${height}%`,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: motionEasing.easeOut,
    },
  }),
};

/**
 * Number counter animation props
 */
export const numberCounter = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};


