/** @type {import('tailwindcss').Config} */
const vsTheme = require("./src/lib/vscode-theme");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  plugins: [vsTheme],
};
