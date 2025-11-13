<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
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
            'location_lat' => $this->location_lat,
            'location_lng' => $this->location_lng,
            'map_center' => $this->map_center,
            'zoom' => $this->zoom,
            'total_panel_count' => $this->total_panel_count,
            'status' => $this->status,
            'roof_areas' => RoofAreaResource::collection($this->whenLoaded('roofAreas')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
