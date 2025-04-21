/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './html_mockup/src/**/*.{html,js}',
      './src/**/*.{html,js,jsx,ts,tsx}',
    ],
    theme: {
      extend: {
        colors: {
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
          serif: ['Merriweather', 'serif'],
        },
        spacing: {
          '128': '32rem',
          '144': '36rem',
        },
        borderRadius: {
          '4xl': '2rem',
        }
      },
    },
    plugins: [
      require('@tailwindcss/typography'),
      require('@tailwindcss/forms'),
      require('@tailwindcss/aspect-ratio'),
    ],
  }