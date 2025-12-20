/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                primary: {
                    DEFAULT: "#6366f1", // Indigo 500
                    hover: "#4f46e5",
                },
                secondary: "#ec4899", // Pink 500
                dark: "#0f172a", // Slate 900
            }
        },
    },
    plugins: [],
}
