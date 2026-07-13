import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./data/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blackline: {
          black: "#050505",
          charcoal: "#121416",
          graphite: "#1d2024",
          steel: "#8f969f",
          silver: "#d6d9dd",
          red: "#c5342f"
        }
      },
      fontFamily: {
        display: ["var(--font-inter)", "Arial", "sans-serif"],
        body: ["var(--font-inter)", "Arial", "sans-serif"]
      },
      boxShadow: {
        metal: "0 18px 50px rgba(0, 0, 0, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
