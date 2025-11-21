import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import DashboardLayout from '../../Layouts/DashboardLayout';
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
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Shield,
  User as UserIcon,
  Mail,
  Calendar,
  FolderOpen,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  is_admin: boolean;
  roles: string[];
  projects_count: number;
  created_at: string;
}

interface UserManagementProps {
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
      is_admin?: boolean;
    };
  };
  users: User[];
  roles: string[];
}

export default function UserManagement({ auth, users, roles }: UserManagementProps) {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'customer',
  });

  const handleCreate = () => {
    reset();
    setCreatingUser(true);
  };

  const handleEdit = (user: User) => {
    setData({
      name: user.name,
      email: user.email,
      password: '',
      password_confirmation: '',
      role: user.roles[0] || 'user',
    });
    setEditingUser(user);
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/users', {
      onSuccess: () => {
        setCreatingUser(false);
        reset();
      },
    });
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    put(`/admin/users/${editingUser.id}`, {
      onSuccess: () => {
        setEditingUser(null);
        reset();
      },
    });
  };

  const handleDelete = (user: User) => {
    if (confirm(`Möchten Sie den Benutzer "${user.name}" wirklich löschen?`)) {
      router.delete(`/admin/users/${user.id}`);
    }
  };

  const getRoleBadge = (user: User) => {
    const role = user.roles[0] || 'customer';

    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
          <Shield className="h-3 w-3" />
          Admin
        </span>
      );
    }

    if (role === 'sales') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          <UserIcon className="h-3 w-3" />
          Vertrieb
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
        <UserIcon className="h-3 w-3" />
        Kunde
      </span>
    );
  };

  return (
    <DashboardLayout auth={auth}>
      <Head title="Benutzerverwaltung" />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Benutzerverwaltung
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Verwalten Sie alle Benutzer und deren Rollen
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Neuer Benutzer
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Gesamt-Benutzer
            </CardTitle>
            <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {users.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Administratoren
            </CardTitle>
            <Shield className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {users.filter(u => u.roles.includes('admin')).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Verifizierte Benutzer
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {users.filter(u => u.email_verified_at).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Benutzer</CardTitle>
          <CardDescription>
            Übersicht aller registrierten Benutzer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Benutzer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Rolle
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Projekte
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Verifiziert
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Erstellt
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                          <UserIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                            {user.id === auth.user.id && (
                              <span className="ml-2 text-xs text-gray-500">(Sie)</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {getRoleBadge(user)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                        <FolderOpen className="h-4 w-4 text-gray-400" />
                        {user.projects_count}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {user.email_verified_at ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-xs text-gray-500">Verifiziert</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5 text-red-600" />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.post(route('admin.users.verify', user.id))}
                              className="ml-2"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Verifizieren
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {user.created_at}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(user)}
                          disabled={user.id === auth.user.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={creatingUser} onOpenChange={setCreatingUser}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmitCreate}>
            <DialogHeader>
              <DialogTitle>Neuen Benutzer erstellen</DialogTitle>
              <DialogDescription>
                Erstellen Sie einen neuen Benutzer mit Email und Passwort.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {errors && Object.keys(errors).length > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {Object.values(errors)[0]}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-2">
                <Label htmlFor="create-name">Name</Label>
                <Input
                  id="create-name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="create-email">Email</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="create-password">Passwort</Label>
                <Input
                  id="create-password"
                  type="password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="create-password-confirmation">Passwort bestätigen</Label>
                <Input
                  id="create-password-confirmation"
                  type="password"
                  value={data.password_confirmation}
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-role">Rolle</Label>
                <select
                  id="create-role"
                  value={data.role}
                  onChange={(e) => setData('role', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="customer">Kunde</option>
                  <option value="sales">Vertrieb</option>
                  <option value="admin">Administrator</option>
                </select>
                {errors.role && (
                  <p className="text-sm text-red-600">{errors.role}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreatingUser(false)}
                disabled={processing}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={processing}>
                {processing ? 'Erstelle...' : 'Erstellen'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmitEdit}>
            <DialogHeader>
              <DialogTitle>Benutzer bearbeiten</DialogTitle>
              <DialogDescription>
                Ändern Sie die Benutzerdaten. Lassen Sie das Passwort leer, um es nicht zu ändern.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {errors && Object.keys(errors).length > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {Object.values(errors)[0]}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-password">Neues Passwort (optional)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  placeholder="Leer lassen, um nicht zu ändern"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-password-confirmation">Passwort bestätigen</Label>
                <Input
                  id="edit-password-confirmation"
                  type="password"
                  value={data.password_confirmation}
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-role">Rolle</Label>
                <select
                  id="edit-role"
                  value={data.role}
                  onChange={(e) => setData('role', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="customer">Kunde</option>
                  <option value="sales">Vertrieb</option>
                  <option value="admin">Administrator</option>
                </select>
                {errors.role && (
                  <p className="text-sm text-red-600">{errors.role}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingUser(null)}
                disabled={processing}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={processing}>
                {processing ? 'Speichere...' : 'Speichern'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
