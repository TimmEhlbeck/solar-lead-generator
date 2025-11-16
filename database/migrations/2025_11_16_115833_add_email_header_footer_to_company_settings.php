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
        // Insert default email header and footer settings
        DB::table('company_settings')->insert([
            [
                'key' => 'email_header_title',
                'value' => 'Willkommen',
                'type' => 'text',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'email_footer_text',
                'value' => 'Ihr Partner für nachhaltige Energie',
                'type' => 'text',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'email_footer_contact',
                'value' => '',
                'type' => 'text',
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
        DB::table('company_settings')
            ->whereIn('key', ['email_header_title', 'email_footer_text', 'email_footer_contact'])
            ->delete();
    }
};
