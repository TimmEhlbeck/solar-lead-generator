import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Mail, Phone, User, MessageSquare, Send, CheckCircle, UserPlus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface LandingContactFormProps {
  onSubmit?: (formData: LandingContactFormData) => void;
  projectData?: any; // The solar planning data from session
}

export interface LandingContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  request_type: 'quote' | 'consultation';
  create_account: boolean;
}

export const LandingContactForm: React.FC<LandingContactFormProps> = ({ onSubmit, projectData }) => {
  const [formData, setFormData] = useState<LandingContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
    request_type: 'quote',
    create_account: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Submit to the landing page controller
      router.post('/solar-planer/submit', {
        ...formData,
        project_data: projectData,
      }, {
        onSuccess: () => {
          // Will redirect to thank you page
          if (onSubmit) {
            onSubmit(formData);
          }
        },
        onError: (errors) => {
          console.error('Error submitting form:', errors);
          setError(errors.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
          setLoading(false);
        },
      });
    } catch (err: any) {
      console.error('Error submitting form:', err);
      setError(err.response?.data?.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, create_account: checked }));
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <CheckCircle className="h-6 w-6 text-green-600" />
          Fast geschafft!
        </CardTitle>
        <CardDescription className="text-base">
          Ihre Solar-Planung ist fertig. Hinterlassen Sie Ihre Kontaktdaten, damit wir Ihnen ein unverbindliches Angebot erstellen können.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Fehler</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="request_type">Ich interessiere mich für</Label>
            <select
              id="request_type"
              name="request_type"
              value={formData.request_type}
              onChange={handleChange}
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="quote">Kostenloses Angebot</option>
              <option value="consultation">Persönliche Beratung</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              <User className="inline h-4 w-4 mr-1" />
              Vollständiger Name *
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Max Mustermann"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              <Mail className="inline h-4 w-4 mr-1" />
              E-Mail-Adresse *
            </Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="max.mustermann@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              <Phone className="inline h-4 w-4 mr-1" />
              Telefonnummer (optional)
            </Label>
            <Input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+49 123 456789"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">
              <MessageSquare className="inline h-4 w-4 mr-1" />
              Nachricht (optional)
            </Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={3}
              placeholder="Haben Sie spezielle Fragen oder Anmerkungen?"
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <Checkbox
                id="create_account"
                checked={formData.create_account}
                onCheckedChange={handleCheckboxChange}
                className="mt-1"
              />
              <div className="flex-1">
                <Label
                  htmlFor="create_account"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  <UserPlus className="inline h-4 w-4 mr-1 text-blue-600 dark:text-blue-400" />
                  Benutzerkonto erstellen und Zugriff auf mein Projekt erhalten
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Sie erhalten per E-Mail Ihre Zugangsdaten und können Ihr Projekt jederzeit einsehen und bearbeiten.
                </p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Wird gesendet...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Anfrage absenden
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Mit dem Absenden stimmen Sie der Verarbeitung Ihrer Daten zur Kontaktaufnahme zu.
            {formData.create_account && ' Es wird automatisch ein Benutzerkonto für Sie erstellt.'}
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
