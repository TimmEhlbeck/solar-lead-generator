import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '../../components/ui/button';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Anmelden" />

            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Willkommen zurück
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Melden Sie sich bei Ihrem Konto an
                </p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="E-Mail-Adresse" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Passwort" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                            Angemeldet bleiben
                        </span>
                    </label>
                </div>

                <div className="mt-6">
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={processing}
                        style={{ backgroundColor: 'var(--company-primary)', color: 'var(--company-text)' }}
                    >
                        {processing ? 'Wird angemeldet...' : 'Anmelden'}
                    </Button>
                </div>

                <div className="mt-4 flex flex-col gap-3 text-center text-sm">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-gray-600 underline hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            Passwort vergessen?
                        </Link>
                    )}

                    <div className="text-gray-600 dark:text-gray-400">
                        Noch kein Konto?{' '}
                        <Link
                            href={route('register')}
                            className="font-medium underline hover:text-gray-900 dark:hover:text-gray-200"
                            style={{ color: 'var(--company-primary)' }}
                        >
                            Jetzt registrieren
                        </Link>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
