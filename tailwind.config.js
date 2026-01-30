/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  // 既存CSSへの影響を最小化（Tailwindのリセットを無効化）
  corePlugins: {
    preflight: false,
  },
};
