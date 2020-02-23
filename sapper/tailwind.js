module.exports = {
  theme: {
    spinner: (theme) => ({
      default: {
        color: theme('colors.blue.500', 'blue'),
        size: '1em', 
        border: '2px', 
        speed: '500ms', 
      },
      md: {
        color: theme('colors.blue.500', 'blue'),
        size: '2em',
        border: '2px',
        speed: '500ms',
      },
    }),
    transform: {
      'none': 'none',
    },
    translate: { 
      '1/2': '50%',
      'full': '100%',
      'right-up': ['100%', '-100%'],
      '3d': ['40px', '-60px', '-130px'],
    },
    extend: {
      colors: {
        primary: {
          100: '#F0EFF7',
          200: '#DDDAE5',
          600: '#CDA8C7',
          700: '#B498AE',
          900: '#5F485A',
        }, 
        secondary: '#BD1550',
        thirdary: '#E97F02',
        fourthary: '#F8CA00',
        fifthary: '8A9B0F',
      },
      spacing: {
        '7': '1.75rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
        '128': '32rem',
        '144': '36rem',
        '168': '42rem',
      },
      borderWidth: {
        '3': '3px',
        '16': '16px',
        '20': '20px',
        '25': '25px',
        '32': '32px',
        '48': '48px',
        '64': '64px',
      },
    },
  },
<<<<<<< HEAD
  variants: {
    backgroundColor: ["hover", "focus", "even", "group-hover", "odd", "visited", "responsive", "active", "disabled"],
    textColor: ['responsive', 'hover', 'focus', 'group-hover'],
  },
=======
  variants: {},
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
  plugins: [
      require('tailwindcss-spinner')(),
      require('tailwindcss-transforms')({
        '3d': false, 
      }),
      require('tailwindcss-transitions')(),
			function ({ addComponents }) {
      addComponents({
        '.container': {
						maxWidth: '100%',
          '@screen sm': {
            maxWidth: '640px',
          },
          '@screen md': {
            maxWidth: '767px',
          },
          '@screen lg': {
            maxWidth: '1024px',
          },
          '@screen xl': {
            maxWidth: '1024px',
          },
        }
      })
    },
  ]
}
