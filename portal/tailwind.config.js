/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      xs: "360px",

      xsm: "468px",

      sm: "670px",

      md: "768px",

      xmd: "850px",

      lg: "1024px",

      xl: "1280px",

      "2xl": "1536px",

      xxl: "1580px",

      xxxl: "1780px",

      "3xl": "2020px",

      "4xl": "2440px",
    },
    extend: {
      colors: {
        bg: "var(--bg)",
        whiteColor: "var(--whiteColor)",
        redColor: "var(--red)",
        primaryColor: "var(--primary)",
        secondaryColor: "var(--secondary)",
        lightPrimaryColor: "var(--lightPrimary)",
        darkPrimaryColor: "var(--darkPrimary)",
        bgColor: "var(--bg-color)",
        textColor: "var(--text-color)",
        grayColor: "var(--gray-color)",
        border: "var(--border)",
        grayTextColor: "var(--grayTextColor)",
        borderColor: "var(--borderColor)",
        mainColor: "var(--main-color)",
        mainColor200: "var(--main-color200)",
      },
      spacing: {
        128: "32rem",
        144: "36rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
    fontFamily: {
      sans: ["Graphik", "sans-serif"],
      serif: ["Merriweather", "serif"],
    },
  },
  daisyui: {
    themes: [
      {
        light: {
          "--bg": "#F5F5F5",
          "--whiteColor": "#ffffff",
          "--red": "#FF0000",
          "--textColor": "#202020",
          "--secondary": "#ED8958",
          "--primary": "#155e75",
          "--lightPrimary": "#155f752c",
          "--darkPrimary": "#0b5468",
          "--bg-color": "#fff",
          "--text-color": "#000",
          "--gray-color": "#000",
          "--border": "#00000020",
          "--main-color": "#ff5556",
          "--main-color200": "#2D62AE20",
          "--borderColor": "#dddde2",
          "--grayTextColor": "#636363",

          // "--primary": "#0f766e",
          // "--lightPrimary": "#0f766d2f",
          // "--primary": "#FF2B85",
          // "--lightPrimary": "#ff2b8327",
          // "--primary": "#FFA500",
          // "--primary": "#FF7401",
          // "--lightPrimary": "#d9770634",
        },
        dark: {
          "--bg": "#161A1F",
          "--whiteColor": "#ffffff",
          "--textColor": "#202020",
          "--red": "#FF0000",
          "--secondary": "#ED8958",
          "--primary": "#FF2B85",
          "--lightPrimary": "#ff2b8327",
          "--darkPrimary": "#ff006a",
          "--bg-color": "#1C2126",
          "--text-color": "#ffffff99",
          "--gray-color": "#ffffff99",
          "--border": "#ffffff30",
          "--main-color": "#2D62AE",
          "--main-color200": "#2D62AE20",
          "--borderColor": "#dddde2",
          "--grayTextColor": "#636363",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
};
