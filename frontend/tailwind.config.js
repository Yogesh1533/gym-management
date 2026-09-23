/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Champagne gold accent used across the app
        brand: {
          50:  '#fbf8f1',
          100: '#f5eedb',
          200: '#ecdcb3',
          300: '#e3c888',
          400: '#d9b465',
          500: '#c9a04a',
          600: '#a9823a',
          700: '#86652f',
          800: '#5e4824',
          900: '#3a2d18',
        },
        ink: {
          950: '#07070a',
          900: '#0d0d11',
          850: '#121217',
          800: '#18181e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(217,180,101,0.25), 0 12px 40px -12px rgba(201,160,74,0.45)',
        soft: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 40px -24px rgba(0,0,0,0.8)',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: 0, transform: 'translateY(12px)' }, '100%': { opacity: 1, transform: 'none' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        marquee: 'marquee 40s linear infinite',
      },
    },
  },
  plugins: [],
};
