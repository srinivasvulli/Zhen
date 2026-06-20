import type { Config } from 'tailwindcss';
export default { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'], theme: { extend: { fontFamily: { sans: ['Arial', 'Helvetica', 'sans-serif'], display: ['Georgia', 'Times New Roman', 'serif'] } } }, plugins: [] } satisfies Config;
