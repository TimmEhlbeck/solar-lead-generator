import React, { useState, FormEvent, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Mail, Save, Eye, Code, Type, FileText } from 'lucide-react';
import { Textarea } from '@/Components/ui/textarea';

interface EmailTemplate {
  id: number;
  key: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface EmailTemplatesPageProps {
  auth: {
    user: {
      name: string;
      email: string;
      roles: Array<{ name: string }>;
    };
  };
  templates: EmailTemplate[];
}

// Extract text content from HTML for easier editing
const extractTextBlocks = (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Extract header title
  const headerTitle = doc.querySelector('.header h1')?.textContent || '';

  // Extract greeting and main text paragraphs
  const contentDiv = doc.querySelector('.content');
  const paragraphs = contentDiv ? Array.from(contentDiv.querySelectorAll('p')).map(p => p.textContent || '') : [];

  return {
    headerTitle,
    greeting: paragraphs[0] || '',
    paragraphs: paragraphs.slice(1) || []
  };
};

export default function EmailTemplates({ auth, templates }: EmailTemplatesPageProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(
    templates.length > 0 ? templates[0] : null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showHTMLEditor, setShowHTMLEditor] = useState(false);

  const { data, setData, put, processing, errors } = useForm({
    subject: selectedTemplate?.subject || '',
    content: selectedTemplate?.content || '',
  });

  // Update form when template selection changes
  useEffect(() => {
    if (selectedTemplate) {
      setData({
        subject: selectedTemplate.subject,
        content: selectedTemplate.content,
      });
      setShowPreview(false);
      setPreviewHtml(null);
    }
  }, [selectedTemplate]);

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowHTMLEditor(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    put(route('admin.email-templates.update', selectedTemplate.id), {
      onSuccess: () => {
        setSuccessMessage('Email-Template erfolgreich gespeichert');
        setTimeout(() => setSuccessMessage(null), 3000);
        // Reload templates
        router.reload({ only: ['templates'] });
      },
    });
  };

  const handlePreview = async () => {
    if (!selectedTemplate) return;

    // Create sample data based on template key
    let sampleData: Record<string, any> = {
      company_name: 'GW Energytec',
      primary_color: '#EAB308',
      secondary_color: '#1F2937',
      app_url: window.location.origin,
    };

    if (selectedTemplate.key === 'welcome_user') {
      sampleData = {
        ...sampleData,
        name: 'Max Mustermann',
        email: 'max@beispiel.de',
        password: 'TempPass123',
        project_name: 'Mein Solar-Projekt',
      };
    } else if (selectedTemplate.key === 'lead_assigned') {
      sampleData = {
        ...sampleData,
        salesperson: {
          name: 'Anna Schmidt',
          email: 'anna@beispiel.de',
        },
        lead: {
          name: 'Thomas Becker',
          email: 'thomas@beispiel.de',
          phone: '+49 123 456789',
          request_type: 'Angebot',
          message: 'Ich interessiere mich für eine Solaranlage.',
          source: 'Website',
        },
      };
    }

    try {
      const response = await fetch(
        route('admin.email-templates.preview', selectedTemplate.id),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
          body: JSON.stringify({ data: sampleData, subject: data.subject, content: data.content }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setPreviewHtml(result.content);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Preview error:', error);
    }
  };

  return (
    <DashboardLayout
      auth={auth}
      header={
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Email-Templates
          </h2>
        </div>
      }
    >
      <Head title="Email-Templates" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {successMessage && (
            <Alert className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <AlertDescription className="text-green-800 dark:text-green-200">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Template List Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Templates</CardTitle>
                  <CardDescription>
                    Wählen Sie ein Template zum Bearbeiten
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y dark:divide-gray-700">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                          selectedTemplate?.id === template.id
                            ? 'bg-[var(--company-primary)]/10 border-l-4 border-[var(--company-primary)]'
                            : ''
                        }`}
                      >
                        <div className="font-medium text-sm dark:text-gray-200">{template.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{template.key}</div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Template Editor */}
            <div className="lg:col-span-3">
              {selectedTemplate ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Template Info */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{selectedTemplate.name}</CardTitle>
                          <CardDescription>
                            {selectedTemplate.description || 'Bearbeiten Sie dieses Email-Template'}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={showHTMLEditor ? "default" : "outline"}
                            size="sm"
                            onClick={() => setShowHTMLEditor(!showHTMLEditor)}
                            className="gap-2"
                          >
                            <Code className="h-4 w-4" />
                            {showHTMLEditor ? 'Einfacher Editor' : 'HTML-Editor'}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Variables Info */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <Code className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-2">
                              Verfügbare Variablen
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedTemplate.variables.map((variable) => (
                                <code
                                  key={variable}
                                  className="px-2 py-1 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded text-xs font-mono cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                  onClick={() => {
                                    navigator.clipboard.writeText(`{{${variable}}}`);
                                  }}
                                  title="Klicken zum Kopieren"
                                >
                                  {`{{${variable}}}`}
                                </code>
                              ))}
                            </div>
                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                              Klicken Sie auf eine Variable, um sie zu kopieren. Diese werden automatisch mit echten Daten ersetzt.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Subject Field */}
                      <div className="space-y-2">
                        <Label htmlFor="subject" className="flex items-center gap-2">
                          <Type className="h-4 w-4" />
                          Email-Betreff
                        </Label>
                        <Input
                          id="subject"
                          type="text"
                          value={data.subject}
                          onChange={(e) => setData('subject', e.target.value)}
                          placeholder="z.B. Willkommen bei {{company_name}}"
                          className="font-mono text-sm"
                        />
                        {errors.subject && (
                          <p className="text-sm text-red-600 dark:text-red-400">{errors.subject}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Der Betreff der Email. Verwenden Sie Variablen wie {`{{company_name}}`} oder {`{{name}}`}.
                        </p>
                      </div>

                      {/* Content Field - HTML or Simple */}
                      {showHTMLEditor ? (
                        <div className="space-y-2">
                          <Label htmlFor="content" className="flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            HTML-Inhalt (Erweitert)
                          </Label>
                          <Textarea
                            id="content"
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                            rows={20}
                            className="font-mono text-xs"
                            placeholder="HTML-Inhalt des Email-Templates..."
                          />
                          {errors.content && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.content}</p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Vollständiger HTML-Code der Email. Nur für fortgeschrittene Benutzer.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                              <h4 className="font-medium text-sm dark:text-gray-200">Email-Inhalt bearbeiten</h4>
                            </div>
                            <div className="space-y-3">
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Bearbeiten Sie den Text direkt im HTML-Code unten. Die Struktur bleibt erhalten.
                              </p>
                              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                  <strong>Tipp:</strong> Suchen Sie nach Text zwischen {`<p>`} und {`</p>`} Tags oder zwischen {`<h1>`} und {`</h1>`} Tags.
                                  Ändern Sie nur den Text, nicht die HTML-Tags. Verwenden Sie den HTML-Editor oben für erweiterte Änderungen.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="content-simple" className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Email-Inhalt
                            </Label>
                            <Textarea
                              id="content-simple"
                              value={data.content}
                              onChange={(e) => setData('content', e.target.value)}
                              rows={16}
                              className="font-mono text-sm"
                              placeholder="Email-Inhalt..."
                            />
                            {errors.content && (
                              <p className="text-sm text-red-600 dark:text-red-400">{errors.content}</p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Bearbeiten Sie Texte direkt im Code. Ändern Sie nur die Texte zwischen den Tags, nicht die HTML-Struktur.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
                        <Button
                          type="submit"
                          disabled={processing}
                          className="gap-2"
                          style={{
                            backgroundColor: 'var(--company-primary)',
                            color: 'white',
                          }}
                        >
                          <Save className="h-4 w-4" />
                          {processing ? 'Speichere...' : 'Template speichern'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePreview}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Vorschau anzeigen
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Preview */}
                  {showPreview && previewHtml && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Eye className="h-5 w-5" />
                          Vorschau
                        </CardTitle>
                        <CardDescription>
                          So sieht die Email mit Beispieldaten aus
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                          <div
                            className="border rounded-lg bg-white max-w-2xl mx-auto"
                            dangerouslySetInnerHTML={{ __html: previewHtml }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </form>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500 dark:text-gray-400">
                    Wählen Sie ein Template aus der Liste
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
