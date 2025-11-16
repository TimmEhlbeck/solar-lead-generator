import React, { useState, FormEvent } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Settings as SettingsIcon, Upload, X, Save, Palette, Building2, Mail } from 'lucide-react';
import { Textarea } from '@/Components/ui/textarea';

interface SettingsPageProps {
  auth: {
    user: {
      name: string;
      email: string;
      roles: Array<{ name: string }>;
    };
  };
  settings: Record<string, string>;
}

export default function Settings({ auth, settings }: SettingsPageProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(
    settings.company_logo_url || null
  );
  const [faviconPreview, setFaviconPreview] = useState<string | null>(
    settings.company_favicon_url || null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data, setData, post, processing, errors } = useForm({
    company_name: settings.company_name || '',
    company_logo: null as File | null,
    company_favicon: null as File | null,
    primary_color: settings.primary_color || '#EAB308',
    secondary_color: settings.secondary_color || '#1F2937',
    accent_color: settings.accent_color || '#3B82F6',
    background_color: settings.background_color || '#111827',
    text_color: settings.text_color || '#FFFFFF',
    email_header_title: settings.email_header_title || 'Willkommen',
    email_footer_text: settings.email_footer_text || 'Ihr Partner für nachhaltige Energie',
    email_footer_contact: settings.email_footer_contact || '',
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('company_logo', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('company_favicon', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteLogo = () => {
    router.delete(route('admin.settings.deleteLogo'), {
      onSuccess: () => {
        setLogoPreview(null);
        setData('company_logo', null);
        setSuccessMessage('Logo erfolgreich gelöscht');
        setTimeout(() => setSuccessMessage(null), 3000);
      },
    });
  };

  const handleDeleteFavicon = () => {
    router.delete(route('admin.settings.deleteFavicon'), {
      onSuccess: () => {
        setFaviconPreview(null);
        setData('company_favicon', null);
        setSuccessMessage('Favicon erfolgreich gelöscht');
        setTimeout(() => setSuccessMessage(null), 3000);
      },
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    post(route('admin.settings.update'), {
      forceFormData: true,
      onSuccess: () => {
        setSuccessMessage('Einstellungen erfolgreich gespeichert');
        setTimeout(() => setSuccessMessage(null), 3000);
      },
    });
  };

  return (
    <DashboardLayout
      auth={auth}
      header={
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight flex items-center gap-2">
            <SettingsIcon className="h-6 w-6" />
            Firmen-Einstellungen
          </h2>
        </div>
      }
    >
      <Head title="Einstellungen" />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          {successMessage && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Branding */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Firmenbranding
                </CardTitle>
                <CardDescription>
                  Passen Sie den Firmennamen und das Logo an
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Firmenname</Label>
                  <Input
                    id="company_name"
                    type="text"
                    value={data.company_name}
                    onChange={(e) => setData('company_name', e.target.value)}
                    placeholder="z.B. Solar Lead Generator"
                  />
                  {errors.company_name && (
                    <p className="text-sm text-red-600">{errors.company_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_logo">Firmenlogo</Label>
                  <div className="flex items-start gap-4">
                    {logoPreview && (
                      <div className="relative">
                        <img
                          src={logoPreview}
                          alt="Logo Vorschau"
                          className="h-24 w-24 object-contain border rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={handleDeleteLogo}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        id="company_logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="cursor-pointer"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Maximale Dateigröße: 2MB. Unterstützte Formate: JPG, PNG, SVG
                      </p>
                      {errors.company_logo && (
                        <p className="text-sm text-red-600">{errors.company_logo}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_favicon">Favicon</Label>
                  <div className="flex items-start gap-4">
                    {faviconPreview && (
                      <div className="relative">
                        <img
                          src={faviconPreview}
                          alt="Favicon Vorschau"
                          className="h-16 w-16 object-contain border rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={handleDeleteFavicon}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        id="company_favicon"
                        type="file"
                        accept="image/x-icon,image/png,image/svg+xml"
                        onChange={handleFaviconChange}
                        className="cursor-pointer"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Maximale Dateigröße: 1MB. Unterstützte Formate: ICO, PNG (empfohlen: 32x32px oder 64x64px)
                      </p>
                      {errors.company_favicon && (
                        <p className="text-sm text-red-600">{errors.company_favicon}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  E-Mail-Einstellungen
                </CardTitle>
                <CardDescription>
                  Globale Einstellungen für E-Mail-Header und Footer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email_header_title">E-Mail Header Überschrift</Label>
                  <Input
                    id="email_header_title"
                    type="text"
                    value={data.email_header_title}
                    onChange={(e) => setData('email_header_title', e.target.value)}
                    placeholder="z.B. Willkommen"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Die Standard-Überschrift im Header aller E-Mails. Kann in einzelnen Templates überschrieben werden.
                  </p>
                  {errors.email_header_title && (
                    <p className="text-sm text-red-600">{errors.email_header_title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email_footer_text">E-Mail Footer Text</Label>
                  <Input
                    id="email_footer_text"
                    type="text"
                    value={data.email_footer_text}
                    onChange={(e) => setData('email_footer_text', e.target.value)}
                    placeholder="z.B. Ihr Partner für nachhaltige Energie"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Der Text, der in der Fußzeile aller E-Mails angezeigt wird.
                  </p>
                  {errors.email_footer_text && (
                    <p className="text-sm text-red-600">{errors.email_footer_text}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email_footer_contact">Kontaktinformationen (Footer)</Label>
                  <Textarea
                    id="email_footer_contact"
                    value={data.email_footer_contact}
                    onChange={(e) => setData('email_footer_contact', e.target.value)}
                    placeholder="z.B. Adresse, Telefon, E-Mail"
                    rows={3}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Optionale Kontaktinformationen für den E-Mail-Footer (z.B. Adresse, Telefon, E-Mail).
                  </p>
                  {errors.email_footer_contact && (
                    <p className="text-sm text-red-600">{errors.email_footer_contact}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Color Scheme */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Farbschema
                </CardTitle>
                <CardDescription>
                  Passen Sie die Farben der Anwendung an Ihr Corporate Design an
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Primärfarbe</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary_color"
                        type="color"
                        value={data.primary_color}
                        onChange={(e) => setData('primary_color', e.target.value)}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={data.primary_color}
                        onChange={(e) => setData('primary_color', e.target.value)}
                        placeholder="#EAB308"
                        className="flex-1"
                      />
                    </div>
                    {errors.primary_color && (
                      <p className="text-sm text-red-600">{errors.primary_color}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondary_color">Sekundärfarbe</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondary_color"
                        type="color"
                        value={data.secondary_color}
                        onChange={(e) => setData('secondary_color', e.target.value)}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={data.secondary_color}
                        onChange={(e) => setData('secondary_color', e.target.value)}
                        placeholder="#1F2937"
                        className="flex-1"
                      />
                    </div>
                    {errors.secondary_color && (
                      <p className="text-sm text-red-600">{errors.secondary_color}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accent_color">Akzentfarbe</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accent_color"
                        type="color"
                        value={data.accent_color}
                        onChange={(e) => setData('accent_color', e.target.value)}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={data.accent_color}
                        onChange={(e) => setData('accent_color', e.target.value)}
                        placeholder="#3B82F6"
                        className="flex-1"
                      />
                    </div>
                    {errors.accent_color && (
                      <p className="text-sm text-red-600">{errors.accent_color}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="background_color">Hintergrundfarbe</Label>
                    <div className="flex gap-2">
                      <Input
                        id="background_color"
                        type="color"
                        value={data.background_color}
                        onChange={(e) => setData('background_color', e.target.value)}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={data.background_color}
                        onChange={(e) => setData('background_color', e.target.value)}
                        placeholder="#111827"
                        className="flex-1"
                      />
                    </div>
                    {errors.background_color && (
                      <p className="text-sm text-red-600">{errors.background_color}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="text_color">Textfarbe</Label>
                    <div className="flex gap-2">
                      <Input
                        id="text_color"
                        type="color"
                        value={data.text_color}
                        onChange={(e) => setData('text_color', e.target.value)}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={data.text_color}
                        onChange={(e) => setData('text_color', e.target.value)}
                        placeholder="#FFFFFF"
                        className="flex-1"
                      />
                    </div>
                    {errors.text_color && (
                      <p className="text-sm text-red-600">{errors.text_color}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                  <p className="text-sm font-medium mb-3">Farbvorschau:</p>
                  <div className="flex gap-2 flex-wrap">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className="w-16 h-16 rounded border"
                        style={{ backgroundColor: data.primary_color }}
                      />
                      <span className="text-xs">Primär</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className="w-16 h-16 rounded border"
                        style={{ backgroundColor: data.secondary_color }}
                      />
                      <span className="text-xs">Sekundär</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className="w-16 h-16 rounded border"
                        style={{ backgroundColor: data.accent_color }}
                      />
                      <span className="text-xs">Akzent</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className="w-16 h-16 rounded border"
                        style={{ backgroundColor: data.background_color }}
                      />
                      <span className="text-xs">Hintergrund</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className="w-16 h-16 rounded border"
                        style={{ backgroundColor: data.text_color }}
                      />
                      <span className="text-xs">Text</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button type="submit" disabled={processing} className="gap-2">
                <Save className="h-4 w-4" />
                {processing ? 'Speichere...' : 'Einstellungen speichern'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
