/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        loading: {
          '0%': { opacity: '.2' },
          '20%': { opacity: '1' },
          '100%': { opacity: '.2' },
        },
        blink: {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'blink': 'blink 1s infinite',
      },
      fontFamily: {
        sans: [
          'Inter var',
          'ui-sans-serif', 
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji'
        ]
      },
      colors: {
        blue: {
          25: '#f0f7ff',
        },
        green: {
          25: '#f0fdf4',
        },
        red: {
          25: '#fff1f2',
        },
        // Add similar 25-tint colors for other color families
      }
    },
  },
  plugins: [],
};
