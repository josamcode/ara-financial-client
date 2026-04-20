/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "2rem",
        "2xl": "2.5rem",
      },
      screens: {
        sm: "100%",
        md: "100%",
        lg: "1200px",
        xl: "1280px",
        "2xl": "1440px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Tajawal", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        arabic: ["Tajawal", "ui-sans-serif", "system-ui", "sans-serif"],
        english: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },

      colors: {
        transparent: "transparent",
        current: "currentColor",

        primary: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          DEFAULT: "#15803d",
          foreground: "#ffffff",
        },

        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },

        background: "#f9fafb",
        foreground: "#111827",

        surface: {
          DEFAULT: "#ffffff",
          muted: "#f3f4f6",
          subtle: "#f9fafb",
          elevated: "#ffffff",
        },

        border: "#e5e7eb",
        input: "#e5e7eb",
        ring: "#15803d",

        text: {
          primary: "#111827",
          secondary: "#6b7280",
          muted: "#9ca3af",
          inverse: "#ffffff",
        },

        success: {
          DEFAULT: "#16a34a",
          foreground: "#ffffff",
          soft: "#dcfce7",
        },

        warning: {
          DEFAULT: "#f59e0b",
          foreground: "#111827",
          soft: "#fef3c7",
        },

        error: {
          DEFAULT: "#dc2626",
          foreground: "#ffffff",
          soft: "#fee2e2",
        },

        info: {
          DEFAULT: "#2563eb",
          foreground: "#ffffff",
          soft: "#dbeafe",
        },
      },

      spacing: {
        4.5: "1.125rem",
        5.5: "1.375rem",
        6.5: "1.625rem",
        7.5: "1.875rem",
        8.5: "2.125rem",
        9.5: "2.375rem",
        18: "4.5rem",
        22: "5.5rem",
        26: "6.5rem",
        30: "7.5rem",
        34: "8.5rem",
        38: "9.5rem",
      },

      borderRadius: {
        xs: "0.375rem",
        sm: "0.5rem",
        md: "0.625rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },

      boxShadow: {
        soft: "0 1px 2px rgba(17, 24, 39, 0.04), 0 1px 3px rgba(17, 24, 39, 0.08)",
        card: "0 1px 2px rgba(17, 24, 39, 0.04), 0 4px 10px rgba(17, 24, 39, 0.06)",
        elevated:
          "0 4px 12px rgba(17, 24, 39, 0.08), 0 10px 24px rgba(17, 24, 39, 0.08)",
        dropdown:
          "0 8px 24px rgba(17, 24, 39, 0.10), 0 2px 8px rgba(17, 24, 39, 0.06)",
        focus: "0 0 0 4px rgba(21, 128, 61, 0.14)",
        none: "none",
      },

      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.4", fontWeight: "400" }],
        sm: ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
        base: ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        lg: ["1.125rem", { lineHeight: "1.6", fontWeight: "400" }],
        xl: ["1.25rem", { lineHeight: "1.5", fontWeight: "600" }],
        "2xl": ["1.5rem", { lineHeight: "1.4", fontWeight: "700" }],
        "3xl": ["1.75rem", { lineHeight: "1.3", fontWeight: "700" }],
        "4xl": ["2.25rem", { lineHeight: "1.2", fontWeight: "700" }],
        "5xl": ["3rem", { lineHeight: "1.1", fontWeight: "700" }],
      },

      lineHeight: {
        tight: "1.2",
        snug: "1.35",
        normal: "1.5",
        relaxed: "1.7",
      },

      letterSpacing: {
        tight: "-0.02em",
        normal: "0",
        wide: "0.02em",
      },

      screens: {
        xs: "480px",
        "3xl": "1600px",
      },

      maxWidth: {
        content: "720px",
        reading: "800px",
        layout: "1200px",
        wide: "1440px",
      },

      minHeight: {
        input: "48px",
        button: "48px",
      },

      height: {
        input: "48px",
        button: "48px",
        "button-sm": "40px",
        "button-lg": "56px",
      },

      zIndex: {
        1: "1",
        5: "5",
        60: "60",
        70: "70",
      },

      transitionDuration: {
        250: "250ms",
        400: "400ms",
      },

      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      backgroundImage: {
        "gradient-primary":
          "linear-gradient(135deg, rgba(21,128,61,1) 0%, rgba(22,101,52,1) 100%)",
        "gradient-soft":
          "linear-gradient(180deg, rgba(249,250,251,1) 0%, rgba(243,244,246,1) 100%)",
      },

      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
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
        "fade-in": "fade-in 0.25s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "accordion-down": "accordion-down 0.25s ease-out",
        "accordion-up": "accordion-up 0.25s ease-out",
      },
    },
  },
  plugins: [],
};