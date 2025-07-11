/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['DM Mono', 'monospace'],
        'dm-mono': ['DM Mono', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--primary-rgb))',
          dark: 'var(--primary-dark)',
          50: 'rgb(var(--primary-rgb) / 0.5)',
          100: 'rgb(var(--primary-rgb) / 0.1)',
          200: 'rgb(var(--primary-rgb) / 0.2)',
          300: 'rgb(var(--primary-rgb) / 0.3)',
          400: 'rgb(var(--primary-rgb) / 0.4)',
          500: 'rgb(var(--primary-rgb) / 0.5)',
          600: 'rgb(var(--primary-rgb) / 0.6)',
          700: 'rgb(var(--primary-rgb) / 0.7)',
          800: 'rgb(var(--primary-rgb) / 0.8)',
          900: 'rgb(var(--primary-rgb) / 0.9)',
        },
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-hover': 'var(--card-hover)',
        border: 'var(--border)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%': { transform: 'translate(0, 0) rotate(0deg) scale(1)' },
          '33%': { transform: 'translate(20px, -20px) rotate(120deg) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) rotate(240deg) scale(0.9)' },
          '100%': { transform: 'translate(0, 0) rotate(360deg) scale(1)' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(37, 99, 235, 0.2)',
        'glow-lg': '0 0 30px rgba(37, 99, 235, 0.3)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      typography: {
        DEFAULT: {
          css: {
            color: 'var(--foreground)',
            a: {
              color: 'var(--primary)',
              '&:hover': {
                color: 'var(--primary-dark)',
              },
            },
          },
        },
      },
    },
  },
  plugins: [],
}
