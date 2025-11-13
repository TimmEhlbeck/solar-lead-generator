<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // Project permissions
            'view projects',
            'create projects',
            'edit projects',
            'delete projects',

            // Lead permissions
            'view leads',
            'create leads',
            'edit leads',
            'assign leads',

            // Appointment permissions
            'view appointments',
            'create appointments',
            'edit appointments',
            'delete appointments',

            // User management
            'manage users',

            // Admin permissions
            'access admin panel',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions

        // User role (regular customers)
        $user = Role::create(['name' => 'user']);
        $user->givePermissionTo([
            'view projects',
            'create projects',
            'edit projects',
            'delete projects',
            'view appointments',
            'create appointments',
        ]);

        // Sales role (sales team members)
        $sales = Role::create(['name' => 'sales']);
        $sales->givePermissionTo([
            'view projects',
            'view leads',
            'edit leads',
            'assign leads',
            'view appointments',
            'create appointments',
            'edit appointments',
        ]);

        // Admin role (full access)
        $admin = Role::create(['name' => 'admin']);
        $admin->givePermissionTo(Permission::all());
    }
}
