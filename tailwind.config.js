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
                serif: ['"Playfair Display"', 'serif'],
            },
            colors: {
                background: '#050505',
                surface: '#0a0a0a',
                'surface-light': '#121212',
                primary: '#ffffff', // Minimalist white primary
                secondary: '#a1a1aa', // Zinc-400
                border: '#27272a',    // Zinc-800
            },
            animation: {
                'fade-in': 'fade-in 0.6s ease-out forwards',
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                }
            }
        },
    },
    plugins: [],
}
