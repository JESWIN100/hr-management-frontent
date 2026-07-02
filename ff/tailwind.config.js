/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: '#0f4c4a',
          orange: '#f9762f',
          green: '#22c07a',
          blue: '#3b82f6',
          purple: '#a855f7',
          amber: '#f59e0b',
        },
        surface: '#f4f6f8',
        card: '#ffffff',
        ink: {
          900: '#12181b',
          700: '#3a4650',
          500: '#6b7680',
          300: '#a6afb6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,28,0.04), 0 1px 12px rgba(16,24,28,0.05)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
