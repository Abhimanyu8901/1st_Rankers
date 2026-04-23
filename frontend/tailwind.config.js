/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefdf8",
          100: "#d4f6ea",
          500: "#1e8f6d",
          600: "#147457",
          700: "#115d47",
          900: "#0c3327"
        },
        accent: "#f59e0b"
      },
      boxShadow: {
        panel: "0 20px 45px rgba(15, 23, 42, 0.08)"
      },
      fontFamily: {
        sans: ["Segoe UI", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
