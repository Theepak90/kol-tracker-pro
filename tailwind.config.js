/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Poppins', 'system-ui', 'sans-serif'],
        'mono': ['Geist Mono', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#b9e6fe',
          300: '#7cd4fd',
          400: '#36bffa',
          500: '#0ba5ec',
          600: '#0086c9',
          700: '#026aa2',
          800: '#065986',
          900: '#0b4a6f',
          950: '#082f4d',
        },
        surface: {
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
        },
      },
      boxShadow: {
        'glow': '0 0 0 1px rgba(11, 165, 236, 0.05), 0 1px 3px 0 rgba(11, 165, 236, 0.1), 0 1px 2px -1px rgba(11, 165, 236, 0.1)',
        'glow-md': '0 0 0 1px rgba(11, 165, 236, 0.05), 0 4px 6px -1px rgba(11, 165, 236, 0.1), 0 2px 4px -2px rgba(11, 165, 236, 0.1)',
        'glow-lg': '0 0 0 1px rgba(11, 165, 236, 0.05), 0 10px 15px -3px rgba(11, 165, 236, 0.1), 0 4px 6px -4px rgba(11, 165, 236, 0.1)',
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        glow: {
          '0%, 100%': {
            opacity: 1,
          },
          '50%': {
            opacity: 0.5,
          },
        },
      },
    },
  },
  plugins: [],
};
