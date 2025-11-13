<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lead extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'message',
        'request_type',
        'status',
        'assigned_to',
        'source',
        'account_created',
        'project_id',
    ];

    protected function casts(): array
    {
        return [
            'account_created' => 'boolean',
        ];
    }

    /**
     * Get the salesperson assigned to this lead.
     */
    public function assignedSalesperson(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the project associated with this lead.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the notes for this lead.
     */
    public function notes(): HasMany
    {
        return $this->hasMany(LeadNote::class);
    }
}
