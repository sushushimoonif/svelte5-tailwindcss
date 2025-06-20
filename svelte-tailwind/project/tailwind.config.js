/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      colors: {
        'dark-gray': {
          800: '#1f2937',
          900: '#111827',
        }
      }
    },
  },
  plugins: [],
}