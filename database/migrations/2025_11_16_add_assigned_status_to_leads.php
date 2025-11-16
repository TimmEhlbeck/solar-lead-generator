<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            // For MySQL/MariaDB, we need to modify the enum
            DB::statement("ALTER TABLE leads MODIFY COLUMN status ENUM('new', 'assigned', 'contacted', 'qualified', 'converted', 'lost') DEFAULT 'new'");
        } elseif ($driver === 'sqlite') {
            // For SQLite, we need to recreate the table
            // First, create a temporary table with the new structure
            Schema::create('leads_new', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email');
                $table->string('phone')->nullable();
                $table->text('message')->nullable();
                $table->enum('request_type', ['quote', 'consultation']);
                $table->enum('status', ['new', 'assigned', 'contacted', 'qualified', 'converted', 'lost'])->default('new');
                $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
                $table->string('source')->default('website');
                $table->boolean('account_created')->default(false);
                $table->foreignId('project_id')->nullable()->constrained()->onDelete('set null');
                $table->timestamps();
            });

            // Copy data from old table to new table
            DB::statement('INSERT INTO leads_new SELECT * FROM leads');

            // Drop old table and rename new table
            Schema::dropIfExists('leads');
            Schema::rename('leads_new', 'leads');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        // Remove 'assigned' status, but first set all 'assigned' leads back to 'new'
        DB::table('leads')->where('status', 'assigned')->update(['status' => 'new']);

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE leads MODIFY COLUMN status ENUM('new', 'contacted', 'qualified', 'converted', 'lost') DEFAULT 'new'");
        } elseif ($driver === 'sqlite') {
            // For SQLite, recreate the table without 'assigned' status
            Schema::create('leads_new', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email');
                $table->string('phone')->nullable();
                $table->text('message')->nullable();
                $table->enum('request_type', ['quote', 'consultation']);
                $table->enum('status', ['new', 'contacted', 'qualified', 'converted', 'lost'])->default('new');
                $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
                $table->string('source')->default('website');
                $table->boolean('account_created')->default(false);
                $table->foreignId('project_id')->nullable()->constrained()->onDelete('set null');
                $table->timestamps();
            });

            DB::statement('INSERT INTO leads_new SELECT * FROM leads');
            Schema::dropIfExists('leads');
            Schema::rename('leads_new', 'leads');
        }
    }
};
