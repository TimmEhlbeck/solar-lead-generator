import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Download, Trash2, FileText, Image, FileSpreadsheet, File } from 'lucide-react';
import { useState, FormEvent } from 'react';

interface Document {
    id: number;
    title: string;
    description: string | null;
    file_name: string;
    file_type: string;
    file_size: number;
    category: string;
    created_at: string;
}

interface Project {
    id: number;
    name: string;
    documents: Document[];
}

export default function Index({ auth, projects }: PageProps<{ projects: Project[] }>) {
    const [selectedProject, setSelectedProject] = useState<Project | null>(
        projects.length > 0 ? projects[0] : null
    );
    const [showUploadDialog, setShowUploadDialog] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        project_id: selectedProject?.id || '',
        file: null as File | null,
        category: 'Sonstiges',
        description: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('project_id', data.project_id.toString());
        if (data.file) {
            formData.append('file', data.file);
        }
        formData.append('category', data.category);
        if (data.description) {
            formData.append('description', data.description);
        }

        router.post(route('documents.store'), formData, {
            onSuccess: () => {
                reset();
                setShowUploadDialog(false);
            },
        });
    };

    const handleDelete = (documentId: number) => {
        if (confirm('Möchten Sie dieses Dokument wirklich löschen?')) {
            router.delete(route('documents.destroy', documentId));
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes >= 1073741824) {
            return (bytes / 1073741824).toFixed(2) + ' GB';
        } else if (bytes >= 1048576) {
            return (bytes / 1048576).toFixed(2) + ' MB';
        } else if (bytes >= 1024) {
            return (bytes / 1024).toFixed(2) + ' KB';
        } else {
            return bytes + ' bytes';
        }
    };

    const getFileIcon = (fileType: string) => {
        if (fileType === 'pdf') return <FileText className="h-8 w-8" />;
        if (['jpg', 'jpeg', 'png'].includes(fileType)) return <Image className="h-8 w-8" />;
        if (['xlsx', 'xls'].includes(fileType)) return <FileSpreadsheet className="h-8 w-8" />;
        return <File className="h-8 w-8" />;
    };

    return (
        <DashboardLayout
            auth={auth}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Dokumente
                    </h2>
                    {selectedProject && (
                        <Button
                            onClick={() => setShowUploadDialog(true)}
                            style={{ backgroundColor: 'var(--company-primary)', color: 'var(--company-text)' }}
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Dokument hochladen
                        </Button>
                    )}
                </div>
            }
        >
            <Head title="Dokumente" />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                        {/* Project Sidebar */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Projekte</CardTitle>
                                    <CardDescription>Wählen Sie ein Projekt aus</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {projects.length === 0 ? (
                                        <p className="text-sm text-gray-500">Keine Projekte vorhanden</p>
                                    ) : (
                                        projects.map((project) => (
                                            <button
                                                key={project.id}
                                                onClick={() => setSelectedProject(project)}
                                                className={`w-full rounded-lg p-3 text-left transition-colors ${
                                                    selectedProject?.id === project.id
                                                        ? 'text-white'
                                                        : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'
                                                }`}
                                                style={
                                                    selectedProject?.id === project.id
                                                        ? {
                                                              backgroundColor: 'var(--company-primary)',
                                                              color: 'var(--company-text)',
                                                          }
                                                        : {}
                                                }
                                            >
                                                <div className="text-sm font-medium">{project.name}</div>
                                                <div className="text-xs opacity-80">
                                                    {project.documents.length} Dokument(e)
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Documents List */}
                        <div className="lg:col-span-3">
                            {selectedProject ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{selectedProject.name}</CardTitle>
                                        <CardDescription>
                                            {selectedProject.documents.length} Dokument(e)
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {selectedProject.documents.length === 0 ? (
                                            <div className="py-12 text-center">
                                                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                                <p className="mt-2 text-sm text-gray-500">
                                                    Noch keine Dokumente vorhanden
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {selectedProject.documents.map((doc) => (
                                                    <div
                                                        key={doc.id}
                                                        className="flex items-center justify-between rounded-lg border p-4"
                                                    >
                                                        <div className="flex items-center space-x-4">
                                                            <div className="text-gray-400">
                                                                {getFileIcon(doc.file_type)}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium">{doc.title}</div>
                                                                <div className="text-sm text-gray-500">
                                                                    {doc.category} • {formatFileSize(doc.file_size)} •{' '}
                                                                    {new Date(doc.created_at).toLocaleDateString('de-DE')}
                                                                </div>
                                                                {doc.description && (
                                                                    <div className="mt-1 text-sm text-gray-600">
                                                                        {doc.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    window.location.href = route(
                                                                        'documents.download',
                                                                        doc.id
                                                                    )
                                                                }
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleDelete(doc.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-500">
                                            Wählen Sie ein Projekt aus, um Dokumente anzuzeigen
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>

            {/* Upload Dialog */}
            {showUploadDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Dokument hochladen</CardTitle>
                            <CardDescription>
                                Laden Sie ein Dokument für {selectedProject?.name} hoch
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Datei
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            setData('file', file);
                                        }}
                                        className="mt-1 block w-full text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-gray-50 file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:bg-gray-100"
                                        required
                                    />
                                    {errors.file && (
                                        <div className="mt-1 text-sm text-red-600">{errors.file}</div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Kategorie
                                    </label>
                                    <select
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="Vertrag">Vertrag</option>
                                        <option value="Angebot">Angebot</option>
                                        <option value="Technische Zeichnung">Technische Zeichnung</option>
                                        <option value="Fotos">Fotos</option>
                                        <option value="Sonstiges">Sonstiges</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Beschreibung (optional)
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowUploadDialog(false);
                                            reset();
                                        }}
                                    >
                                        Abbrechen
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        style={{ backgroundColor: 'var(--company-primary)', color: 'var(--company-text)' }}
                                    >
                                        {processing ? 'Wird hochgeladen...' : 'Hochladen'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </DashboardLayout>
    );
}
