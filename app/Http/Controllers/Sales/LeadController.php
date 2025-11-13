<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Mail\LeadAssignedMail;
use App\Models\Lead;
use App\Models\LeadNote;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class LeadController extends Controller
{
    /**
     * Display all leads for sales team
     */
    public function index(Request $request): Response
    {
        $query = Lead::with(['assignedSalesperson', 'project', 'notes.user']);

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by assigned user
        if ($request->has('assigned_to') && $request->assigned_to !== 'all') {
            if ($request->assigned_to === 'unassigned') {
                $query->whereNull('assigned_to');
            } else {
                $query->where('assigned_to', $request->assigned_to);
            }
        }

        // Search
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('phone', 'like', '%' . $request->search . '%');
            });
        }

        $leads = $query->latest()
            ->get()
            ->map(function ($lead) {
                return [
                    'id' => $lead->id,
                    'name' => $lead->name,
                    'email' => $lead->email,
                    'phone' => $lead->phone,
                    'message' => $lead->message,
                    'request_type' => $lead->request_type,
                    'status' => $lead->status,
                    'source' => $lead->source,
                    'account_created' => $lead->account_created,
                    'created_at' => $lead->created_at->format('d.m.Y H:i'),
                    'assigned_to' => $lead->assignedSalesperson ? [
                        'id' => $lead->assignedSalesperson->id,
                        'name' => $lead->assignedSalesperson->name,
                    ] : null,
                    'project' => $lead->project ? [
                        'id' => $lead->project->id,
                        'name' => $lead->project->name,
                    ] : null,
                    'notes' => $lead->notes->map(function ($note) {
                        return [
                            'id' => $note->id,
                            'content' => $note->content,
                            'created_at' => $note->created_at->format('d.m.Y H:i'),
                            'user' => ['name' => $note->user->name],
                        ];
                    }),
                    'notes_count' => $lead->notes->count(),
                ];
            });

        // Get all sales users for assignment dropdown
        $salesUsers = User::role('sales')->get(['id', 'name']);

        return Inertia::render('Sales/Leads', [
            'leads' => $leads,
            'salesUsers' => $salesUsers,
            'filters' => [
                'status' => $request->status ?? 'all',
                'assigned_to' => $request->assigned_to ?? 'all',
                'search' => $request->search ?? '',
            ],
        ]);
    }

    /**
     * Assign a lead to a salesperson
     */
    public function assign(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'assigned_to' => ['nullable', 'exists:users,id'],
        ]);

        $oldAssignedTo = $lead->assigned_to;

        $lead->update([
            'assigned_to' => $validated['assigned_to'],
            'status' => $validated['assigned_to'] ? 'assigned' : 'new',
        ]);

        // Send email notification if lead is assigned to a new person
        if ($validated['assigned_to'] && $validated['assigned_to'] !== $oldAssignedTo) {
            $salesperson = User::find($validated['assigned_to']);
            Mail::to($salesperson->email)->send(new LeadAssignedMail($salesperson, $lead));
        }

        return response()->json([
            'message' => 'Lead erfolgreich zugewiesen',
            'lead' => $lead->load('assignedSalesperson'),
        ]);
    }

    /**
     * Update lead status
     */
    public function updateStatus(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:new,assigned,contacted,qualified,converted,lost'],
        ]);

        $lead->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Lead-Status erfolgreich aktualisiert',
            'lead' => $lead,
        ]);
    }

    /**
     * Add a note to a lead
     */
    public function addNote(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'content' => ['required', 'string', 'max:2000'],
        ]);

        $note = $lead->notes()->create([
            'content' => $validated['content'],
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Notiz erfolgreich hinzugefügt',
            'note' => $note->load('user'),
        ]);
    }

    /**
     * Delete a lead note
     */
    public function deleteNote(Request $request, Lead $lead, LeadNote $note)
    {
        // Verify note belongs to lead
        if ($note->lead_id !== $lead->id) {
            abort(404);
        }

        $note->delete();

        return response()->json([
            'message' => 'Notiz erfolgreich gelöscht',
        ]);
    }

    /**
     * Show detailed information about a lead
     */
    public function show(Lead $lead)
    {
        // Load all related data
        $lead->load([
            'assignedSalesperson',
            'project.user',
            'project.documents',
            'project.appointments.salesperson',
            'project.timelineEvents',
            'project.roofAreas.exclusionZones',
            'notes.user'
        ]);

        return response()->json([
            'lead' => [
                'id' => $lead->id,
                'name' => $lead->name,
                'email' => $lead->email,
                'phone' => $lead->phone,
                'message' => $lead->message,
                'request_type' => $lead->request_type,
                'status' => $lead->status,
                'source' => $lead->source,
                'account_created' => $lead->account_created,
                'created_at' => $lead->created_at->format('d.m.Y H:i'),
                'assigned_to' => $lead->assignedSalesperson ? [
                    'id' => $lead->assignedSalesperson->id,
                    'name' => $lead->assignedSalesperson->name,
                    'email' => $lead->assignedSalesperson->email,
                ] : null,
                'project' => $lead->project ? [
                    'id' => $lead->project->id,
                    'name' => $lead->project->name,
                    'status' => $lead->project->status,
                    'location_lat' => $lead->project->location_lat,
                    'location_lng' => $lead->project->location_lng,
                    'map_center' => $lead->project->map_center,
                    'zoom' => $lead->project->zoom,
                    'total_panel_count' => $lead->project->total_panel_count,
                    'created_at' => $lead->project->created_at->format('d.m.Y H:i'),
                    'user' => $lead->project->user ? [
                        'id' => $lead->project->user->id,
                        'name' => $lead->project->user->name,
                        'email' => $lead->project->user->email,
                    ] : null,
                    'documents' => $lead->project->documents->map(function ($doc) {
                        return [
                            'id' => $doc->id,
                            'title' => $doc->title,
                            'description' => $doc->description,
                            'file_name' => $doc->file_name,
                            'file_type' => $doc->file_type,
                            'file_size' => $doc->file_size,
                            'category' => $doc->category,
                            'created_at' => $doc->created_at->format('d.m.Y H:i'),
                        ];
                    }),
                    'appointments' => $lead->project->appointments->map(function ($appt) {
                        return [
                            'id' => $appt->id,
                            'title' => $appt->title,
                            'description' => $appt->description,
                            'scheduled_at' => $appt->scheduled_at?->format('d.m.Y H:i'),
                            'status' => $appt->status,
                            'salesperson' => $appt->salesperson ? [
                                'name' => $appt->salesperson->name,
                            ] : null,
                        ];
                    }),
                    'timeline_events' => $lead->project->timelineEvents->map(function ($event) {
                        return [
                            'id' => $event->id,
                            'title' => $event->title,
                            'description' => $event->description,
                            'created_at' => $event->created_at->format('d.m.Y H:i'),
                        ];
                    }),
                    'roof_areas' => $lead->project->roofAreas->map(function ($roof) {
                        return [
                            'id' => $roof->id,
                            'name' => $roof->name,
                            'panel_count' => $roof->panel_count,
                            'panel_type' => $roof->panel_type,
                            'tilt_angle' => $roof->tilt_angle,
                            'orientation_angle' => $roof->orientation_angle,
                        ];
                    }),
                ] : null,
                'notes' => $lead->notes->map(function ($note) {
                    return [
                        'id' => $note->id,
                        'content' => $note->content,
                        'created_at' => $note->created_at->format('d.m.Y H:i'),
                        'user' => [
                            'id' => $note->user->id,
                            'name' => $note->user->name,
                        ],
                    ];
                }),
            ],
        ]);
    }
}
