/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Warm, calm palette inspired by natural wood and paper
        surface: {
          50: '#faf9f7',
          100: '#f5f3ef',
          200: '#ebe7e0',
          300: '#ddd7cc',
          400: '#c4baa8',
          500: '#a89d88',
          600: '#8b7f6a',
          700: '#6e6454',
          800: '#524b40',
          900: '#3a352e',
          950: '#1f1c18',
        },
        accent: {
          DEFAULT: '#2d5a45',
          50: '#f0f7f4',
          100: '#dceee5',
          200: '#bbddce',
          300: '#8ec4af',
          400: '#5fa58b',
          500: '#2d5a45',
          600: '#2d6b53',
          700: '#275644',
          800: '#234538',
          900: '#1f392f',
          950: '#0e201a',
        },
        danger: {
          DEFAULT: '#b84a4a',
          50: '#fef3f2',
          100: '#fee4e2',
          200: '#fecdca',
          300: '#fcaba5',
          400: '#f87971',
          500: '#b84a4a',
          600: '#d03c3c',
          700: '#ae2e2e',
          800: '#902929',
          900: '#772828',
          950: '#401111',
        },
        warning: {
          DEFAULT: '#c4870f',
          50: '#fefaec',
          100: '#fbf0c9',
          200: '#f7e08e',
          300: '#f2c954',
          400: '#efb52d',
          500: '#c4870f',
          600: '#be760b',
          700: '#9e560c',
          800: '#814411',
          900: '#6a3812',
          950: '#3d1c05',
        }
      },
      animation: {
        'slide-up': 'slide-up 0.2s ease-out',
        'slide-down': 'slide-down 0.2s ease-out',
        'fade-in': 'fade-in 0.15s ease-out',
        'scale-in': 'scale-in 0.15s ease-out',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.08), 0 4px 16px -4px rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 4px 16px -4px rgba(0, 0, 0, 0.1), 0 8px 32px -8px rgba(0, 0, 0, 0.08)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}

