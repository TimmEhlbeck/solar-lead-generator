import React, { useState } from 'react';
import { Mail, Phone, User, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface ContactFormProps {
  onSubmit?: (formData: ContactFormData) => void;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  request_type: 'quote' | 'consultation';
}

export const ContactForm: React.FC<ContactFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
    request_type: 'quote',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Call the API
      await axios.post('/api/leads', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        request_type: formData.request_type,
        source: 'website'
      });

      setSuccess(true);

      // Call parent onSubmit if provided
      if (onSubmit) {
        onSubmit(formData);
      }

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        request_type: 'quote',
      });

    } catch (err: any) {
      console.error('Error submitting form:', err);
      setError(err.response?.data?.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
              Vielen Dank!
            </h3>
            <p className="text-green-700 dark:text-green-300 mb-4">
              Ihre Anfrage wurde erfolgreich übermittelt. Wir werden uns in Kürze bei Ihnen melden.
            </p>
            <Button
              onClick={() => setSuccess(false)}
              variant="outline"
              className="mt-2"
            >
              Weitere Anfrage senden
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Kostenloses Angebot anfordern
        </CardTitle>
        <CardDescription>
          Füllen Sie das Formular aus und erhalten Sie ein unverbindliches Angebot oder eine persönliche Beratung.
        </CardDescription>
      </CardHeader>
      <CardContent>
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

          <Button
            type="submit"
            className="w-full"
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
                Anfrage senden
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Mit dem Absenden stimmen Sie der Verarbeitung Ihrer Daten zur Kontaktaufnahme zu.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
