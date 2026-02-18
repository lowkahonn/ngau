/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        title: ["Cinzel", "Times New Roman", "serif"],
        body: ["Noto Sans TC", "PingFang TC", "sans-serif"]
      },
      colors: {
        felt: {
          900: "#072b22",
          800: "#0f4d3d",
          700: "#166a54"
        },
        chip: {
          red: "#d12424",
          ivory: "#efe8d6",
          dark: "#1a1a1a"
        }
      },
      boxShadow: {
        card: "0 10px 25px rgba(0, 0, 0, 0.25)",
        panel: "0 20px 40px rgba(0, 0, 0, 0.35)"
      }
    }
  },
  plugins: []
};
