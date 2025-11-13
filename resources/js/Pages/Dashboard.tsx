import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '../Layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../Components/ui/dialog';
import {
  Plus,
  Trash2,
  MapPin,
  Calendar,
  Layers,
  Sun,
  AlertCircle,
  Clock
} from 'lucide-react';
import axios from 'axios';
import { StatusBadge, ProjectStatus } from '../components/StatusBadge';
import { Timeline, TimelineEvent } from '../components/Timeline';

interface Project {
  id: number;
  name: string;
  location_lat: number;
  location_lng: number;
  total_panel_count: number;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  roof_areas_count: number;
  timeline_events: TimelineEvent[];
  roof_areas: Array<{
    id: number;
    name: string;
    path: Array<{ lat: number; lng: number }>;
    panel_type: string;
    tilt_angle: number;
    orientation_angle: number;
    panel_count: number;
    exclusion_zones: Array<{
      id: number;
      name: string;
      path: Array<{ lat: number; lng: number }>;
    }>;
  }>;
}

interface DashboardProps {
  auth: {
    user: {
      name: string;
      email: string;
    };
  };
  projects: Project[];
}

export default function Dashboard({ auth, projects }: DashboardProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleDelete = async (projectId: number) => {
    if (!confirm('Möchten Sie dieses Projekt wirklich löschen?')) {
      return;
    }

    setDeletingId(projectId);
    setError(null);

    try {
      await axios.delete(`/api/projects/${projectId}`);

      // Reload the page to get updated projects list
      router.reload();
    } catch (err: any) {
      console.error('Fehler beim Löschen des Projekts:', err);
      setError(err.response?.data?.message || 'Fehler beim Löschen des Projekts');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout auth={auth}>
      <Head title="Dashboard - Meine Projekte" />
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Meine Solar-Projekte
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Verwalten Sie Ihre gespeicherten Solar-Planungen
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* New Project Button */}
      <div className="mb-6">
        <Button asChild>
          <Link href="/">
            <Plus className="h-4 w-4 mr-2" />
            Neues Projekt erstellen
          </Link>
        </Button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Sun className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Noch keine Projekte
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Erstellen Sie Ihr erstes Solar-Projekt, um mit der Planung zu beginnen.
            </p>
            <Button asChild>
              <Link href="/">
                <Plus className="h-4 w-4 mr-2" />
                Projekt erstellen
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">
                      {project.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {Number(project.location_lat).toFixed(4)}, {Number(project.location_lng).toFixed(4)}
                    </CardDescription>
                  </div>
                  <StatusBadge status={project.status} />
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Module gesamt:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {project.total_panel_count}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Dachflächen:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {project.roof_areas_count}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Erstellt:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {project.created_at}
                    </span>
                  </div>

                  {project.timeline_events && project.timeline_events.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <Clock className="h-4 w-4" />
                        <span>Letztes Update:</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {project.timeline_events[0].title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {project.timeline_events[0].created_at}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  asChild
                >
                  <Link href={`/project/${project.id}`}>
                    Öffnen
                  </Link>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setSelectedProject(project)}
                >
                  Timeline
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(project.id)}
                  disabled={deletingId === project.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Timeline Dialog */}
      <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProject?.name} - Projekt-Timeline</DialogTitle>
            <DialogDescription>
              Verlauf und Status-Updates für dieses Projekt
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="mt-4">
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Aktueller Status:</span>
                  <StatusBadge status={selectedProject.status} />
                </div>
              </div>
              <Timeline events={selectedProject.timeline_events} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
