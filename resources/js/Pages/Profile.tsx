import React, { FormEvent, useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '../Layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import { User, Lock, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

interface ProfileProps {
  auth: {
    user: {
      name: string;
      email: string;
      is_admin?: boolean;
      roles?: string[];
    };
  };
  mustVerifyEmail?: boolean;
  status?: string;
}

export default function Profile({ auth, mustVerifyEmail, status }: ProfileProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const profileForm = useForm({
    name: auth.user.name,
    email: auth.user.email,
  });

  const passwordForm = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const handleProfileUpdate = (e: FormEvent) => {
    e.preventDefault();
    profileForm.put('/profile', {
      preserveScroll: true,
      onSuccess: () => {
        setSuccessMessage('Profil erfolgreich aktualisiert');
        setTimeout(() => setSuccessMessage(''), 3000);
      },
    });
  };

  const handlePasswordUpdate = (e: FormEvent) => {
    e.preventDefault();
    passwordForm.put('/profile/password', {
      preserveScroll: true,
      onSuccess: () => {
        passwordForm.reset();
        setSuccessMessage('Passwort erfolgreich geändert');
        setTimeout(() => setSuccessMessage(''), 3000);
      },
    });
  };

  const handleDeleteAccount = () => {
    router.delete('/profile', {
      data: { password: deletePassword },
      onFinish: () => {
        setDeletePassword('');
        setShowDeleteDialog(false);
      },
    });
  };

  return (
    <DashboardLayout auth={auth}>
      <Head title="Profil" />

      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Profil-Einstellungen
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Verwalten Sie Ihre persönlichen Informationen und Sicherheitseinstellungen
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" style={{ color: 'var(--company-primary)' }} />
              <CardTitle>Profil-Informationen</CardTitle>
            </div>
            <CardDescription>
              Aktualisieren Sie Ihren Namen und Ihre E-Mail-Adresse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={profileForm.data.name}
                  onChange={(e) => profileForm.setData('name', e.target.value)}
                  required
                />
                {profileForm.errors.name && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {profileForm.errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileForm.data.email}
                  onChange={(e) => profileForm.setData('email', e.target.value)}
                  required
                />
                {profileForm.errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {profileForm.errors.email}
                  </p>
                )}
              </div>

              {mustVerifyEmail && auth.user.email && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Ihre E-Mail-Adresse ist nicht verifiziert.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={profileForm.processing}
                  style={{ backgroundColor: 'var(--company-primary)', color: 'var(--company-text)' }}
                >
                  {profileForm.processing ? 'Wird gespeichert...' : 'Speichern'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Password Update */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" style={{ color: 'var(--company-primary)' }} />
              <CardTitle>Passwort ändern</CardTitle>
            </div>
            <CardDescription>
              Stellen Sie sicher, dass Ihr Konto ein sicheres Passwort verwendet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Aktuelles Passwort</Label>
                <Input
                  id="current_password"
                  type="password"
                  value={passwordForm.data.current_password}
                  onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                  required
                />
                {passwordForm.errors.current_password && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {passwordForm.errors.current_password}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Neues Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  value={passwordForm.data.password}
                  onChange={(e) => passwordForm.setData('password', e.target.value)}
                  required
                />
                {passwordForm.errors.password && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {passwordForm.errors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation">Passwort bestätigen</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  value={passwordForm.data.password_confirmation}
                  onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={passwordForm.processing}
                  style={{ backgroundColor: 'var(--company-primary)', color: 'var(--company-text)' }}
                >
                  {passwordForm.processing ? 'Wird aktualisiert...' : 'Passwort aktualisieren'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Delete Account */}
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-600 dark:text-red-400">
                Konto löschen
              </CardTitle>
            </div>
            <CardDescription>
              Löschen Sie Ihr Konto dauerhaft. Diese Aktion kann nicht rückgängig gemacht werden.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              Konto löschen
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sind Sie sicher?</DialogTitle>
            <DialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Alle Ihre Daten werden
              dauerhaft gelöscht. Bitte geben Sie Ihr Passwort ein, um fortzufahren.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="delete_password">Passwort</Label>
              <Input
                id="delete_password"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Geben Sie Ihr Passwort ein"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeletePassword('');
              }}
            >
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={!deletePassword}
            >
              Konto löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
