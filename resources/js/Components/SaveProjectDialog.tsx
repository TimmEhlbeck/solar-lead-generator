import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Copy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { RoofArea } from '../types';

interface SaveProjectDialogProps {
  roofs: RoofArea[];
  mapCenter: google.maps.LatLngLiteral;
  zoom: number;
  disabled?: boolean;
  projectId?: number | null;
  projectName?: string | null;
}

export const SaveProjectDialog: React.FC<SaveProjectDialogProps> = ({
  roofs,
  mapCenter,
  zoom,
  disabled = false,
  projectId = null,
  projectName: initialProjectName = null,
}) => {
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saveAsNew, setSaveAsNew] = useState(false);

  const isUpdate = projectId !== null && !saveAsNew;

  // Set initial project name when dialog opens
  useEffect(() => {
    if (open && initialProjectName) {
      if (saveAsNew) {
        setProjectName(`${initialProjectName} (Kopie)`);
      } else {
        setProjectName(initialProjectName);
      }
    }
  }, [open, initialProjectName, saveAsNew]);

  // Reset saveAsNew when dialog closes
  useEffect(() => {
    if (!open) {
      setSaveAsNew(false);
    }
  }, [open]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName.trim()) {
      setError('Bitte geben Sie einen Projektnamen ein.');
      return;
    }

    if (roofs.length === 0) {
      setError('Bitte erstellen Sie mindestens eine Dachfläche.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // First, get the CSRF cookie from Sanctum
      await window.axios.get('/sanctum/csrf-cookie');

      // Transform roofs data to match backend expectations
      const roofAreas = roofs.map((roof) => ({
        name: roof.name,
        path: roof.path,
        panel_type: roof.panelType,
        tilt_angle: roof.tiltAngle,
        orientation_angle: roof.orientationAngle,
        panel_count: roof.panelCount,
        exclusion_zones: roof.exclusionZones.map((zone) => ({
          name: zone.name,
          path: zone.path,
        })),
      }));

      const payload = {
        name: projectName,
        location_lat: mapCenter.lat,
        location_lng: mapCenter.lng,
        map_center: mapCenter,
        zoom: zoom,
        roof_areas: roofAreas,
      };

      if (isUpdate && projectId) {
        // Update existing project
        await window.axios.put(`/api/projects/${projectId}`, payload);
      } else {
        // Create new project
        await window.axios.post('/api/projects', payload);
      }

      setSuccess(true);
      if (!isUpdate) {
        setProjectName('');
      }

      // Close dialog after short delay and reload page to update URL
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        // Reload the page to reflect changes
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error('Fehler beim Speichern des Projekts:', err);

      if (err.response?.status === 401) {
        setError('Sie müssen angemeldet sein, um Projekte zu speichern.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Ein Fehler ist beim Speichern aufgetreten. Bitte versuchen Sie es erneut.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when closing
      setError(null);
      setSuccess(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || roofs.length === 0}
          className="gap-2"
        >
          {isUpdate ? (
            <>
              <RefreshCw className="h-4 w-4" />
              Projekt aktualisieren
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Projekt speichern
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>
              {isUpdate ? 'Projekt aktualisieren' : 'Projekt speichern'}
            </DialogTitle>
            <DialogDescription>
              {isUpdate
                ? 'Aktualisieren Sie Ihr Solar-Projekt mit den neuesten Änderungen.'
                : 'Geben Sie einen Namen für Ihr Solar-Projekt ein. Sie können es später in Ihrem Dashboard wiederfinden.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert variant="success">
                <AlertDescription>
                  {isUpdate
                    ? 'Projekt erfolgreich aktualisiert!'
                    : 'Projekt erfolgreich gespeichert!'}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="project-name">Projektname</Label>
              <Input
                id="project-name"
                type="text"
                placeholder="z.B. Mein Haus - Solarprojekt"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                disabled={loading || success}
                autoFocus
              />
            </div>

            <div className="text-sm text-muted-foreground">
              <div>Dachflächen: {roofs.length}</div>
              <div>
                Gesamt-Module: {roofs.reduce((sum, roof) => sum + roof.panelCount, 0)}
              </div>
            </div>

            {/* Save as New option - only show when editing existing project */}
            {projectId && !saveAsNew && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md border border-border">
                <div className="flex items-center gap-2">
                  <Copy className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">Als neue Kopie speichern?</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSaveAsNew(true)}
                  disabled={loading || success}
                >
                  Als Kopie
                </Button>
              </div>
            )}

            {saveAsNew && (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2">
                  <Copy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-blue-900 dark:text-blue-100">
                    Wird als neues Projekt gespeichert
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSaveAsNew(false)}
                  disabled={loading || success}
                >
                  Abbrechen
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading || success}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading || success}>
              {loading
                ? (isUpdate ? 'Aktualisiere...' : 'Speichere...')
                : (isUpdate ? 'Aktualisieren' : 'Speichern')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
