import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  User,
  Mail,
  MapPin,
  Calendar,
  Sun,
  Layers,
  Compass,
  Mountain,
  FolderOpen,
  Triangle
} from 'lucide-react';

interface ExclusionZone {
  id: number;
  name: string;
  path: [number, number][];
}

interface RoofArea {
  id: number;
  name: string;
  path: [number, number][];
  panel_type: string;
  tilt_angle: number;
  orientation_angle: number;
  panel_count: number;
  exclusion_zones: ExclusionZone[];
}

interface Project {
  id: number;
  name: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  location_lat: number;
  location_lng: number;
  map_center: [number, number];
  zoom: number;
  total_panel_count: number;
  status: string;
  created_at: string;
  updated_at: string;
  roof_areas: RoofArea[];
}

interface ProjectDetailProps {
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
      is_admin?: boolean;
    };
  };
  project: Project;
}

export default function ProjectDetail({ auth, project }: ProjectDetailProps) {
  const getStatusBadge = (status: string) => {
    const statusColors = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      analyzing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    };

    const statusLabels = {
      draft: 'Entwurf',
      analyzing: 'In Analyse',
      completed: 'Abgeschlossen',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || statusColors.draft}`}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </span>
    );
  };

  const getPanelTypeLabel = (panelType: string) => {
    const labels = {
      portrait: 'Hochformat',
      landscape: 'Querformat',
    };
    return labels[panelType as keyof typeof labels] || panelType;
  };

  return (
    <DashboardLayout auth={auth}>
      <Head title={`${project.name} - Projektdetails`} />

      {/* Header */}
      <div className="mb-8">
        <Button variant="outline" asChild className="mb-4">
          <Link href="/admin/projects">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zu Alle Projekte
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {project.name}
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Projekt-Details und Konfiguration
            </p>
          </div>
          <div>
            {getStatusBadge(project.status)}
          </div>
        </div>
      </div>

      {/* Project Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Gesamt-Module
            </CardTitle>
            <Sun className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {project.total_panel_count}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Dachflächen
            </CardTitle>
            <Layers className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {project.roof_areas.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Erstellt am
            </CardTitle>
            <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {project.created_at}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Aktualisiert am
            </CardTitle>
            <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {project.updated_at}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User & Location Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Benutzer-Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {project.user.name}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="h-3 w-3" />
                    {project.user.email}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Standort-Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>Breitengrad: {Number(project.location_lat).toFixed(6)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>Längengrad: {Number(project.location_lng).toFixed(6)}</span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Karten-Zentrum: [{Number(project.map_center[0]).toFixed(6)}, {Number(project.map_center[1]).toFixed(6)}]
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Zoom-Level: {project.zoom}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roof Areas */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Dachflächen-Konfiguration</CardTitle>
          <CardDescription>
            {project.roof_areas.length} Dachfläche{project.roof_areas.length !== 1 ? 'n' : ''} mit insgesamt {project.total_panel_count} Modulen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {project.roof_areas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Keine Dachflächen konfiguriert
            </div>
          ) : (
            <div className="space-y-6">
              {project.roof_areas.map((roofArea, index) => (
                <div
                  key={roofArea.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {roofArea.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Sun className="h-4 w-4" />
                      <span>{roofArea.panel_count} Module</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Modul-Typ</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {getPanelTypeLabel(roofArea.panel_type)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mountain className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Neigungswinkel</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {roofArea.tilt_angle}°
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Compass className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Ausrichtung</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {roofArea.orientation_angle}°
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Triangle className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Polygon-Punkte</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {roofArea.path.length}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Exclusion Zones */}
                  {roofArea.exclusion_zones.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Ausschlusszonen ({roofArea.exclusion_zones.length})
                      </div>
                      <div className="space-y-2">
                        {roofArea.exclusion_zones.map((zone) => (
                          <div
                            key={zone.id}
                            className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded p-2"
                          >
                            <div className="flex items-center gap-2">
                              <Triangle className="h-3 w-3 text-gray-400" />
                              <span className="text-sm text-gray-900 dark:text-white">
                                {zone.name}
                              </span>
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {zone.path.length} Punkte
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
