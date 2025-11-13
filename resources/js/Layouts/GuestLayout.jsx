import { Link, usePage } from '@inertiajs/react';
import { Sun } from 'lucide-react';
import { DynamicTheme } from '@/Components/DynamicTheme';

export default function GuestLayout({ children }) {
    const { props } = usePage();
    const settings = props.companySettings || {};
    const companyName = settings.company_name || 'GW Energytec';

    return (
        <>
            <DynamicTheme />
            <div className="flex min-h-screen flex-col items-center pt-6 sm:justify-center sm:pt-0" style={{ backgroundColor: 'var(--company-background)' }}>
                <div>
                    <Link href="/" className="flex flex-col items-center gap-3">
                        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--company-primary)' }}>
                            <Sun className="h-12 w-12" style={{ color: 'var(--company-text)' }} />
                        </div>
                        <span className="text-2xl font-bold" style={{ color: 'var(--company-text)' }}>
                            {companyName}
                        </span>
                    </Link>
                </div>

                <div className="mt-6 w-full overflow-hidden bg-white px-6 py-8 shadow-md sm:max-w-md sm:rounded-lg dark:bg-gray-800">
                    {children}
                </div>
            </div>
        </>
    );
}
