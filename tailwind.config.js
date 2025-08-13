/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'progress-bar': {
          '0%': {
            'background-image': 'linear-gradient(to right, #60A5FA 0%, #3B82F6 50%, #60A5FA 100%)',
            'background-position': '100% 0',
          },
          '100%': {
            'background-image': 'linear-gradient(to right, #60A5FA 0%, #3B82F6 50%, #60A5FA 100%)',
            'background-position': '0 0',
          },
        },
      },
      animation: {
        'progress-7s': 'progress-bar 7s linear forwards',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}