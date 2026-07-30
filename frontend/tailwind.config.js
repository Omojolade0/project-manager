/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontSize: {
        caption: ["12px", { lineHeight: "16px", fontWeight: "500" }],
        small: ["13px", { lineHeight: "18px", fontWeight: "400" }],
        body: ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "card-title": ["15px", { lineHeight: "22px", fontWeight: "500" }],
        section: ["18px", { lineHeight: "26px", fontWeight: "600" }],
        "page-title": ["24px", { lineHeight: "32px", fontWeight: "600" }],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        status: {
          todo: {
            DEFAULT: "hsl(var(--status-todo))",
            tint: "hsl(var(--status-todo-tint))",
          },
          progress: {
            DEFAULT: "hsl(var(--status-progress))",
            tint: "hsl(var(--status-progress-tint))",
          },
          done: {
            DEFAULT: "hsl(var(--status-done))",
            tint: "hsl(var(--status-done-tint))",
          },
          overdue: {
            DEFAULT: "hsl(var(--status-overdue))",
            tint: "hsl(var(--status-overdue-tint))",
          },
          due: {
            DEFAULT: "hsl(var(--status-due))",
            tint: "hsl(var(--status-due-tint))",
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
