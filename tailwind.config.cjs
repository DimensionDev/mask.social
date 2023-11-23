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
                main: 'rgb(var(--color-main) / <alpha-value>)',
                link: 'rgb(var(--color-link) / <alpha-value>)',
                primaryBottom: 'rgb(var(--color-bottom) / <alpha-value>)',
                // Because the secondary and bg color values are fixed alpha values in the design, the css variable is used directly.
                secondary: 'var(--color-second)',
                bg: 'var(--color-bg)',
                secondaryBottom: 'var(--color-bottom80)',
                primaryMain: 'var(--color-main1)',
                secondaryMain: 'var(--color-main2)',
                thirdMain: 'var(--color-main3)',
                third: 'var(--color-third)',
                input: 'var(--color-input)',
                line: 'var(--color-line)',
                lightMain: 'var(--color-light-main)',
                lightBg: 'var(--color-light-bg)',
                lightBottom80: 'var(--color-bottom80)',
                lightSecond: '#767F8D',
                lightLineSecond: '#E6E7E8',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
        },
        screens: {
            sm: '640px',
            md: '990px',
            lg: '1265px',
        },
    },
    plugins: [require('@tailwindcss/forms')],
};
