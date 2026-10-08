/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FDFCFB',
          100: '#F7F5F0', // Brand Warm Ivory
          200: '#EFECE3',
          300: '#E5E0D4',
        },
        charcoal: {
          50: '#F4F4F3',
          100: '#E1E1E0',
          500: '#4A4C45',
          700: '#32342E',
          800: '#2A2B27',
          900: '#242521', // Brand Deep Charcoal
          950: '#1A1B18',
        },
        stone: {
          100: '#F0ECE4',
          200: '#E6E1D7',
          300: '#D9D4C9', // Brand Muted Stone
          400: '#C2BCB0',
          500: '#A8A296',
        },
        olive: {
          50: '#F4F5F0',
          100: '#E7E9DD',
          200: '#CFD3BD',
          300: '#B4B999',
          400: '#949977',
          500: '#777B5A', // Brand Restrained Olive Accent
          600: '#64684A',
          700: '#4F523A',
          800: '#3C3E2C',
        },
        ash: {
          400: '#9E9E99',
          500: '#71716D', // Muted Grey
          600: '#545450',
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'xs': '2px',
        'sm': '4px',
        'DEFAULT': '6px',
        'md': '8px',
        'lg': '10px',
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(36, 37, 33, 0.05), 0 1px 2px rgba(36, 37, 33, 0.03)',
        'editorial': '0 4px 20px -2px rgba(36, 37, 33, 0.08)',
        'drawer': '0 10px 40px rgba(36, 37, 33, 0.15)',
      },
    },
  },
  plugins: [],
}
