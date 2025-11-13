import React, { useState, FormEvent } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Mail, Save, Eye, Code } from 'lucide-react';

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

export default function EmailTemplates({ auth, templates }: EmailTemplatesPageProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(
    templates.length > 0 ? templates[0] : null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const { data, setData, put, processing, errors } = useForm({
    subject: selectedTemplate?.subject || '',
    content: selectedTemplate?.content || '',
  });

  // Update form when template selection changes
  React.useEffect(() => {
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

    // Create sample data based on variables
    const sampleData: Record<string, any> = {};
    selectedTemplate.variables.forEach((variable) => {
      if (variable.includes('.')) {
        const [parent, child] = variable.split('.');
        if (!sampleData[parent]) {
          sampleData[parent] = {};
        }
        sampleData[parent][child] = `[Beispiel ${child}]`;
      } else {
        sampleData[variable] = `[Beispiel ${variable}]`;
      }
    });

    try {
      const response = await fetch(
        route('admin.email-templates.preview', selectedTemplate.id),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
          body: JSON.stringify({ data: sampleData }),
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
            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
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
                  <div className="divide-y">
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
                        <div className="font-medium text-sm">{template.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{template.key}</div>
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
                      <CardTitle>{selectedTemplate.name}</CardTitle>
                      <CardDescription>
                        {selectedTemplate.description || 'Bearbeiten Sie dieses Email-Template'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                                  className="px-2 py-1 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded text-xs font-mono"
                                >
                                  {`{{${variable}}}`}
                                </code>
                              ))}
                            </div>
                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                              Verwenden Sie diese Variablen im Betreff und Inhalt. Sie werden automatisch ersetzt.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Subject Field */}
                      <div className="space-y-2">
                        <Label htmlFor="subject">Betreff</Label>
                        <Input
                          id="subject"
                          type="text"
                          value={data.subject}
                          onChange={(e) => setData('subject', e.target.value)}
                          placeholder="z.B. Willkommen bei {{company_name}}"
                          className="font-mono"
                        />
                        {errors.subject && (
                          <p className="text-sm text-red-600">{errors.subject}</p>
                        )}
                      </div>

                      {/* Content Field */}
                      <div className="space-y-2">
                        <Label htmlFor="content">HTML-Inhalt</Label>
                        <textarea
                          id="content"
                          value={data.content}
                          onChange={(e) => setData('content', e.target.value)}
                          rows={16}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--company-primary)] focus:border-transparent font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          placeholder="HTML-Inhalt des Email-Templates..."
                        />
                        {errors.content && (
                          <p className="text-sm text-red-600">{errors.content}</p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
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
                        <CardTitle>Vorschau</CardTitle>
                        <CardDescription>
                          So sieht die Email mit Beispieldaten aus
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div
                          className="border rounded-lg p-4 bg-white"
                          dangerouslySetInnerHTML={{ __html: previewHtml }}
                        />
                      </CardContent>
                    </Card>
                  )}
                </form>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
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
