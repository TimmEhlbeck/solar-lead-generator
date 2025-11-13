import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  FolderOpen,
  Sun,
  Mail,
  TrendingUp,
  Clock,
  MapPin,
  User,
  FileText,
  ArrowRight
} from 'lucide-react';

interface Statistics {
  total_users: number;
  total_projects: number;
  total_leads: number;
  total_panels: number;
}

interface Project {
  id: number;
  name: string;
  user_name: string;
  user_email: string;
  location_lat: number;
  location_lng: number;
  total_panel_count: number;
  roof_areas_count: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  created_at: string;
}

interface AdminDashboardProps {
  auth: {
    user: {
      name: string;
      email: string;
    };
  };
  statistics: Statistics;
  recent_projects: Project[];
  recent_leads: Lead[];
  projects_by_status: Record<string, number>;
}

export default function AdminDashboard({
  auth,
  statistics,
  recent_projects,
  recent_leads,
  projects_by_status,
}: AdminDashboardProps) {
  const getStatusBadge = (status: string) => {
    const statusColors = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      analyzing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      qualified: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      converted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      lost: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };

    const statusLabels = {
      draft: 'Entwurf',
      analyzing: 'In Analyse',
      completed: 'Abgeschlossen',
      new: 'Neu',
      contacted: 'Kontaktiert',
      qualified: 'Qualifiziert',
      converted: 'Umgewandelt',
      lost: 'Verloren',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || statusColors.draft}`}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </span>
    );
  };

  return (
    <DashboardLayout auth={auth}>
      <Head title="Admin Dashboard" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Übersicht aller Leads, Projekte und Statistiken
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Gesamt-Nutzer
            </CardTitle>
            <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {statistics.total_users}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Registrierte Benutzer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Gesamt-Projekte
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {statistics.total_projects}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Solar-Planungen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Gesamt-Leads
            </CardTitle>
            <Mail className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {statistics.total_leads}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Kontaktanfragen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Gesamt-Module
            </CardTitle>
            <Sun className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {statistics.total_panels}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Solar-Panels geplant
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/admin/users">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Benutzerverwaltung</CardTitle>
                    <CardDescription className="text-xs">
                      Alle Benutzer verwalten
                    </CardDescription>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/projects">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <FolderOpen className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Alle Projekte</CardTitle>
                    <CardDescription className="text-xs">
                      Solar-Planungen ansehen
                    </CardDescription>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/documents">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <FileText className="h-6 w-6 text-green-600 dark:text-green-300" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Alle Dokumente</CardTitle>
                    <CardDescription className="text-xs">
                      Hochgeladene Dateien
                    </CardDescription>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Recent Projects and Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Neueste Projekte
            </CardTitle>
            <CardDescription>
              Die letzten 10 erstellten Solar-Projekte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recent_projects.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
                  Noch keine Projekte vorhanden
                </p>
              ) : (
                recent_projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {project.name}
                        </p>
                        {getStatusBadge(project.status)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <User className="h-3 w-3" />
                        <span>{project.user_name}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Sun className="h-3 w-3" />
                          {project.total_panel_count} Module
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {project.created_at}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Neueste Leads
            </CardTitle>
            <CardDescription>
              Die letzten 10 Kontaktanfragen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recent_leads.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
                  Noch keine Leads vorhanden
                </p>
              ) : (
                recent_leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {lead.name}
                        </p>
                        {getStatusBadge(lead.status)}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{lead.email}</span>
                        </div>
                        {lead.address && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{lead.address}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{lead.created_at}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
