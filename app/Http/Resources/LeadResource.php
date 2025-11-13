<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeadResource extends JsonResource
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
            'email' => $this->email,
            'phone' => $this->phone,
            'message' => $this->message,
            'request_type' => $this->request_type,
            'status' => $this->status,
            'source' => $this->source,
            'assigned_salesperson' => $this->whenLoaded('assignedSalesperson', function () {
                return [
                    'id' => $this->assignedSalesperson->id,
                    'name' => $this->assignedSalesperson->name,
                    'email' => $this->assignedSalesperson->email,
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
