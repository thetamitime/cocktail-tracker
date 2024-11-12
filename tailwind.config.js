/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        bregular: ["BeVietnamPro-Regular", "sans-serif"],
        bmedium: ["BeVietnamPro-Medium", "sans-serif"],
        bsemibold: ["BeVietnamPro-SemiBold", "sans-serif"],
        bbold: ["BeVietnamPro-Bold", "sans-serif"],
        bextrabold: ["BeVietnamPro-ExtraBold", "sans-serif"],
      }
    },
  },
  corePlugin: {
    backgroundOpacity: true,
  },
}

