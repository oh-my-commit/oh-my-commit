import vsTheme from "./src/lib/vscode-theme-plugin"

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: {
        'xs': '320px',
      },
    },
  },
  plugins: [vsTheme],
}
