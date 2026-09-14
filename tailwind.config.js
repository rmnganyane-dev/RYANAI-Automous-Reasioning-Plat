// File path: ./tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sovereign: {
          dark: '#020617', // Slate 950
          primary: '#3b82f6', // Blue 500
          accent: '#10b981', // Emerald 500
          panel: '#1e293b', // Slate 800
        }
      },
      fontFamily: {
        sans: ["Space Grotesk", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        orbitron: ["Orbitron", "sans-serif"],
      },
    },
  },
  plugins: [],
}