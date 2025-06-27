/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}", // update paths as needed
  ],
  theme: {
    extend: {
      colors: {
        neutral: {
          white: "#FFFFFF",
          lightest: "#F2F2F2",
          lighter: "#D8DADA",
          light: "#B2B5B6",
          DEFAULT: "#7F8486",
          dark: "#4C5255",
          darker: "#192125",
          darkest: "#00090D",
        },
        dodger: {
          lightest: "#E6F6FE",
          lighter: "#CDEEFE",
          light: "#50C5FD",
          DEFAULT: "#06ADFD",
          dark: "#048ACA",
          darker: "#024565",
          darkest: "#01334B",
        },
        torch: {
          lightest: "#FEE6EA",
          lighter: "#FECED5",
          light: "#FD546E",
          DEFAULT: "#FD0C30",
          dark: "#CA0926",
          darker: "#650413",
          darkest: "#4B030E",
        },
        pizzazz: {
          lightest: "#FEE6FA",
          lighter: "#FECDF5",
          light: "#FC52DC",
          DEFAULT: "#FC09CD",
          dark: "#C907A4",
          darker: "#640352",
          darkest: "#4B023D",
        },
      },
    },
  },
  plugins: [],
};
