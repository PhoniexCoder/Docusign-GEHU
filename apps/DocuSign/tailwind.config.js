/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {}
  },
  plugins: [
    require("daisyui"),
    function ({ addUtilities, addVariant }) {
      // ✅ Variants that match html[data-theme="..."] (or any ancestor with data-theme)
      addVariant("docusigncss", '[data-theme="docusigncss"] &');
      addVariant("docusigndark", '[data-theme="docusigndark"] &');

      addUtilities({
        // Prevent iOS long-press popup
        ".touch-callout-none": {
          "-webkit-touch-callout": "none"
        },
        // VS Code-style disabled button for all themes
        ".op-btn-vscode-disabled": {
          "background-color": "#3C3C3C !important",
          color: "#CCCCCC !important",
          "border-color": "#565656 !important",
          cursor: "not-allowed !important",
          opacity: "1 !important",
          "&:hover": {
            "background-color": "#3C3C3C !important",
            color: "#CCCCCC !important",
            "border-color": "#565656 !important",
            transform: "none !important"
          }
        },
        // Dark mode icon improvements using DaisyUI theme detection
        '[data-theme="docusigndark"] .icon-improved': {
          color: "#CCCCCC !important"
        },
        '[data-theme="docusigndark"] .icon-muted': {
          color: "#999999 !important"
        },
        '[data-theme="docusigndark"] .icon-disabled': {
          color: "#858585 !important"
        },
        // Gray text improvements for dark mode
        '[data-theme="docusigndark"] .text-gray-500': {
          color: "#CCCCCC !important"
        },
        '[data-theme="docusigndark"] .text-gray-400': {
          color: "#999999 !important"
        },
        '[data-theme="docusigndark"] .text-gray-600': {
          color: "#CCCCCC !important"
        },
        // CSS variable utilities that work with arbitrary values
        ".icon-themed": {
          color: "var(--icon-color)"
        },
        ".icon-themed-muted": {
          color: "var(--icon-color-muted)"
        },
        ".icon-themed-disabled": {
          color: "var(--icon-color-disabled)"
        },
        ".btn-themed-disabled": {
          "background-color": "var(--btn-disabled-bg)",
          color: "var(--btn-disabled-color)",
          "border-color": "var(--btn-disabled-border)",
          cursor: "not-allowed",
          "&:hover": {
            "background-color": "var(--btn-disabled-bg)",
            color: "var(--btn-disabled-color)",
            "border-color": "var(--btn-disabled-border)",
            transform: "none"
          }
        }
      });
    }
  ],
  daisyui: {
    // themes: true,
    themes: [
      {
        docusigndark: {
          primary: "#6366f1", // Indigo 500 - Modern & Vibrant
          "primary-content": "#ffffff",

          secondary: "#1e293b", // Slate 800
          "secondary-content": "#f8fafc",

          accent: "#38bdf8", // Sky 400
          "accent-content": "#0f172a",

          neutral: "#334155", // Slate 700
          "neutral-content": "#cbd5e1",

          "base-100": "#0f172a", // Slate 900 - Rich dark bg
          "base-200": "#1e293b", // Slate 800 - Cards
          "base-300": "#334155", // Slate 700 - Inputs/Hover
          "base-content": "#f1f5f9", // Slate 100

          info: "#3b82f6",
          success: "#22c55e",
          warning: "#eab308",
          error: "#ef4444",

          "--rounded-box": "1rem",
          "--rounded-btn": "0.75rem",
          "--rounded-badge": "1.9rem",
          "--tab-radius": "0.5rem",

          // Custom CSS variables for icon and button states
          "--icon-color": "#cbd5e1",
          "--icon-color-muted": "#94a3b8",
          "--icon-color-disabled": "#64748b",
          "--btn-disabled-bg": "#334155",
          "--btn-disabled-color": "#94a3b8",
          "--btn-disabled-border": "#475569",
        }
      },
      {
        docusigncss: {
          primary: "#4f46e5", // Indigo 600 - Professional & Cool
          "primary-content": "#ffffff",

          secondary: "#f1f5f9", // Slate 100
          "secondary-content": "#0f172a", // Slate 900

          accent: "#0ea5e9", // Sky 500
          "accent-content": "#ffffff",

          neutral: "#e2e8f0", // Slate 200
          "neutral-content": "#1e293b",

          "base-100": "#ffffff", // Pure white
          "base-200": "#f8fafc", // Slate 50 - Very subtle off-white
          "base-300": "#e2e8f0", // Slate 200 - Borders/Inputs
          "base-content": "#0f172a", // Slate 900 - High contrast text

          info: "#0ea5e9",
          "info-content": "#ffffff",

          success: "#10b981",
          "success-content": "#ffffff",

          warning: "#f59e0b",
          "warning-content": "#ffffff",

          error: "#f43f5e",
          "error-content": "#ffffff",

          "--rounded-box": "1rem",
          "--rounded-btn": "0.75rem",
          "--rounded-badge": "1.9rem",
          "--tab-radius": "0.5rem",
        }
      }
    ],
    prefix: "op-"
  }
};
