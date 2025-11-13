<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('email_templates', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // welcome_user, lead_assigned, etc.
            $table->string('name'); // Human-readable name
            $table->string('subject');
            $table->text('content'); // HTML content
            $table->text('variables')->nullable(); // JSON array of available variables
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Seed initial templates
        DB::table('email_templates')->insert([
            [
                'key' => 'welcome_user',
                'name' => 'Willkommens-E-Mail',
                'subject' => 'Willkommen bei {{company_name}}',
                'content' => file_get_contents(resource_path('views/emails/welcome-user.blade.php')),
                'variables' => json_encode(['name', 'email', 'password', 'projectName', 'company_name']),
                'description' => 'E-Mail die an neue Benutzer gesendet wird',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'lead_assigned',
                'name' => 'Lead zugewiesen',
                'subject' => 'Neuer Lead zugewiesen',
                'content' => file_get_contents(resource_path('views/emails/lead-assigned.blade.php')),
                'variables' => json_encode(['salesperson.name', 'lead.name', 'lead.email', 'lead.phone', 'lead.request_type', 'lead.message', 'lead.source', 'lead.account_created', 'company_name']),
                'description' => 'E-Mail die an Verkäufer gesendet wird wenn ein Lead zugewiesen wird',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_templates');
    }
};
