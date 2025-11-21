import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/Components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import {
  UserPlus,
  Mail,
  Phone,
  Calendar,
  FileText,
  ExternalLink,
  User,
  Search,
  Filter,
  MessageSquare,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Home,
  Info,
  Eye,
} from 'lucide-react';
import axios from 'axios';
import LeadDetailModal from '@/Components/Sales/LeadDetailModal';

type LeadStatus = 'new' | 'assigned' | 'contacted' | 'qualified' | 'converted' | 'lost';
type RequestType = 'Angebot anfordern' | 'Beratungsgespräch' | 'Vor-Ort-Besichtigung' | 'Allgemeine Anfrage' | 'quote' | 'consultation';

interface LeadNote {
  id: number;
  content: string;
  created_at: string;
  user: {
    name: string;
  };
}

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  request_type: RequestType;
  status: LeadStatus;
  source: string;
  account_created: boolean;
  created_at: string;
  assigned_to: {
    id: number;
    name: string;
  } | null;
  project: {
    id: number;
    name: string;
  } | null;
  notes: LeadNote[];
  notes_count: number;
}

interface SalesUser {
  id: number;
  name: string;
}

interface Filters {
  status: string;
  assigned_to: string;
  search: string;
}

interface SalesLeadsProps {
  auth: {
    user: {
      name: string;
      email: string;
      roles: string[];
    };
  };
  leads: Lead[];
  salesUsers: SalesUser[];
  filters: Filters;
}

const statusConfig: Record<LeadStatus, { label: string; color: string }> = {
  new: { label: 'Neu', color: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary' },
  assigned: { label: 'Zugewiesen', color: 'bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary' },
  contacted: { label: 'Kontaktiert', color: 'bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent' },
  qualified: { label: 'Qualifiziert', color: 'bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary' },
  converted: { label: 'Konvertiert', color: 'bg-primary/30 text-primary dark:bg-primary/40 dark:text-primary' },
  lost: { label: 'Verloren', color: 'bg-secondary/20 text-secondary dark:bg-secondary/30 dark:text-secondary' },
};

const requestTypeConfig: Record<RequestType, { label: string; icon: typeof FileText }> = {
  'Angebot anfordern': { label: 'Angebot anfordern', icon: FileText },
  'Beratungsgespräch': { label: 'Beratungsgespräch', icon: User },
  'Vor-Ort-Besichtigung': { label: 'Vor-Ort-Besichtigung', icon: Home },
  'Allgemeine Anfrage': { label: 'Allgemeine Anfrage', icon: Info },
  quote: { label: 'Angebot', icon: FileText },
  consultation: { label: 'Beratung', icon: User },
};

export default function SalesLeads({ auth, leads, salesUsers, filters }: SalesLeadsProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedSalesperson, setSelectedSalesperson] = useState<number | null>(null);
  const [updating, setUpdating] = useState(false);

  // Filter state
  const [statusFilter, setStatusFilter] = useState(filters.status);
  const [assignedToFilter, setAssignedToFilter] = useState(filters.assigned_to);
  const [searchQuery, setSearchQuery] = useState(filters.search);

  // Notes state
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Expanded rows for notes display
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Detail modal state
  const [detailLeadId, setDetailLeadId] = useState<number | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleAssign = async () => {
    if (!selectedLead) return;

    setUpdating(true);
    try {
      await axios.put(`/sales/leads/${selectedLead.id}/assign`, {
        assigned_to: selectedSalesperson,
      });

      setShowAssignDialog(false);
      setSelectedLead(null);
      setSelectedSalesperson(null);
      router.reload();
    } catch (error: any) {
      console.error('Fehler beim Zuweisen des Leads:', error);
      alert(error.response?.data?.message || 'Fehler beim Zuweisen');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = async (leadId: number, newStatus: LeadStatus) => {
    try {
      await axios.put(`/sales/leads/${leadId}/status`, {
        status: newStatus,
      });
      router.reload();
    } catch (error: any) {
      console.error('Fehler beim Aktualisieren des Status:', error);
      alert(error.response?.data?.message || 'Fehler beim Aktualisieren');
    }
  };

  const openAssignDialog = (lead: Lead) => {
    setSelectedLead(lead);
    setSelectedSalesperson(lead.assigned_to?.id || null);
    setShowAssignDialog(true);
  };

  // Filter handling
  const applyFilters = () => {
    router.get('/sales/leads', {
      status: statusFilter,
      assigned_to: assignedToFilter,
      search: searchQuery,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  // Notes handling
  const openNotesDialog = (lead: Lead) => {
    setSelectedLead(lead);
    setNoteContent('');
    setShowNotesDialog(true);
  };

  const handleAddNote = async () => {
    if (!selectedLead || !noteContent.trim()) return;

    setAddingNote(true);
    try {
      await axios.post(`/sales/leads/${selectedLead.id}/notes`, {
        content: noteContent,
      });

      setShowNotesDialog(false);
      setNoteContent('');
      setSelectedLead(null);
      router.reload();
    } catch (error: any) {
      console.error('Fehler beim Hinzufügen der Notiz:', error);
      alert(error.response?.data?.message || 'Fehler beim Hinzufügen der Notiz');
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (leadId: number, noteId: number) => {
    if (!confirm('Möchten Sie diese Notiz wirklich löschen?')) return;

    try {
      await axios.delete(`/sales/leads/${leadId}/notes/${noteId}`);
      router.reload();
    } catch (error: any) {
      console.error('Fehler beim Löschen der Notiz:', error);
      alert(error.response?.data?.message || 'Fehler beim Löschen der Notiz');
    }
  };

  const toggleRowExpansion = (leadId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(leadId)) {
      newExpanded.delete(leadId);
    } else {
      newExpanded.add(leadId);
    }
    setExpandedRows(newExpanded);
  };

  const openDetailModal = (leadId: number) => {
    setDetailLeadId(leadId);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setDetailLeadId(null);
  };

  const StatusBadge = ({ status }: { status: LeadStatus }) => {
    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <DashboardLayout auth={auth}>
      <Head title="Leads - Vertrieb" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Lead-Verwaltung
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Verwalten Sie eingehende Leads und Anfragen
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Neue Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {leads.filter(l => l.status === 'new').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Zugewiesen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {leads.filter(l => l.status === 'assigned').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Qualifiziert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {leads.filter(l => l.status === 'qualified').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Konvertiert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {leads.filter(l => l.status === 'converted').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Suche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Suche
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Name, E-Mail oder Telefon..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="all">Alle Status</option>
                  <option value="new">Neu</option>
                  <option value="assigned">Zugewiesen</option>
                  <option value="contacted">Kontaktiert</option>
                  <option value="qualified">Qualifiziert</option>
                  <option value="converted">Konvertiert</option>
                  <option value="lost">Verloren</option>
                </select>
              </div>

              {/* Assignment Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Zugewiesen an
                </label>
                <select
                  value={assignedToFilter}
                  onChange={(e) => setAssignedToFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="all">Alle</option>
                  <option value="unassigned">Nicht zugewiesen</option>
                  {salesUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Filter anwenden
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStatusFilter('all');
                  setAssignedToFilter('all');
                  setSearchQuery('');
                  router.get('/sales/leads');
                }}
              >
                Filter zurücksetzen
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Leads</CardTitle>
          <CardDescription>
            {leads.length} {leads.length === 1 ? 'Lead' : 'Leads'} gesamt
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <UserPlus className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Keine Leads vorhanden
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Es wurden noch keine Leads erstellt.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Kontakt</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Zugewiesen an</TableHead>
                    <TableHead>Projekt</TableHead>
                    <TableHead>Notizen</TableHead>
                    <TableHead>Erstellt</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => {
                    const RequestIcon = requestTypeConfig[lead.request_type].icon;
                    const isExpanded = expandedRows.has(lead.id);
                    return (
                      <React.Fragment key={lead.id}>
                        <TableRow>
                          {/* Expand Button */}
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => toggleRowExpansion(lead.id)}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>

                          <TableCell className="font-medium">
                            {lead.name}
                            {lead.account_created && (
                              <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                                (Account erstellt)
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="h-3 w-3" />
                                <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                                  {lead.email}
                                </a>
                              </div>
                              {lead.phone && (
                                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                  <Phone className="h-3 w-3" />
                                  <a href={`tel:${lead.phone}`}>
                                    {lead.phone}
                                  </a>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <RequestIcon className="h-4 w-4" />
                              <span>{requestTypeConfig[lead.request_type].label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <select
                              value={lead.status}
                              onChange={(e) => handleStatusUpdate(lead.id, e.target.value as LeadStatus)}
                              className="text-xs rounded-full px-2.5 py-0.5 border-0 focus:ring-2 focus:ring-blue-500"
                            >
                              {Object.entries(statusConfig).map(([value, config]) => (
                                <option key={value} value={value}>
                                  {config.label}
                                </option>
                              ))}
                            </select>
                          </TableCell>
                          <TableCell>
                            {lead.assigned_to ? (
                              <span className="text-sm">{lead.assigned_to.name}</span>
                            ) : (
                              <span className="text-sm text-gray-400">Nicht zugewiesen</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {lead.project ? (
                              <Link
                                href={`/?project=${lead.project.id}`}
                                className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                              >
                                {lead.project.name}
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 text-sm">
                                <MessageSquare className="h-4 w-4" />
                                {lead.notes_count}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openNotesDialog(lead)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                              <Calendar className="h-3 w-3" />
                              {lead.created_at}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDetailModal(lead.id)}
                                title="Details ansehen"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Details
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openAssignDialog(lead)}
                              >
                                <UserPlus className="h-3 w-3 mr-1" />
                                Zuweisen
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Row - Notes Display */}
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={10} className="bg-gray-50 dark:bg-gray-900/50 p-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Notizen ({lead.notes_count})
                                  </h4>
                                  <Button
                                    size="sm"
                                    onClick={() => openNotesDialog(lead)}
                                  >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Notiz hinzufügen
                                  </Button>
                                </div>

                                {lead.notes.length === 0 ? (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                    Noch keine Notizen vorhanden
                                  </p>
                                ) : (
                                  <div className="space-y-2">
                                    {lead.notes.map((note) => (
                                      <div
                                        key={note.id}
                                        className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                                      >
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex-1">
                                            <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                                              {note.content}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                              {note.user.name} • {note.created_at}
                                            </p>
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDeleteNote(lead.id, note.id)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lead zuweisen</DialogTitle>
            <DialogDescription>
              Lead zuweisen an: {selectedLead?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
                Vertriebsmitarbeiter
              </label>
              <select
                value={selectedSalesperson || ''}
                onChange={(e) => setSelectedSalesperson(e.target.value ? Number(e.target.value) : null)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Nicht zugewiesen</option>
                {salesUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleAssign} disabled={updating}>
              {updating ? 'Wird zugewiesen...' : 'Zuweisen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notiz hinzufügen</DialogTitle>
            <DialogDescription>
              Notiz für Lead: {selectedLead?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
                Notiz
              </label>
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Notiz eingeben..."
                rows={5}
                maxLength={2000}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {noteContent.length} / 2000 Zeichen
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleAddNote} disabled={addingNote || !noteContent.trim()}>
              {addingNote ? 'Wird hinzugefügt...' : 'Notiz hinzufügen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lead Detail Modal */}
      {detailLeadId && (
        <LeadDetailModal
          leadId={detailLeadId}
          open={showDetailModal}
          onClose={closeDetailModal}
        />
      )}
    </DashboardLayout>
  );
}
