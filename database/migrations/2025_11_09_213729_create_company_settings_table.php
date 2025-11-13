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
        Schema::create('company_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, json, file
            $table->timestamps();
        });

        // Insert default settings
        DB::table('company_settings')->insert([
            ['key' => 'company_name', 'value' => 'Solar Lead Generator', 'type' => 'string', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'company_logo', 'value' => null, 'type' => 'file', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'primary_color', 'value' => '#EAB308', 'type' => 'string', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'secondary_color', 'value' => '#1F2937', 'type' => 'string', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'accent_color', 'value' => '#3B82F6', 'type' => 'string', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'background_color', 'value' => '#111827', 'type' => 'string', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'text_color', 'value' => '#FFFFFF', 'type' => 'string', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_settings');
    }
};
