<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'location_lat',
        'location_lng',
        'map_center',
        'zoom',
        'total_panel_count',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'location_lat' => 'float',
            'location_lng' => 'float',
            'zoom' => 'float',
        ];
    }

    /**
     * Get the map_center attribute with float coordinates
     */
    public function getMapCenterAttribute($value)
    {
        // If already an array (from accessor), return as is
        if (is_array($value)) {
            return [
                'lat' => (float) ($value['lat'] ?? 0),
                'lng' => (float) ($value['lng'] ?? 0),
            ];
        }

        // Decode JSON string from database
        $center = json_decode($value, true);
        if (is_array($center) && isset($center['lat']) && isset($center['lng'])) {
            return [
                'lat' => (float) $center['lat'],
                'lng' => (float) $center['lng'],
            ];
        }
        return $center;
    }

    /**
     * Set the map_center attribute, ensuring it's stored as JSON
     */
    public function setMapCenterAttribute($value)
    {
        if (is_array($value)) {
            $this->attributes['map_center'] = json_encode([
                'lat' => (float) ($value['lat'] ?? 0),
                'lng' => (float) ($value['lng'] ?? 0),
            ]);
        } else {
            $this->attributes['map_center'] = $value;
        }
    }

    /**
     * Get the user that owns the project.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the roof areas for the project.
     */
    public function roofAreas(): HasMany
    {
        return $this->hasMany(RoofArea::class);
    }

    /**
     * Get the appointments for the project.
     */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * Get the documents for the project.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    /**
     * Get the timeline events for the project.
     */
    public function timelineEvents(): HasMany
    {
        return $this->hasMany(TimelineEvent::class)->orderBy('created_at', 'desc');
    }

    /**
     * Get the lead for the project.
     */
    public function lead(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Lead::class);
    }
}
