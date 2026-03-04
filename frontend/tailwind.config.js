/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#4F46E5',
                    50: '#EEF2FF',
                    100: '#E0E7FF',
                    200: '#C7D2FE',
                    300: '#A5B4FC',
                    400: '#6366F1',
                    500: '#4F46E5',
                    600: '#4338CA',
                    700: '#3730A3',
                    800: '#312E81',
                    900: '#1E1B4B',
                },
                success: {
                    DEFAULT: '#16A34A',
                    500: '#16A34A',
                    600: '#15803D',
                },
                danger: {
                    DEFAULT: '#DC2626',
                    500: '#DC2626',
                    600: '#B91C1C',
                },
                warning: {
                    DEFAULT: '#F59E0B',
                    500: '#F59E0B',
                    600: '#D97706',
                },
                background: {
                    DEFAULT: '#F9FAFB',
                    light: '#F3F4F6',
                },
                text: {
                    primary: '#111827',
                    secondary: '#6B7280',
                    muted: '#9CA3AF',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            fontSize: {
                'page-title': ['24px', { lineHeight: '32px' }],
                'section-title': ['18px', { lineHeight: '28px' }],
                body: ['14px', { lineHeight: '20px' }],
                small: ['12px', { lineHeight: '16px' }],
            },
            spacing: {
                '18': '18px',
                '24': '24px',
                '32': '32px',
            },
            borderRadius: {
                'lg': '12px',
                'md': '8px',
                'sm': '6px',
            },
            boxShadow: {
                'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            },
        },
    },
    plugins: [],
}
