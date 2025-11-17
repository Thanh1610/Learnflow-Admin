
// tailwind.config.js
import { heroui } from "@heroui/react";
import { heroUiThemes } from "./app/theme/herouiThemes";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/components/(button|input|toggle|ripple|spinner|form).js"
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui({themes: heroUiThemes})],
};