import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#0B0F14',        // page background
        surface: '#121821',     // panels
        'surface-raised': '#1A222E',
        gold: '#C9A227',        // known-world accent
        'gold-dim': '#8A701C',
        polar: '#4FD1FF',       // speculative accent
        'polar-dim': '#2E5F8A',
        parchment: '#E8E6DF',   // primary text
        muted: '#8A94A6',
        hairline: '#242C38',
      },
      fontFamily: {
        display: ['Spectral', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        'grid-known': 'linear-gradient(rgba(201,162,39,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,0.06) 1px, transparent 1px)',
        'grid-polar': 'linear-gradient(rgba(79,209,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(79,209,255,0.08) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '48px 48px',
      },
    },
  },
  plugins: [],
} satisfies Config;
