/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './html_mockup/src/**/*.{html,js}',
      './src/**/*.{html,js,jsx,ts,tsx}',
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
            950: '#082f49',
          },
          secondary: {
            50: '#f5f5f5',
            100: '#e9e9e9',
            200: '#d9d9d9',
            300: '#c4c4c4',
            400: '#9d9d9d',
            500: '#7b7b7b',
            600: '#555555',
            700: '#434343',
            800: '#262626',
            900: '#171717',
            950: '#0d0d0d',
          },
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