import React, { useState, FormEvent, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Mail, Save, Eye, Type, FileText } from 'lucide-react';
import { Textarea } from '@/Components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';

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
  contentHtml: string;
  footerText: string;
  footerContact?: string;
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

// Extract content from HTML (between content divs)
const extractContentHtml = (html: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const contentDiv = doc.querySelector('.content');

  if (!contentDiv) return '';

  // Get inner HTML without the wrapper
  return contentDiv.innerHTML;
};

// Extract header title from HTML
const extractHeaderTitle = (html: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const headerH1 = doc.querySelector('.header h1');
  return headerH1?.textContent || 'Willkommen';
};

// Extract footer info from HTML
const extractFooterInfo = (html: string): { footerText: string; footerContact: string } => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const footer = doc.querySelector('.footer');
  const paragraphs = footer ? Array.from(footer.querySelectorAll('p')) : [];

  const footerText = paragraphs.length > 1 ? paragraphs[1]?.textContent || '' : 'Ihr Partner für nachhaltige Energie';
  const footerContact = paragraphs.length > 2 && !paragraphs[2]?.textContent?.includes('©')
    ? paragraphs[2]?.textContent || ''
    : '';

  return { footerText, footerContact };
};

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-t-lg p-2 bg-gray-50 dark:bg-gray-800 flex flex-wrap gap-1">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-3 py-1 rounded text-sm font-medium ${
          editor.isActive('bold') ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800' : 'bg-white dark:bg-gray-700'
        }`}
      >
        Fett
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-3 py-1 rounded text-sm font-medium ${
          editor.isActive('italic') ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800' : 'bg-white dark:bg-gray-700'
        }`}
      >
        Kursiv
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={`px-3 py-1 rounded text-sm ${
          editor.isActive('paragraph') ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800' : 'bg-white dark:bg-gray-700'
        }`}
      >
        Absatz
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-3 py-1 rounded text-sm ${
          editor.isActive('heading', { level: 2 }) ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800' : 'bg-white dark:bg-gray-700'
        }`}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-3 py-1 rounded text-sm ${
          editor.isActive('heading', { level: 3 }) ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800' : 'bg-white dark:bg-gray-700'
        }`}
      >
        H3
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-3 py-1 rounded text-sm ${
          editor.isActive('bulletList') ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800' : 'bg-white dark:bg-gray-700'
        }`}
      >
        Liste
      </button>
      <button
        type="button"
        onClick={() => {
          const url = window.prompt('URL eingeben:');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        className={`px-3 py-1 rounded text-sm ${
          editor.isActive('link') ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800' : 'bg-white dark:bg-gray-700'
        }`}
      >
        Link
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`px-3 py-1 rounded text-sm ${
          editor.isActive({ textAlign: 'left' }) ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800' : 'bg-white dark:bg-gray-700'
        }`}
      >
        Links
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`px-3 py-1 rounded text-sm ${
          editor.isActive({ textAlign: 'center' }) ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800' : 'bg-white dark:bg-gray-700'
        }`}
      >
        Zentriert
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`px-3 py-1 rounded text-sm ${
          editor.isActive({ textAlign: 'right' }) ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800' : 'bg-white dark:bg-gray-700'
        }`}
      >
        Rechts
      </button>
    </div>
  );
};

export default function EmailTemplates({ auth, templates }: EmailTemplatesPageProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(
    templates.length > 0 ? templates[0] : null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Structured content state
  const [headerTitle, setHeaderTitle] = useState('');
  const [footerText, setFooterText] = useState('');
  const [footerContact, setFooterContact] = useState('');

  const { data, setData, put, processing, errors } = useForm({
    subject: selectedTemplate?.subject || '',
  });

  // TipTap editor for content
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  // Update editor when template changes
  useEffect(() => {
    if (selectedTemplate) {
      setData('subject', selectedTemplate.subject);

      if (selectedTemplate.structured_content) {
        // Use structured content
        setHeaderTitle(selectedTemplate.structured_content.headerTitle);
        setFooterText(selectedTemplate.structured_content.footerText);
        setFooterContact(selectedTemplate.structured_content.footerContact || '');
        editor?.commands.setContent(selectedTemplate.structured_content.contentHtml);
      } else {
        // Parse HTML
        setHeaderTitle(extractHeaderTitle(selectedTemplate.content));
        const footerInfo = extractFooterInfo(selectedTemplate.content);
        setFooterText(footerInfo.footerText);
        setFooterContact(footerInfo.footerContact);
        const contentHtml = extractContentHtml(selectedTemplate.content);
        editor?.commands.setContent(contentHtml);
      }

      setShowPreview(false);
      setPreviewHtml(null);
    }
  }, [selectedTemplate, editor]);

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate || !editor) return;

    const contentHtml = editor.getHTML();

    const structuredContent: StructuredContent = {
      headerTitle,
      contentHtml,
      footerText,
      footerContact,
    };

    put(route('admin.email-templates.update', selectedTemplate.id), {
      data: {
        subject: data.subject,
        structured_content: structuredContent,
      },
      onSuccess: () => {
        setSuccessMessage('Email-Template erfolgreich gespeichert');
        setTimeout(() => setSuccessMessage(null), 3000);
        router.reload({ only: ['templates'] });
      },
    });
  };

  const handlePreview = async () => {
    if (!selectedTemplate || !editor) return;

    const contentHtml = editor.getHTML();

    const structuredContent: StructuredContent = {
      headerTitle,
      contentHtml,
      footerText,
      footerContact,
    };

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
          body: JSON.stringify({
            data: sampleData,
            subject: data.subject,
            structured_content: structuredContent,
          }),
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
                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedTemplate.name}</CardTitle>
                      <CardDescription>
                        {selectedTemplate.description || 'Bearbeiten Sie dieses Email-Template'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Variables Info */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
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

                      {/* Tabs for Content, Header, Footer */}
                      <Tabs defaultValue="content" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="content">Email-Inhalt</TabsTrigger>
                          <TabsTrigger value="header">Header</TabsTrigger>
                          <TabsTrigger value="footer">Footer</TabsTrigger>
                        </TabsList>

                        {/* Content Tab */}
                        <TabsContent value="content" className="space-y-4">
                          <div className="space-y-2">
                            <Label>Email-Inhalt (WYSIWYG-Editor)</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Bearbeiten Sie den Hauptinhalt der Email. Variablen wie {`{{name}}`} können direkt im Text verwendet werden.
                            </p>
                            <MenuBar editor={editor} />
                            <div className="border border-gray-300 dark:border-gray-600 rounded-b-lg bg-white dark:bg-gray-900">
                              <EditorContent editor={editor} />
                            </div>
                          </div>
                        </TabsContent>

                        {/* Header Tab */}
                        <TabsContent value="header" className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="headerTitle">Email-Überschrift (Header)</Label>
                            <Input
                              id="headerTitle"
                              value={headerTitle}
                              onChange={(e) => setHeaderTitle(e.target.value)}
                              placeholder="z.B. Willkommen bei {{company_name}}"
                            />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Diese Überschrift erscheint im farbigen Header-Bereich oben in der Email.
                              Variablen wie {`{{company_name}}`} werden automatisch ersetzt.
                            </p>
                          </div>
                        </TabsContent>

                        {/* Footer Tab */}
                        <TabsContent value="footer" className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="footerText">Footer-Text</Label>
                            <Input
                              id="footerText"
                              value={footerText}
                              onChange={(e) => setFooterText(e.target.value)}
                              placeholder="z.B. Ihr Partner für nachhaltige Energie"
                            />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Der Haupt-Text in der Fußzeile der Email.
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="footerContact">Kontaktinformationen (optional)</Label>
                            <Textarea
                              id="footerContact"
                              value={footerContact}
                              onChange={(e) => setFooterContact(e.target.value)}
                              placeholder="z.B. Adresse, Telefon, E-Mail"
                              rows={3}
                            />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Optionale Kontaktinformationen für die Fußzeile.
                            </p>
                          </div>
                        </TabsContent>
                      </Tabs>

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
