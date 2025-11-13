<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoofAreaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'path' => $this->path,
            'panel_type' => $this->panel_type,
            'tilt_angle' => $this->tilt_angle,
            'orientation_angle' => $this->orientation_angle,
            'panel_count' => $this->panel_count,
            'exclusion_zones' => $this->whenLoaded('exclusionZones', function () {
                return $this->exclusionZones->map(function ($zone) {
                    return [
                        'id' => $zone->id,
                        'name' => $zone->name,
                        'path' => $zone->path,
                    ];
                });
            }),
        ];
    }
}
