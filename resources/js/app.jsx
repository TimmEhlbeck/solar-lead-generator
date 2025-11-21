import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Handle CSRF token expiration
router.on('error', (event) => {
    if (event.detail.errors && event.detail.errors.message === 'CSRF token mismatch.') {
        window.location.reload();
    }
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: async (name) => {
        const pages = import.meta.glob('./Pages/**/*.{jsx,tsx}', { eager: true });
        const page = pages[`./Pages/${name}.tsx`] || pages[`./Pages/${name}.jsx`];
        return page.default || page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
