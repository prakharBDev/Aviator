/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        customDark: "#1b1c1d", // Add your custom color here
      },
      boxShadow: {
        custom: "inset 0 1px 1px rgba(255, 255, 255, 0.5)",
      },
    },
  },
  plugins: [],
};
