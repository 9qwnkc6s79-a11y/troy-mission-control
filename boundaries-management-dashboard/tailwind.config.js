/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // Boundaries Coffee Brand Colors
        coffee: {
          50: '#fdf8f3',
          100: '#f9ede0',
          200: '#f2d9c1',
          300: '#e8bf96',
          400: '#dca16a',
          500: '#d4864a',
          600: '#c66f3e',
          700: '#a55735',
          800: '#854632',
          900: '#6b3a2b',
        },
        cream: {
          50: '#fffef7',
          100: '#fffbeb',
          200: '#fef3c7',
          300: '#fde68a',
          400: '#fcd34d',
          500: '#f59e0b',
        },
        sage: {
          50: '#f6f7f6',
          100: '#e3e8e3',
          200: '#c7d2c7',
          300: '#9db09d',
          400: '#6e886e',
          500: '#526b52',
          600: '#425a42',
          700: '#364836',
          800: '#2d3a2d',
          900: '#253025',
        },
        boundaries: {
          primary: '#6e886e',
          secondary: '#d4864a',
          accent: '#f59e0b',
          dark: '#253025',
        }
      }
    },
  },
  plugins: [],
}