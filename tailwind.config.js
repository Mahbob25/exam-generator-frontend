/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "hsl(var(--background))", // Updated to use HSL variable wrapper usually needed for Shadcn/UI but here just var is fine if var has color
                // Wait, my globals.css defines vars as HSL values "0 0% 100%".
                // In my previous config I had `var(--background)`.
                // If var(--background) is "0 0% 100%", then `bg-background` -> `background-color: 0 0% 100%` which is invalid.
                // It needs `hsl(var(--background))`.
                // Ah! That might be the visual issue later, but maybe partially why build failed if it validates css? No, usually valid css.
                // But let's fix the colors to use `hsl(...)`.
                // My globals.css has: `--background: 0 0% 100%;` (no hsl wrapped).
                // So I must wrap them in hsl() in tailwind config.
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
            },
            fontFamily: {
                heading: ["var(--font-cairo)", "sans-serif"],
                body: ["var(--font-cairo)", "sans-serif"],
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [],
};
