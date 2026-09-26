import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F5F1E8",
        ink: "#1E1B16",
        rust: "#B5502F", // accent — buttons, ratings, recommendation wash
        forest: "#3A4A3A",
        stamp: "#E4DBC8",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        spine: "2px 10px 10px 2px", // asymmetric radius so cards read as book spines, not generic rounded cards
      },
    },
  },
  plugins: [],
};
export default config;
