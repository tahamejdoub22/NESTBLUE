/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      // ═══════════════════════════════════════════════════════════════════════
      // COLOR SYSTEM - Professional Design System
      // ═══════════════════════════════════════════════════════════════════════
      colors: {
        // Primary Brand Colors - Nest Blue (from logo: dark teal-blue, medium blue, light sky-blue)
        primary: {
          50: '#e0f2fe',
          100: '#bae6fd',
          200: '#7dd3fc',
          300: '#38bdf8',
          400: '#0ea5e9',  // Light sky-blue (lower body)
          500: '#0284c7',  // Medium blue (middle piece)
          600: '#0369a1',  // Dark teal-blue (head/beak)
          700: '#075985',
          800: '#0c4a6e',
          900: '#082f49',
          950: '#051a2e',
          DEFAULT: '#0284c7',
          foreground: '#ffffff',
        },

        // Secondary - Sophisticated Slate
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
          DEFAULT: '#64748b',
          foreground: '#ffffff',
        },

        // Success - Emerald Green
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
          DEFAULT: '#10b981',
          foreground: '#ffffff',
        },

        // Warning - Amber
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
          DEFAULT: '#f59e0b',
          foreground: '#000000',
        },

        // Error / Destructive - Rose Red
        destructive: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
          DEFAULT: '#f43f5e',
          foreground: '#ffffff',
        },

        // Info - Sky Blue
        info: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
          DEFAULT: '#0ea5e9',
          foreground: '#ffffff',
        },

        // Accent - Violet/Purple for special elements
        accent: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },

        // Neutral - For text and backgrounds
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },

        // Semantic colors using CSS variables
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        // Surface colors for layered UI
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          elevated: 'hsl(var(--surface-elevated))',
          overlay: 'hsl(var(--surface-overlay))',
        },
      },

      // ═══════════════════════════════════════════════════════════════════════
      // TYPOGRAPHY SYSTEM
      // ═══════════════════════════════════════════════════════════════════════
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
      },

      fontSize: {
        // Display sizes for hero sections
        'display-2xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-md': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'display-sm': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
        'display-xs': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],

        // Body text
        'body-xl': ['1.25rem', { lineHeight: '1.75', fontWeight: '400' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75', fontWeight: '400' }],
        'body-md': ['1rem', { lineHeight: '1.625', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'body-xs': ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }],

        // UI text
        'label-lg': ['0.875rem', { lineHeight: '1.25', fontWeight: '500' }],
        'label-md': ['0.8125rem', { lineHeight: '1.25', fontWeight: '500' }],
        'label-sm': ['0.75rem', { lineHeight: '1.25', fontWeight: '500' }],

        // Caption & Overline
        'caption': ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }],
        'overline': ['0.6875rem', { lineHeight: '1.5', fontWeight: '600', letterSpacing: '0.1em' }],
      },

      // ═══════════════════════════════════════════════════════════════════════
      // SPACING & LAYOUT
      // ═══════════════════════════════════════════════════════════════════════
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '6.5': '1.625rem',
        '7.5': '1.875rem',
        '8.5': '2.125rem',
        '9.5': '2.375rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '17': '4.25rem',
        '18': '4.5rem',
        '19': '4.75rem',
        '21': '5.25rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem',
        '42': '10.5rem',
        '50': '12.5rem',
        '54': '13.5rem',
        '58': '14.5rem',
        '62': '15.5rem',
        '66': '16.5rem',
        '70': '17.5rem',
        '74': '18.5rem',
        '78': '19.5rem',
        '82': '20.5rem',
        '86': '21.5rem',
        '90': '22.5rem',
        '94': '23.5rem',
        '100': '25rem',
      },

      // ═══════════════════════════════════════════════════════════════════════
      // BORDER RADIUS
      // ═══════════════════════════════════════════════════════════════════════
      borderRadius: {
        'none': '0',
        'xs': '0.125rem',
        'sm': '0.25rem',
        'DEFAULT': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        'full': '9999px',
      },

      // ═══════════════════════════════════════════════════════════════════════
      // SHADOWS - Layered elevation system
      // ═══════════════════════════════════════════════════════════════════════
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'DEFAULT': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '3xl': '0 35px 60px -15px rgb(0 0 0 / 0.3)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'inner-lg': 'inset 0 4px 8px 0 rgb(0 0 0 / 0.1)',
        'none': 'none',
        // Colored shadows
        'primary-sm': '0 2px 8px -2px rgb(51 102 255 / 0.3)',
        'primary': '0 4px 14px -3px rgb(51 102 255 / 0.4)',
        'primary-lg': '0 8px 24px -4px rgb(51 102 255 / 0.5)',
        'success-sm': '0 2px 8px -2px rgb(16 185 129 / 0.3)',
        'success': '0 4px 14px -3px rgb(16 185 129 / 0.4)',
        'warning-sm': '0 2px 8px -2px rgb(245 158 11 / 0.3)',
        'warning': '0 4px 14px -3px rgb(245 158 11 / 0.4)',
        'error-sm': '0 2px 8px -2px rgb(244 63 94 / 0.3)',
        'error': '0 4px 14px -3px rgb(244 63 94 / 0.4)',
        // Glass effect shadows
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-lg': '0 16px 48px 0 rgba(31, 38, 135, 0.2)',
        // Card shadows
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.02)',
        'card-hover': '0 10px 40px -10px rgb(0 0 0 / 0.15), 0 4px 12px -4px rgb(0 0 0 / 0.05)',
        // Floating elements
        'float': '0 6px 20px -5px rgb(0 0 0 / 0.15)',
        'float-lg': '0 12px 40px -10px rgb(0 0 0 / 0.2)',
      },

      // ═══════════════════════════════════════════════════════════════════════
      // BACKDROP BLUR
      // ═══════════════════════════════════════════════════════════════════════
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },

      // ═══════════════════════════════════════════════════════════════════════
      // ANIMATIONS
      // ═══════════════════════════════════════════════════════════════════════
      animation: {
        // Fade animations
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'fade-in-down': 'fadeInDown 0.4s ease-out',
        'fade-in-left': 'fadeInLeft 0.4s ease-out',
        'fade-in-right': 'fadeInRight 0.4s ease-out',

        // Scale animations
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.2s ease-out',

        // Slide animations
        'slide-in-top': 'slideInTop 0.3s ease-out',
        'slide-in-bottom': 'slideInBottom 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',

        // Bounce & Spring
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'spring': 'spring 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',

        // Pulse & Glow
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',

        // Shimmer
        'shimmer': 'shimmer 2s linear infinite',

        // Float
        'float': 'float 3s ease-in-out infinite',

        // Spin variations
        'spin-slow': 'spin 3s linear infinite',
        'spin-fast': 'spin 0.5s linear infinite',

        // Accordion
        'accordion-down': 'accordionDown 0.2s ease-out',
        'accordion-up': 'accordionUp 0.2s ease-out',

        // Progress
        'progress': 'progress 1s ease-in-out infinite',

        // Skeleton
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.95)' },
        },
        slideInTop: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideInBottom: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        spring: {
          '0%': { transform: 'scale(0.9)' },
          '50%': { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px currentColor, 0 0 10px currentColor' },
          '50%': { boxShadow: '0 0 10px currentColor, 0 0 20px currentColor' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        accordionDown: {
          '0%': { height: '0' },
          '100%': { height: 'var(--radix-accordion-content-height)' },
        },
        accordionUp: {
          '0%': { height: 'var(--radix-accordion-content-height)' },
          '100%': { height: '0' },
        },
        progress: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        skeleton: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },

      // ═══════════════════════════════════════════════════════════════════════
      // TRANSITIONS
      // ═══════════════════════════════════════════════════════════════════════
      transitionDuration: {
        '0': '0ms',
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
        '300': '300ms',
        '350': '350ms',
        '400': '400ms',
        '500': '500ms',
        '600': '600ms',
        '700': '700ms',
        '800': '800ms',
        '900': '900ms',
        '1000': '1000ms',
      },

      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },

      // ═══════════════════════════════════════════════════════════════════════
      // Z-INDEX
      // ═══════════════════════════════════════════════════════════════════════
      zIndex: {
        'behind': '-1',
        '0': '0',
        '1': '1',
        '2': '2',
        '5': '5',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        'dropdown': '100',
        'sticky': '200',
        'fixed': '300',
        'overlay': '400',
        'modal': '500',
        'popover': '600',
        'tooltip': '700',
        'toast': '800',
        'max': '9999',
      },

      // ═══════════════════════════════════════════════════════════════════════
      // ASPECT RATIO
      // ═══════════════════════════════════════════════════════════════════════
      aspectRatio: {
        'auto': 'auto',
        'square': '1 / 1',
        'video': '16 / 9',
        'photo': '4 / 3',
        'portrait': '3 / 4',
        'wide': '21 / 9',
        'golden': '1.618 / 1',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
