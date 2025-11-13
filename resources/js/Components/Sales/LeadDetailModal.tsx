import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Calendar,
  Clock,
  Download,
  Building2,
  Zap,
} from 'lucide-react';
import axios from 'axios';

interface LeadDetail {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  request_type: string;
  status: string;
  source: string;
  account_created: boolean;
  created_at: string;
  assigned_to: {
    id: number;
    name: string;
    email: string;
  } | null;
  project: {
    id: number;
    name: string;
    status: string;
    location_lat: number;
    location_lng: number;
    total_panel_count: number;
    created_at: string;
    user: {
      id: number;
      name: string;
      email: string;
    } | null;
    documents: Array<{
      id: number;
      title: string;
      description: string | null;
      file_name: string;
      file_type: string;
      file_size: number;
      category: string;
      created_at: string;
    }>;
    appointments: Array<{
      id: number;
      title: string;
      description: string | null;
      scheduled_at: string | null;
      status: string;
      salesperson: { name: string } | null;
    }>;
    timeline_events: Array<{
      id: number;
      title: string;
      description: string | null;
      created_at: string;
    }>;
    roof_areas: Array<{
      id: number;
      name: string;
      panel_count: number;
      panel_type: string;
      tilt_angle: number;
      orientation_angle: number;
    }>;
  } | null;
  notes: Array<{
    id: number;
    content: string;
    created_at: string;
    user: {
      id: number;
      name: string;
    };
  }>;
}

interface LeadDetailModalProps {
  leadId: number;
  open: boolean;
  onClose: () => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return bytes + ' bytes';
};

const statusConfig: Record<string, { label: string; color: string }> = {
  new: { label: 'Neu', color: 'bg-blue-100 text-blue-800' },
  assigned: { label: 'Zugewiesen', color: 'bg-purple-100 text-purple-800' },
  contacted: { label: 'Kontaktiert', color: 'bg-yellow-100 text-yellow-800' },
  qualified: { label: 'Qualifiziert', color: 'bg-indigo-100 text-indigo-800' },
  converted: { label: 'Konvertiert', color: 'bg-green-100 text-green-800' },
  lost: { label: 'Verloren', color: 'bg-gray-100 text-gray-800' },
};

export default function LeadDetailModal({ leadId, open, onClose }: LeadDetailModalProps) {
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && leadId) {
      loadLeadDetails();
    }
  }, [open, leadId]);

  const loadLeadDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/sales/leads/${leadId}`);
      setLead(response.data.lead);
    } catch (error) {
      console.error('Error loading lead details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!lead && !loading) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{lead?.name || 'Lead Details'}</span>
            {lead && (
              <Badge className={statusConfig[lead.status]?.color}>
                {statusConfig[lead.status]?.label}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Lade Details...</div>
          </div>
        ) : lead ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Übersicht</TabsTrigger>
              <TabsTrigger value="project">Projekt</TabsTrigger>
              <TabsTrigger value="customer">Kunde</TabsTrigger>
              <TabsTrigger value="documents">Dokumente</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Lead-Informationen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{lead.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                      {lead.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                      {lead.phone}
                    </a>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Nachricht:</h4>
                    <p className="text-sm text-gray-600">{lead.message}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <span className="text-sm text-gray-500">Anfrage-Typ:</span>
                      <p className="font-medium">{lead.request_type}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Quelle:</span>
                      <p className="font-medium">{lead.source}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Erstellt am:</span>
                      <p className="font-medium">{lead.created_at}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Zugewiesen an:</span>
                      <p className="font-medium">{lead.assigned_to?.name || 'Nicht zugewiesen'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Notizen ({lead.notes.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {lead.notes.length === 0 ? (
                    <p className="text-sm text-gray-500">Keine Notizen vorhanden</p>
                  ) : (
                    <div className="space-y-3">
                      {lead.notes.map((note) => (
                        <div key={note.id} className="border-l-2 border-gray-300 pl-3">
                          <p className="text-sm">{note.content}</p>
                          <div className="text-xs text-gray-500 mt-1">
                            {note.user.name} • {note.created_at}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Project Tab */}
            <TabsContent value="project" className="space-y-4">
              {lead.project ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>{lead.project.name}</CardTitle>
                      <CardDescription>Projekt-ID: {lead.project.id}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-500">Status:</span>
                          <p className="font-medium capitalize">{lead.project.status}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Erstellt am:</span>
                          <p className="font-medium">{lead.project.created_at}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Panel-Anzahl:</span>
                          <p className="font-medium flex items-center gap-1">
                            <Zap className="h-4 w-4" />
                            {lead.project.total_panel_count} Panels
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Standort:</span>
                          <p className="font-medium flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {lead.project.location_lat.toFixed(4)}, {lead.project.location_lng.toFixed(4)}
                          </p>
                        </div>
                      </div>

                      {/* Roof Areas */}
                      {lead.project.roof_areas.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium text-sm mb-2">Dachflächen</h4>
                          <div className="space-y-2">
                            {lead.project.roof_areas.map((roof) => (
                              <div key={roof.id} className="bg-gray-50 p-3 rounded">
                                <div className="font-medium">{roof.name}</div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {roof.panel_count} Panels • {roof.panel_type} • Neigung: {roof.tilt_angle}° • Ausrichtung: {roof.orientation_angle}°
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Appointments */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Termine ({lead.project.appointments.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {lead.project.appointments.length === 0 ? (
                        <p className="text-sm text-gray-500">Keine Termine vorhanden</p>
                      ) : (
                        <div className="space-y-3">
                          {lead.project.appointments.map((appt) => (
                            <div key={appt.id} className="flex items-start gap-3 border-b pb-3">
                              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div className="flex-1">
                                <div className="font-medium">{appt.title}</div>
                                {appt.description && (
                                  <p className="text-sm text-gray-600">{appt.description}</p>
                                )}
                                <div className="text-xs text-gray-500 mt-1">
                                  {appt.scheduled_at && <span>{appt.scheduled_at}</span>}
                                  {appt.salesperson && <span> • {appt.salesperson.name}</span>}
                                  <Badge className="ml-2" variant="outline">{appt.status}</Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    Kein Projekt zugeordnet
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Customer Tab */}
            <TabsContent value="customer">
              {lead.project?.user ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Kunden-Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{lead.project.user.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <a href={`mailto:${lead.project.user.email}`} className="text-blue-600 hover:underline">
                        {lead.project.user.email}
                      </a>
                    </div>
                    <div className="mt-4">
                      <span className="text-sm text-gray-500">Kunden-ID:</span>
                      <p className="font-medium">{lead.project.user.id}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    Keine Kunden-Informationen verfügbar
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Dokumente ({lead.project?.documents.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  {!lead.project || lead.project.documents.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Keine Dokumente vorhanden</p>
                  ) : (
                    <div className="space-y-2">
                      {lead.project.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <div className="font-medium text-sm">{doc.title}</div>
                              <div className="text-xs text-gray-500">
                                {doc.category} • {formatFileSize(doc.file_size)} • {doc.created_at}
                              </div>
                            </div>
                          </div>
                          <a
                            href={`/documents/${doc.id}/download`}
                            className="p-2 hover:bg-gray-100 rounded"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Timeline ({lead.project?.timeline_events.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  {!lead.project || lead.project.timeline_events.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Keine Timeline-Events vorhanden</p>
                  ) : (
                    <div className="space-y-4">
                      {lead.project.timeline_events.map((event) => (
                        <div key={event.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
                            <div className="w-px bg-gray-300 flex-1 mt-1" />
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="font-medium">{event.title}</div>
                            {event.description && (
                              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                            )}
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                              <Clock className="h-3 w-3" />
                              {event.created_at}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
