/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        card: '#1a1a1a',
        legitGreenStart: '#10b981',
        legitGreenEnd: '#059669',
        fakeRedStart: '#ef4444',
        fakeRedEnd: '#dc2626',
        camoGreen: '#4a6741',
        textPrimary: '#ffffff',
        textMuted: '#9ca3af',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': {opacity: '0'},
          '100%': {opacity: '1'},
        },
        bounceScale: {
          '0%, 100%': {transform: 'scale(1)'},
          '50%': {transform: 'scale(1.1)'},
        },
        shimmer: {
          '0%': {backgroundPosition: '-200% 0'},
          '100%': {backgroundPosition: '200% 0'},
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease forwards',
        bounceScale: 'bounceScale 0.3s ease',
        shimmer: 'shimmer 1.5s linear infinite',
      },
      backgroundImage: {
        shimmer:
          'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.05) 75%)',
      },
    },
  },
  plugins: [],
};
