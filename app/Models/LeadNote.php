<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeadNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'user_id',
        'content',
    ];

    /**
     * Get the lead this note belongs to
     */
    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    /**
     * Get the user who created this note
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
