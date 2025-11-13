<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\TimelineEvent;
use Illuminate\Http\Request;

class TimelineEventController extends Controller
{
    /**
     * Store a new timeline event (Sales/Admin only)
     */
    public function store(Request $request, Project $project)
    {
        // Authorization: User must be sales or admin
        if (!$request->user()->hasAnyRole(['sales', 'admin'])) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'event_type' => ['required', 'in:project_created,status_changed,appointment_scheduled,document_uploaded,quote_sent,contract_signed,installation_scheduled,installation_completed,custom'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'icon' => ['nullable', 'string', 'max:50'],
        ]);

        $event = $project->timelineEvents()->create([
            ...$validated,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Timeline-Event erfolgreich erstellt',
            'event' => $event->load('creator'),
        ]);
    }

    /**
     * Update project status and create timeline event
     */
    public function updateStatus(Request $request, Project $project)
    {
        // Authorization: User must be sales or admin
        if (!$request->user()->hasAnyRole(['sales', 'admin'])) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'status' => ['required', 'in:draft,planning,quote_requested,quote_sent,contract_signed,installation_scheduled,in_installation,completed,cancelled'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $oldStatus = $project->status;

        // Set flag to indicate we're updating status from controller
        // This prevents the Observer from creating a duplicate event
        app()->instance('timeline_event_updating', true);

        $project->update(['status' => $validated['status']]);

        // Create timeline event for status change (with custom note if provided)
        $statusLabels = [
            'draft' => 'Entwurf',
            'planning' => 'In Planung',
            'quote_requested' => 'Angebot angefordert',
            'quote_sent' => 'Angebot versendet',
            'contract_signed' => 'Vertrag unterzeichnet',
            'installation_scheduled' => 'Installation geplant',
            'in_installation' => 'In Installation',
            'completed' => 'Abgeschlossen',
            'cancelled' => 'Abgebrochen',
        ];

        $project->timelineEvents()->create([
            'event_type' => 'status_changed',
            'title' => "Status geändert: {$statusLabels[$validated['status']]}",
            'description' => $validated['note'] ?? "Status von '{$statusLabels[$oldStatus]}' zu '{$statusLabels[$validated['status']]}' geändert",
            'old_value' => $oldStatus,
            'new_value' => $validated['status'],
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Projektstatus erfolgreich aktualisiert',
            'project' => $project->load('timelineEvents.creator'),
        ]);
    }

    /**
     * Delete a timeline event (Admin only)
     */
    public function destroy(Request $request, Project $project, TimelineEvent $event)
    {
        // Authorization: User must be admin
        if (!$request->user()->hasRole('admin')) {
            abort(403, 'Unauthorized');
        }

        // Verify event belongs to project
        if ($event->project_id !== $project->id) {
            abort(404);
        }

        $event->delete();

        return response()->json([
            'message' => 'Timeline-Event erfolgreich gelöscht',
        ]);
    }
}
