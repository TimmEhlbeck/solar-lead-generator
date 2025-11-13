<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('exclusion_zones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('roof_area_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->json('path'); // Array of lat/lng coordinates
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exclusion_zones');
    }
};
