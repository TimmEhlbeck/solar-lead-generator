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
        Schema::create('timeline_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('event_type', [
                'project_created',
                'status_changed',
                'appointment_scheduled',
                'document_uploaded',
                'quote_sent',
                'contract_signed',
                'installation_scheduled',
                'installation_completed',
                'custom'
            ])->default('custom');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('icon')->nullable(); // Lucide icon name
            $table->string('old_value')->nullable(); // For status changes
            $table->string('new_value')->nullable(); // For status changes
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('timeline_events');
    }
};
