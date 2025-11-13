<?php

namespace App\Observers;

use App\Models\Project;
use App\Models\TimelineEvent;

class ProjectObserver
{
    /**
     * Handle the Project "created" event.
     */
    public function created(Project $project): void
    {
        // Create initial timeline event when project is created
        TimelineEvent::create([
            'project_id' => $project->id,
            'created_by' => $project->user_id,
            'event_type' => 'project_created',
            'title' => 'Projekt erstellt',
            'description' => "Solar-Projekt '{$project->name}' wurde erstellt",
        ]);
    }

    /**
     * Handle the Project "updated" event.
     */
    public function updated(Project $project): void
    {
        // Check if status was changed
        if ($project->isDirty('status')) {
            $oldStatus = $project->getOriginal('status');
            $newStatus = $project->status;

            // Only create event if status actually changed and not created by TimelineEventController
            // (to avoid duplicate events)
            if ($oldStatus !== $newStatus && !app()->has('timeline_event_updating')) {
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

                TimelineEvent::create([
                    'project_id' => $project->id,
                    'created_by' => auth()->id(),
                    'event_type' => 'status_changed',
                    'title' => "Status geändert: {$statusLabels[$newStatus]}",
                    'description' => "Status von '{$statusLabels[$oldStatus]}' zu '{$statusLabels[$newStatus]}' geändert",
                    'old_value' => $oldStatus,
                    'new_value' => $newStatus,
                ]);
            }
        }
    }

    /**
     * Handle the Project "deleted" event.
     */
    public function deleted(Project $project): void
    {
        // Optionally log deletion
    }

    /**
     * Handle the Project "restored" event.
     */
    public function restored(Project $project): void
    {
        TimelineEvent::create([
            'project_id' => $project->id,
            'created_by' => auth()->id(),
            'event_type' => 'custom',
            'title' => 'Projekt wiederhergestellt',
            'description' => 'Das Projekt wurde aus dem Papierkorb wiederhergestellt',
        ]);
    }

    /**
     * Handle the Project "force deleted" event.
     */
    public function forceDeleted(Project $project): void
    {
        // Timeline events will be cascade deleted
    }
}
