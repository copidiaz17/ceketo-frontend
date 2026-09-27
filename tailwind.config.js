/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: '#2A9D8F',
          light: '#52B9AD',
          dark: '#1A7A6E',
        },
        'brand-orange': '#F6521D',
        'brand-cream':  '#FFF4EC',
        'brand-green':  '#058D76',
        'brand-purple': '#885784',
        keto: {
          orange: '#F6521D',
          purple: '#885784',
          green:  '#9CCC66',
          dark:   '#1A2E2A',
          cream:  '#FFF4EC',
        },
        // Paleta del manual de marca (Serif Estudio). Los "-t" son la versión
        // apenas más oscura para TEXTO chico (contraste AA sobre crema/blanco).
        ck: {
          verde:    '#058D76',
          'verde-t': '#047764',
          naranja:  '#F6521D',
          'naranja-t': '#C44117',
          'naranja-btn': '#D2410F',
          violeta:  '#885784',
          lima:     '#9CCC66',
          'lima-t': '#557038',
          salvia:   '#5AB282',
          crema:    '#F7F1E6',
          blanco:   '#FFFDF8',
          tinta:    '#17302B',
          profundo: '#0E4F45',
          noche:    '#0B3B34',
          'lima-suave':    '#EDF5E1',
          'violeta-suave': '#F3ECF2',
          'naranja-suave': '#FDE9E1',
        },
      },
      fontFamily: {
        display: ['Mirza', 'serif'],
        body: ['Comodo', 'Inter', 'sans-serif'],
        // Tienda (marca): Cherione = logotipo y títulos, Comodo = slogan/etiquetas, Poppins = texto
        // Nombres propios ("CK …") para no pisar la 'Comodo' de cdnfonts que usa el admin
        marca:    ['CK Cherione', 'Poppins', 'sans-serif'],
        etiqueta: ['CK Comodo', 'Poppins', 'sans-serif'],
        texto:    ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease forwards',
        'fade-in': 'fadeIn 1s ease forwards',
        'slide-in-left': 'slideInLeft 0.8s ease forwards',
        'slide-in-right': 'slideInRight 0.8s ease forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-shift': 'gradientShift 6s ease infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-60px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(60px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}
