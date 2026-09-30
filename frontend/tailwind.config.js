/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bank: {
          primary: '#003366',       // Deep banking navy blue (HDFC/ICICI institutional feel)
          primaryDark: '#002244',   // Darker shade for active/hover states
          primaryLight: '#004b93',  // Slightly brighter banking blue
          accent: '#1d4ed8',        // Vibrant action blue
          navy: '#0f2942',
          slate: '#f8fafc',         // App background
          surface: '#ffffff',       // Card & component surfaces
          border: '#e2e8f0',        // Clean slate borders
          borderLight: '#f1f5f9',
          success: '#059669',       // Credit / verified
          danger: '#dc2626',        // Debit / error / blocked
          warning: '#d97706',       // Pending / due
          text: {
            primary: '#0f172a',     // Slate 900
            secondary: '#475569',   // Slate 600
            muted: '#94a3b8',       // Slate 400
          }
        }
      },
      boxShadow: {
        'bank-sm': '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        'bank-card': '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.08)',
        'bank-hover': '0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -2px rgba(15, 23, 42, 0.1)',
      }
    },
  },
  plugins: [],
}
