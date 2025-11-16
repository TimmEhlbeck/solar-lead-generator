import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

export const DynamicTheme = () => {
  const { props } = usePage<any>();
  const settings = props.companySettings || {};

  useEffect(() => {
    // Apply CSS variables to document root
    const root = document.documentElement;

    if (settings.primary_color) {
      root.style.setProperty('--company-primary', settings.primary_color);
      // Also update the Tailwind primary color for buttons and other components
      // Convert hex to HSL for Tailwind
      const hsl = hexToHSL(settings.primary_color);
      root.style.setProperty('--primary', hsl);
    }
    if (settings.secondary_color) {
      root.style.setProperty('--company-secondary', settings.secondary_color);
      const hsl = hexToHSL(settings.secondary_color);
      root.style.setProperty('--secondary', hsl);
    }
    if (settings.accent_color) {
      root.style.setProperty('--company-accent', settings.accent_color);
      const hsl = hexToHSL(settings.accent_color);
      root.style.setProperty('--accent', hsl);
    }
    if (settings.background_color) {
      root.style.setProperty('--company-background', settings.background_color);
    }
    if (settings.text_color) {
      root.style.setProperty('--company-text', settings.text_color);
    }
  }, [settings]);

  return null;
};

// Helper function to convert hex color to HSL format for Tailwind
function hexToHSL(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');

  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Find min and max values
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  // Convert to degrees and percentages
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  const lPercent = Math.round(l * 100);

  return `${h} ${s}% ${lPercent}%`;
}
