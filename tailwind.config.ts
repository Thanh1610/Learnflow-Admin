// tailwind.config.js
import { heroui } from '@heroui/react';
import { heroUiThemes } from './app/theme/herouiThemes';

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/components/(avatar|button|checkbox|chip|date-picker|dropdown|input|listbox|navbar|popover|select|skeleton|snippet|toggle|toast|ripple|spinner|form|calendar|date-input|menu|divider|scroll-shadow).js',
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [heroui({ themes: heroUiThemes })],
};
