import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileText,
  User,
  Download,
  Trash2,
  Search,
  FolderOpen,
  Calendar,
  HardDrive
} from 'lucide-react';

interface Document {
  id: number;
  title: string;
  description: string | null;
  file_name: string;
  file_type: string;
  file_size: number;
  file_size_formatted: string;
  category: string;
  user_id: number;
  user_name: string;
  user_email: string;
  project_id: number | null;
  project_name: string | null;
  created_at: string;
  updated_at: string;
}

interface DocumentManagementProps {
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
      is_admin?: boolean;
    };
  };
  documents: Document[];
}

export default function DocumentManagement({ auth, documents }: DocumentManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocuments = documents.filter(document =>
    document.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    document.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    document.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    document.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (document.project_name && document.project_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = (document: Document) => {
    if (confirm(`Möchten Sie das Dokument "${document.title}" wirklich löschen?`)) {
      router.delete(`/admin/documents/${document.id}`);
    }
  };

  const handleDownload = (documentId: number) => {
    window.location.href = `/admin/documents/${documentId}/download`;
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors = {
      contract: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      invoice: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      technical: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };

    const categoryLabels = {
      contract: 'Vertrag',
      invoice: 'Rechnung',
      technical: 'Technisch',
      other: 'Sonstiges',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[category as keyof typeof categoryColors] || categoryColors.other}`}>
        {categoryLabels[category as keyof typeof categoryLabels] || category}
      </span>
    );
  };

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FileText className="h-4 w-4 text-red-600" />;
    } else if (fileType.includes('image')) {
      return <FileText className="h-4 w-4 text-blue-600" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="h-4 w-4 text-blue-700" />;
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return <FileText className="h-4 w-4 text-green-700" />;
    } else {
      return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const totalFileSize = documents.reduce((sum, doc) => sum + doc.file_size, 0);
  const formatBytes = (bytes: number) => {
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

  return (
    <DashboardLayout auth={auth}>
      <Head title="Dokumentenverwaltung - Admin" />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dokumentenverwaltung
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Übersicht aller hochgeladenen Dokumente von allen Benutzern
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Gesamt-Dokumente
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {documents.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Gesamt-Speicher
            </CardTitle>
            <HardDrive className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatBytes(totalFileSize)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Mit Projekt
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {documents.filter(d => d.project_id).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Aktive Benutzer
            </CardTitle>
            <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {new Set(documents.map(d => d.user_id)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Suche nach Dokumentname, Benutzer, Email oder Projekt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Dokument-Übersicht</CardTitle>
          <CardDescription>
            {filteredDocuments.length} von {documents.length} Dokumenten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Dokument
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Benutzer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Projekt
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Kategorie
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Größe
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
                {filteredDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Keine Dokumente gefunden
                    </td>
                  </tr>
                ) : (
                  filteredDocuments.map((document) => (
                    <tr
                      key={document.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {getFileTypeIcon(document.file_type)}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {document.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {document.file_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {document.user_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {document.user_email}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {document.project_name ? (
                          <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                            <FolderOpen className="h-3 w-3 text-gray-400" />
                            {document.project_name}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {getCategoryBadge(document.category)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {document.file_size_formatted}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {document.created_at}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(document.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(document)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
