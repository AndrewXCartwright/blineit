import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        bull: {
          DEFAULT: "hsl(var(--bull))",
          foreground: "hsl(var(--bull-foreground))",
        },
        bear: {
          DEFAULT: "hsl(var(--bear))",
          foreground: "hsl(var(--bear-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
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
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(10px)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px hsla(288, 52%, 36%, 0.3)" },
          "50%": { boxShadow: "0 0 40px hsla(288, 52%, 36%, 0.6)" },
        },
        "pulse-glow-bull": {
          "0%, 100%": { boxShadow: "0 0 15px hsla(160, 84%, 28%, 0.3)" },
          "50%": { boxShadow: "0 0 30px hsla(160, 84%, 28%, 0.6)" },
        },
        "pulse-glow-bear": {
          "0%, 100%": { boxShadow: "0 0 15px hsla(0, 72%, 45%, 0.3)" },
          "50%": { boxShadow: "0 0 30px hsla(0, 72%, 45%, 0.6)" },
        },
        "pulse-glow-gold": {
          "0%, 100%": { boxShadow: "0 0 15px hsla(38, 91%, 55%, 0.3)" },
          "50%": { boxShadow: "0 0 30px hsla(38, 91%, 55%, 0.6)" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "check-draw": {
          "0%": { strokeDashoffset: "100" },
          "100%": { strokeDashoffset: "0" },
        },
        "circle-expand": {
          "0%": { transform: "scale(0)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "0" },
        },
        "flash-green": {
          "0%": { backgroundColor: "hsla(160, 84%, 39%, 0.3)" },
          "100%": { backgroundColor: "transparent" },
        },
        "flash-red": {
          "0%": { backgroundColor: "hsla(0, 84%, 60%, 0.3)" },
          "100%": { backgroundColor: "transparent" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        "trophy-shine": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "number-pop": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)" },
        },
        "press": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.97)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out forwards",
        "fade-out": "fade-out 0.3s ease-out forwards",
        "scale-in": "scale-in 0.2s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "pulse-glow-bull": "pulse-glow-bull 2s ease-in-out infinite",
        "pulse-glow-bear": "pulse-glow-bear 2s ease-in-out infinite",
        "pulse-glow-gold": "pulse-glow-gold 2s ease-in-out infinite",
        "bounce-in": "bounce-in 0.5s ease-out",
        "check-draw": "check-draw 0.4s ease-out forwards",
        "circle-expand": "circle-expand 0.6s ease-out forwards",
        "flash-green": "flash-green 0.5s ease-out forwards",
        "flash-red": "flash-red 0.5s ease-out forwards",
        "shimmer": "shimmer 2s linear infinite",
        "float": "float 3s ease-in-out infinite",
        "spin-slow": "spin-slow 3s linear infinite",
        "wiggle": "wiggle 0.5s ease-in-out",
        "trophy-shine": "trophy-shine 2s linear infinite",
        "number-pop": "number-pop 0.3s ease-out",
        "press": "press 0.15s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
