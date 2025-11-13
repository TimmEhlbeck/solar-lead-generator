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
    }
    if (settings.secondary_color) {
      root.style.setProperty('--company-secondary', settings.secondary_color);
    }
    if (settings.accent_color) {
      root.style.setProperty('--company-accent', settings.accent_color);
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
