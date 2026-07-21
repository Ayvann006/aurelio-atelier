import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Definidos como variables CSS (ver globals.css) para poder soportar
        // el modo día del admin sin tener que tocar cada clase del código:
        // basta con redefinir estas variables dentro de .tema-claro.
        negro: 'rgb(var(--color-negro) / <alpha-value>)',
        negro2: 'rgb(var(--color-negro2) / <alpha-value>)',
        negro3: 'rgb(var(--color-negro3) / <alpha-value>)',
        marfil: 'rgb(var(--color-marfil) / <alpha-value>)',
        marfil2: 'rgb(var(--color-marfil2) / <alpha-value>)',
        dorado: 'rgb(var(--color-dorado) / <alpha-value>)',
        dorado2: 'rgb(var(--color-dorado2) / <alpha-value>)',
      },
      fontFamily: {
        cormorant: ['var(--font-cormorant)', 'serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.8s ease forwards',
        'fade-in': 'fadeIn 0.6s ease forwards',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
