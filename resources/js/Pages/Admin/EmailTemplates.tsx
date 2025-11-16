import React, { useState, FormEvent, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Mail, Save, Eye, Code, Type, FileText, Plus, X } from 'lucide-react';
import { Textarea } from '@/Components/ui/textarea';

interface EmailTemplate {
  id: number;
  key: string;
  name: string;
  subject: string;
  content: string;
  structured_content: StructuredContent | null;
  variables: string[];
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface StructuredContent {
  headerTitle: string;
  greeting: string;
  paragraphs: string[];
  infoBoxTitle?: string;
  infoBoxContent?: string;
  buttonText?: string;
  buttonUrl?: string;
  listItems?: string[];
  closing: string;
  footerText: string;
  footerContact?: string;
  primaryColor?: string;
  secondaryColor?: string;
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

// Parse HTML to extract structured content
const parseHtmlToStructured = (html: string): StructuredContent => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Extract header title
  const headerTitle = doc.querySelector('.header h1')?.textContent || 'Willkommen';

  // Extract content paragraphs
  const contentDiv = doc.querySelector('.content');
  const allParagraphs = contentDiv ? Array.from(contentDiv.querySelectorAll('p')) : [];

  let greeting = '';
  let paragraphs: string[] = [];
  let closing = '';
  let buttonText = '';
  let buttonUrl = '';

  // First paragraph is greeting
  if (allParagraphs.length > 0) {
    greeting = allParagraphs[0]?.textContent || '';
  }

  // Extract button
  const button = contentDiv?.querySelector('.button');
  if (button) {
    buttonText = button.textContent || '';
    buttonUrl = button.getAttribute('href') || '{{app_url}}';
  }

  // Extract info box
  const infoBox = doc.querySelector('.info-box, .credentials, .lead-info');
  const infoBoxTitle = infoBox?.querySelector('h2, h3')?.textContent || '';
  const infoBoxParagraphs = infoBox ? Array.from(infoBox.querySelectorAll('p')).map(p => p.textContent || '') : [];
  const infoBoxContent = infoBoxParagraphs.join('\n');

  // Extract list items
  const list = contentDiv?.querySelector('ul');
  const listItems = list ? Array.from(list.querySelectorAll('li')).map(li => li.textContent || '') : [];

  // Extract footer
  const footer = doc.querySelector('.footer');
  const footerParagraphs = footer ? Array.from(footer.querySelectorAll('p')) : [];
  const footerText = footerParagraphs.length > 1 ? footerParagraphs[1]?.textContent || '' : 'Ihr Partner für nachhaltige Energie';

  // Middle paragraphs (excluding first greeting and assuming last before closing)
  // We'll identify paragraphs that are not in info boxes
  const contentParagraphs = contentDiv ? Array.from(contentDiv.querySelectorAll('p:not(.info-box p):not(.credentials p):not(.lead-info p)')) : [];

  // Filter out button container and greeting
  paragraphs = contentParagraphs
    .slice(1) // Skip greeting
    .map(p => p.textContent || '')
    .filter(text => text.trim() && !text.includes(buttonText)); // Remove button container

  // Find closing (usually starts with "Mit freundlichen Grüßen" or similar)
  const closingIndex = paragraphs.findIndex(p =>
    p.includes('freundlichen Grüßen') ||
    p.includes('Fragen stehen wir') ||
    p.includes('Bei Fragen')
  );

  if (closingIndex !== -1) {
    closing = paragraphs.slice(closingIndex).join('\n');
    paragraphs = paragraphs.slice(0, closingIndex);
  }

  return {
    headerTitle,
    greeting,
    paragraphs: paragraphs.filter(p => p.trim()),
    infoBoxTitle: infoBoxTitle || undefined,
    infoBoxContent: infoBoxContent || undefined,
    buttonText: buttonText || undefined,
    buttonUrl: buttonUrl || undefined,
    listItems: listItems.length > 0 ? listItems : undefined,
    closing,
    footerText,
    footerContact: '',
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

  // Visual editor state
  const [structuredData, setStructuredData] = useState<StructuredContent>({
    headerTitle: '',
    greeting: '',
    paragraphs: [],
    closing: '',
    footerText: '',
  });

  const { data, setData, put, processing, errors } = useForm({
    subject: selectedTemplate?.subject || '',
    content: selectedTemplate?.content || '',
    structured_content: selectedTemplate?.structured_content || null,
  });

  // Update form when template selection changes
  useEffect(() => {
    if (selectedTemplate) {
      setData({
        subject: selectedTemplate.subject,
        content: selectedTemplate.content,
        structured_content: selectedTemplate.structured_content,
      });

      // Initialize structured data from template
      if (selectedTemplate.structured_content) {
        setStructuredData(selectedTemplate.structured_content);
      } else {
        // Parse HTML to create structured data
        setStructuredData(parseHtmlToStructured(selectedTemplate.content));
      }

      setShowPreview(false);
      setPreviewHtml(null);
      setShowHTMLEditor(false);
    }
  }, [selectedTemplate]);

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    const submitData: any = {
      subject: data.subject,
    };

    if (showHTMLEditor) {
      // HTML mode: submit content directly
      submitData.content = data.content;
      submitData.structured_content = null;
    } else {
      // Visual mode: submit structured content
      submitData.structured_content = structuredData;
    }

    put(route('admin.email-templates.update', selectedTemplate.id), {
      data: submitData,
      onSuccess: () => {
        setSuccessMessage('Email-Template erfolgreich gespeichert');
        setTimeout(() => setSuccessMessage(null), 3000);
        router.reload({ only: ['templates'] });
      },
    });
  };

  const handlePreview = async () => {
    if (!selectedTemplate) return;

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
      const requestBody: any = {
        data: sampleData,
        subject: data.subject,
      };

      if (showHTMLEditor) {
        requestBody.content = data.content;
      } else {
        requestBody.structured_content = structuredData;
      }

      const response = await fetch(
        route('admin.email-templates.preview', selectedTemplate.id),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
          body: JSON.stringify(requestBody),
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

  const updateStructuredField = (field: keyof StructuredContent, value: any) => {
    setStructuredData(prev => ({ ...prev, [field]: value }));
  };

  const updateParagraph = (index: number, value: string) => {
    setStructuredData(prev => {
      const newParagraphs = [...prev.paragraphs];
      newParagraphs[index] = value;
      return { ...prev, paragraphs: newParagraphs };
    });
  };

  const addParagraph = () => {
    setStructuredData(prev => ({
      ...prev,
      paragraphs: [...prev.paragraphs, ''],
    }));
  };

  const removeParagraph = (index: number) => {
    setStructuredData(prev => ({
      ...prev,
      paragraphs: prev.paragraphs.filter((_, i) => i !== index),
    }));
  };

  const addListItem = () => {
    setStructuredData(prev => ({
      ...prev,
      listItems: [...(prev.listItems || []), ''],
    }));
  };

  const updateListItem = (index: number, value: string) => {
    setStructuredData(prev => {
      const newItems = [...(prev.listItems || [])];
      newItems[index] = value;
      return { ...prev, listItems: newItems };
    });
  };

  const removeListItem = (index: number) => {
    setStructuredData(prev => ({
      ...prev,
      listItems: (prev.listItems || []).filter((_, i) => i !== index),
    }));
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
                            {showHTMLEditor ? 'Visueller Editor' : 'HTML-Editor'}
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
                      </div>

                      {/* Content Editor - HTML or Visual */}
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
                          {/* Visual Editor */}
                          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                              <h4 className="font-medium text-sm dark:text-gray-200">Visueller Editor</h4>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                              Bearbeiten Sie den Email-Inhalt ohne HTML-Code. Alle Felder unterstützen Variablen wie {`{{name}}`} oder {`{{company_name}}`}.
                            </p>
                          </div>

                          {/* Header Title */}
                          <div className="space-y-2">
                            <Label htmlFor="headerTitle">Email-Überschrift (Header)</Label>
                            <Input
                              id="headerTitle"
                              value={structuredData.headerTitle}
                              onChange={(e) => updateStructuredField('headerTitle', e.target.value)}
                              placeholder="z.B. Willkommen bei {{company_name}}"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Die große Überschrift oben in der Email
                            </p>
                          </div>

                          {/* Greeting */}
                          <div className="space-y-2">
                            <Label htmlFor="greeting">Begrüßung</Label>
                            <Input
                              id="greeting"
                              value={structuredData.greeting}
                              onChange={(e) => updateStructuredField('greeting', e.target.value)}
                              placeholder="z.B. Hallo {{name}},"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Die persönliche Begrüßung zu Beginn
                            </p>
                          </div>

                          {/* Main Paragraphs */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Haupt-Textabschnitte</Label>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={addParagraph}
                                className="gap-1"
                              >
                                <Plus className="h-3 w-3" />
                                Absatz hinzufügen
                              </Button>
                            </div>
                            {structuredData.paragraphs.map((paragraph, index) => (
                              <div key={index} className="flex gap-2">
                                <Textarea
                                  value={paragraph}
                                  onChange={(e) => updateParagraph(index, e.target.value)}
                                  placeholder={`Absatz ${index + 1}`}
                                  rows={2}
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeParagraph(index)}
                                  className="self-start"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Die Haupt-Textabschnitte Ihrer Email
                            </p>
                          </div>

                          {/* Info Box (Optional) */}
                          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                            <h5 className="font-medium text-sm">Info-Box (optional)</h5>
                            <div className="space-y-2">
                              <Label htmlFor="infoBoxTitle">Box-Überschrift</Label>
                              <Input
                                id="infoBoxTitle"
                                value={structuredData.infoBoxTitle || ''}
                                onChange={(e) => updateStructuredField('infoBoxTitle', e.target.value)}
                                placeholder="z.B. Ihre Zugangsdaten"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="infoBoxContent">Box-Inhalt</Label>
                              <Textarea
                                id="infoBoxContent"
                                value={structuredData.infoBoxContent || ''}
                                onChange={(e) => updateStructuredField('infoBoxContent', e.target.value)}
                                placeholder="Wichtige Informationen..."
                                rows={3}
                              />
                            </div>
                          </div>

                          {/* Button (Optional) */}
                          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                            <h5 className="font-medium text-sm">Button (optional)</h5>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label htmlFor="buttonText">Button-Text</Label>
                                <Input
                                  id="buttonText"
                                  value={structuredData.buttonText || ''}
                                  onChange={(e) => updateStructuredField('buttonText', e.target.value)}
                                  placeholder="z.B. Jetzt anmelden"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="buttonUrl">Button-Link</Label>
                                <Input
                                  id="buttonUrl"
                                  value={structuredData.buttonUrl || ''}
                                  onChange={(e) => updateStructuredField('buttonUrl', e.target.value)}
                                  placeholder="z.B. {{app_url}}/login"
                                />
                              </div>
                            </div>
                          </div>

                          {/* List Items (Optional) */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Aufzählungsliste (optional)</Label>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={addListItem}
                                className="gap-1"
                              >
                                <Plus className="h-3 w-3" />
                                Listenpunkt hinzufügen
                              </Button>
                            </div>
                            {(structuredData.listItems || []).map((item, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  value={item}
                                  onChange={(e) => updateListItem(index, e.target.value)}
                                  placeholder={`Listenpunkt ${index + 1}`}
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeListItem(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>

                          {/* Closing */}
                          <div className="space-y-2">
                            <Label htmlFor="closing">Abschluss-Text</Label>
                            <Textarea
                              id="closing"
                              value={structuredData.closing}
                              onChange={(e) => updateStructuredField('closing', e.target.value)}
                              placeholder="z.B. Mit freundlichen Grüßen,&#10;Ihr Team von {{company_name}}"
                              rows={3}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Abschiedstext und Unterschrift
                            </p>
                          </div>

                          {/* Footer */}
                          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                            <h5 className="font-medium text-sm">Fußzeile</h5>
                            <div className="space-y-2">
                              <Label htmlFor="footerText">Footer-Text</Label>
                              <Input
                                id="footerText"
                                value={structuredData.footerText}
                                onChange={(e) => updateStructuredField('footerText', e.target.value)}
                                placeholder="z.B. Ihr Partner für nachhaltige Energie"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="footerContact">Kontaktinformationen (optional)</Label>
                              <Textarea
                                id="footerContact"
                                value={structuredData.footerContact || ''}
                                onChange={(e) => updateStructuredField('footerContact', e.target.value)}
                                placeholder="Adresse, Telefon, etc."
                                rows={2}
                              />
                            </div>
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
