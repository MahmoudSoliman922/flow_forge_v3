/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#1e1e2e',
        'bg-secondary': '#282a36',
        'text-primary': '#f8f8f2',
        'text-secondary': '#bd93f9',
        'accent-primary': '#ff79c6',
        'accent-secondary': '#50fa7b',
        'button-hover': '#44475a',
      },
      fontFamily: {
        'fira-code': ['"Fira Code"', 'monospace'],
      },
    },
  },
  plugins: [],
};