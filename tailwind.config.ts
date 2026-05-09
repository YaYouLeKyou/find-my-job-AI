import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#0f172a',
          800: '#111827',
          700: '#1e293b',
          500: '#0ea5e9',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(14, 165, 233, 0.2), 0 20px 50px rgba(14, 165, 233, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
