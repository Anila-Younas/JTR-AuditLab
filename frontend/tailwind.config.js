/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                cyber: {
                    dark: '#0a0e17',
                    darker: '#060910',
                    blue: '#0f172a',
                    navy: '#1e293b',
                    accent: '#0ea5e9',
                    cyan: '#22d3ee',
                    magenta: '#d946ef',
                    pink: '#ec4899',
                },
                risk: {
                    high: '#ef4444',
                    medium: '#f59e0b',
                    low: '#22c55e',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Consolas', 'monospace'],
            },
            animation: {
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'spin-slow': 'spin 3s linear infinite',
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
            },
            keyframes: {
                'pulse-glow': {
                    '0%, 100%': { opacity: 1, boxShadow: '0 0 20px rgba(14, 165, 233, 0.4)' },
                    '50%': { opacity: 0.8, boxShadow: '0 0 40px rgba(14, 165, 233, 0.6)' },
                },
                fadeIn: {
                    '0%': { opacity: 0 },
                    '100%': { opacity: 1 },
                },
                slideUp: {
                    '0%': { opacity: 0, transform: 'translateY(10px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: 0, transform: 'scale(0.95)' },
                    '100%': { opacity: 1, transform: 'scale(1)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
            boxShadow: {
                'glow-cyan': '0 0 20px rgba(34, 211, 238, 0.3)',
                'glow-magenta': '0 0 20px rgba(217, 70, 239, 0.3)',
                'glow-red': '0 0 25px rgba(239, 68, 68, 0.4)',
                'inner-glow': 'inset 0 0 20px rgba(14, 165, 233, 0.1)',
            }
        },
    },
    plugins: [],
}
