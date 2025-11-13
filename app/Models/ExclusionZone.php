<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExclusionZone extends Model
{
    use HasFactory;

    protected $fillable = [
        'roof_area_id',
        'name',
        'path',
    ];

    protected function casts(): array
    {
        return [
            'path' => 'array',
        ];
    }

    /**
     * Get the roof area that owns the exclusion zone.
     */
    public function roofArea(): BelongsTo
    {
        return $this->belongsTo(RoofArea::class);
    }
}
