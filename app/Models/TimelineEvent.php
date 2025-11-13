<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimelineEvent extends Model
{
    protected $fillable = [
        'project_id',
        'created_by',
        'event_type',
        'title',
        'description',
        'icon',
        'old_value',
        'new_value',
    ];

    /**
     * Get the project that owns the timeline event.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the user who created the event.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the icon for the event type.
     */
    public function getIconAttribute($value): string
    {
        // Return custom icon if set, otherwise default based on event type
        if ($value) {
            return $value;
        }

        return match ($this->event_type) {
            'project_created' => 'Plus',
            'status_changed' => 'ArrowRight',
            'appointment_scheduled' => 'Calendar',
            'document_uploaded' => 'FileText',
            'quote_sent' => 'Mail',
            'contract_signed' => 'FileCheck',
            'installation_scheduled' => 'CalendarCheck',
            'installation_completed' => 'CheckCircle',
            default => 'Circle',
        };
    }
}
