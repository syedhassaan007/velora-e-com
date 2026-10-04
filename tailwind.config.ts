import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { colors: {
    ink: "#0f0d0b", surface: "#1a1613", line: "#2e2823",
    ember: "#ff7a59", lichen: "#b7c98b", bone: "#f3ece4",
  }, fontFamily: { sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"] } } },
  plugins: [],
} satisfies Config;
