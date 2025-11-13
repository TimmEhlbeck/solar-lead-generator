import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../Components/ui/dialog';
import { StatusBadge, ProjectStatus, getStatusOptions } from '../../components/StatusBadge';
import { Timeline, TimelineEvent } from '../../components/Timeline';
import {
  User,
  MapPin,
  Sun,
  Layers,
  Calendar,
  Edit3,
  MessageSquare,
} from 'lucide-react';
import axios from 'axios';

interface Project {
  id: number;
  name: string;
  user_name: string;
  location_lat: number;
  location_lng: number;
  total_panel_count: number;
  roof_areas_count: number;
  status: ProjectStatus;
  created_at: string;
  timeline_events: TimelineEvent[];
}

interface SalesProjectsProps {
  auth: {
    user: {
      name: string;
      email: string;
      roles: string[];
    };
  };
  projects: Project[];
}

export default function SalesProjects({ auth, projects }: SalesProjectsProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>('draft');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async () => {
    if (!selectedProject) return;

    setUpdating(true);
    try {
      await axios.put(`/sales/projects/${selectedProject.id}/status`, {
        status: selectedStatus,
        note: statusNote || undefined,
      });

      setShowStatusDialog(false);
      setSelectedProject(null);
      setStatusNote('');
      router.reload();
    } catch (error: any) {
      console.error('Fehler beim Aktualisieren des Status:', error);
      alert(error.response?.data?.message || 'Fehler beim Aktualisieren');
    } finally {
      setUpdating(false);
    }
  };

  const openStatusDialog = (project: Project) => {
    setSelectedProject(project);
    setSelectedStatus(project.status);
    setShowStatusDialog(true);
  };

  return (
    <DashboardLayout auth={auth}>
      <Head title="Projekte - Vertrieb" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Alle Projekte
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Verwalten Sie Kundenprojekte und Status-Updates
        </p>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Sun className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Keine Projekte vorhanden
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Es wurden noch keine Projekte erstellt.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{project.name}</CardTitle>
                      <StatusBadge status={project.status} />
                    </div>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {project.user_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {project.location_lat.toFixed(4)}, {project.location_lng.toFixed(4)}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openStatusDialog(project)}
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Status ändern
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Sun className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Module:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {project.total_panel_count}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Layers className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Dachflächen:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {project.roof_areas_count}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Erstellt:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {project.created_at}
                    </span>
                  </div>
                </div>

                {/* Latest Timeline Event */}
                {project.timeline_events && project.timeline_events.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>Letztes Update:</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {project.timeline_events[0].title}
                    </p>
                    {project.timeline_events[0].description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {project.timeline_events[0].description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {project.timeline_events[0].created_at}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Projektstatus aktualisieren</DialogTitle>
            <DialogDescription>
              Ändern Sie den Status für: {selectedProject?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
                Neuer Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as ProjectStatus)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {getStatusOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
                Notiz (optional)
              </label>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Optional: Grund für die Statusänderung..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleStatusUpdate} disabled={updating}>
              {updating ? 'Wird aktualisiert...' : 'Status aktualisieren'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
