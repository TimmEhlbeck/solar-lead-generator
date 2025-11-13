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
        Schema::table('projects', function (Blueprint $table) {
            // Change the status enum to include more values
            $table->enum('status', [
                'draft',
                'planning',
                'quote_requested',
                'quote_sent',
                'contract_signed',
                'installation_scheduled',
                'in_installation',
                'completed',
                'cancelled'
            ])->default('draft')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            // Revert to original enum values
            $table->enum('status', ['draft', 'analyzing', 'completed'])->default('draft')->change();
        });
    }
};
