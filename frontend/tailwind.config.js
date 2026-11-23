/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      colors: {
        brand: { 50:'#eef4ff',100:'#dbe6ff',200:'#bfd2ff',300:'#93b4ff',400:'#608bff',500:'#3b63f6',600:'#2545eb',700:'#1d35d8',800:'#1e2faf',900:'#1e2d8a',950:'#161d54' },
        ink: { 900:'#0b1020', 800:'#121a33', 700:'#1b2546' }
      },
      keyframes: { pulseRing: { '0%':{transform:'scale(.9)',opacity:'.7'}, '100%':{transform:'scale(1.6)',opacity:'0'} }, wave: { '0%,100%':{transform:'scaleY(.3)'}, '50%':{transform:'scaleY(1)'} } },
      animation: { pulseRing: 'pulseRing 1.6s ease-out infinite', wave: 'wave 1s ease-in-out infinite' }
    }
  },
  plugins: []
}
