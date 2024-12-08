/** @type {import('tailwindcss').Config} */
const vsTheme = require("./src/lib/vscode-theme-plugin");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  plugins: [vsTheme],
};
