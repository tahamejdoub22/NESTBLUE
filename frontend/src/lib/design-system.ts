/**
 * Design System Utilities
 * 
 * Centralized design tokens and utilities for consistent styling across the application
 */

// ═══════════════════════════════════════════════════════════════════════════
// SPACING UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

export const spacing = {
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// BORDER RADIUS UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

export const borderRadius = {
  none: '0',
  xs: '0.125rem',   // 2px
  sm: '0.25rem',    // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SHADOW UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

export const shadows = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// TRANSITION UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

export const transitions = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// Z-INDEX UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  overlay: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 800,
  max: 9999,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// BREAKPOINT UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT SIZE UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

export const componentSizes = {
  button: {
    xs: { height: '1.75rem', paddingX: '0.5rem', fontSize: '0.75rem' },
    sm: { height: '2rem', paddingX: '0.75rem', fontSize: '0.875rem' },
    md: { height: '2.5rem', paddingX: '1rem', fontSize: '1rem' },
    lg: { height: '3rem', paddingX: '1.5rem', fontSize: '1.125rem' },
  },
  input: {
    xs: { height: '1.75rem', paddingX: '0.5rem', fontSize: '0.75rem' },
    sm: { height: '2rem', paddingX: '0.75rem', fontSize: '0.875rem' },
    md: { height: '2.5rem', paddingX: '1rem', fontSize: '1rem' },
    lg: { height: '3rem', paddingX: '1.5rem', fontSize: '1.125rem' },
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get transition string with duration and easing
 */
export function getTransition(
  duration: keyof typeof transitions = 'normal',
  property: string = 'all',
  easing: keyof typeof transitions.easing = 'default'
): string {
  return `${property} ${transitions[duration]} ${transitions.easing[easing]}`;
}

/**
 * Get shadow with color tint
 */
export function getShadow(
  size: keyof typeof shadows = 'md',
  color: string = 'rgb(0 0 0)',
  opacity: number = 0.1
): string {
  const baseShadow = shadows[size];
  if (size === 'none') return baseShadow;
  return baseShadow.replace(/rgb\(0 0 0 \/ [\d.]+\)/g, `${color} / ${opacity}`);
}



