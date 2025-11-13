<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RoofArea extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'name',
        'path',
        'panel_type',
        'tilt_angle',
        'orientation_angle',
        'panel_count',
    ];

    protected function casts(): array
    {
        return [
            'path' => 'array',
            'tilt_angle' => 'decimal:2',
            'orientation_angle' => 'decimal:2',
        ];
    }

    /**
     * Get the project that owns the roof area.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the exclusion zones for the roof area.
     */
    public function exclusionZones(): HasMany
    {
        return $this->hasMany(ExclusionZone::class);
    }
}
