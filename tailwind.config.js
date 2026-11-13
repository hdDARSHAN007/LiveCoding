/** @type {import('tailwindcss').Config} */
// Colours now read CSS variables (defined in src/index.css) so one class
// like "bg-surface" works in both dark and light theme.
const c = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: c("ink"),
        surface: c("surface"),
        surfaceRaised: c("surface-raised"),
        line: c("line"),
        hi: c("hi"),
        lo: c("lo"),
        violet: c("violet"),
        mint: c("mint"),
        coral: c("coral"),
        amber: c("amber"),
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
        sans: ['"IBM Plex Sans"', "ui-sans-serif", "system-ui"],
        display: ['"Space Grotesk"', "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
