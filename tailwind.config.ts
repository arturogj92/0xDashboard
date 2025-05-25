import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Theme colors
    'from-white', 'to-gray-50', 'from-indigo-50', 'via-white', 'to-purple-50', 'from-pink-100', 'via-purple-50', 'to-indigo-100', 'from-gray-900', 'to-black', 'from-green-50', 'to-emerald-50',
    'bg-white', 'bg-gray-50', 'bg-gray-100', 'bg-gray-700', 'bg-gray-800', 'bg-black', 'bg-blue-600', 'bg-blue-700', 'bg-green-50', 'bg-green-100', 'bg-green-600', 'bg-green-700', 'bg-purple-100',
    'text-gray-900', 'text-gray-700', 'text-gray-600', 'text-gray-500', 'text-gray-400', 'text-gray-200', 'text-white', 'text-gray-800',
    'border-gray-200', 'border-gray-600', 'border-gray-700', 'border-indigo-200', 'border-purple-200', 'border-purple-300', 'border-green-200', 'border-green-300',
    // Typography
    'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl',
    'font-normal', 'font-medium', 'font-semibold', 'font-bold',
    // Layout
    'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'rounded-full',
    'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl',
    'max-w-sm', 'max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-2xl',
    'px-4', 'px-6', 'px-8', 'py-4', 'py-6', 'py-8', 'p-4', 'p-5', 'p-6',
    'space-y-4', 'space-y-6', 'space-y-8',
    // Gradients and special effects
    'bg-gradient-to-r', 'bg-gradient-to-br', 'from-indigo-600', 'to-purple-600', 'from-indigo-700', 'to-purple-700',
    'from-pink-500', 'to-purple-600', 'from-pink-600', 'to-purple-700', 'from-indigo-500', 'to-purple-500',
    'backdrop-blur-sm', 'bg-white/80', 'bg-white/90', 'bg-gray-800/50', 'bg-gray-800/80',
    // Shadow colors
    'shadow-indigo-500/10', 'shadow-indigo-500/20', 'shadow-indigo-500/25', 'shadow-purple-500/20', 'shadow-purple-500/30', 'shadow-pink-500/30', 'shadow-green-500/10', 'shadow-green-500/15', 'shadow-green-500/20', 'shadow-black/50', 'shadow-black/60'
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    fontFamily: {
        sans: ['var(--font-dm-sans)', 'sans-serif'],
    },
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("@tailwindcss/container-queries"), // <= plugin oficial (opcional en 3.3+)
  ],
} satisfies Config;
