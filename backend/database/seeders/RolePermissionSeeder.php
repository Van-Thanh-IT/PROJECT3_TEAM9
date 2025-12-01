<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // ====================== 1. Tạo permission ======================
        $permissions = [
            // USER / NHÂN VIÊN
            ['name' => 'create_user', 'description' => 'Tạo nhân viên mới'],
            ['name' => 'edit_user', 'description' => 'Sửa thông tin nhân viên'],
            ['name' => 'delete_user', 'description' => 'Xóa nhân viên'],
            ['name' => 'view_user', 'description' => 'Xem danh sách nhân viên'],

            // SẢN PHẨM
            ['name' => 'create_product', 'description' => 'Tạo sản phẩm mới'],
            ['name' => 'edit_product', 'description' => 'Sửa sản phẩm'],
            ['name' => 'delete_product', 'description' => 'Xóa sản phẩm'],
            ['name' => 'view_product', 'description' => 'Xem sản phẩm'],

            // ĐƠN HÀNG
            ['name' => 'create_order', 'description' => 'Tạo đơn hàng'],
            ['name' => 'edit_order', 'description' => 'Sửa đơn hàng'],
            ['name' => 'delete_order', 'description' => 'Xóa đơn hàng'],
            ['name' => 'view_order', 'description' => 'Xem đơn hàng'],

            // KHÁCH HÀNG
            ['name' => 'view_customer', 'description' => 'Xem thông tin khách hàng'],
            ['name' => 'edit_customer', 'description' => 'Sửa thông tin khách hàng'],

            // KHO HÀNG
            ['name' => 'view_inventory', 'description' => 'Xem kho hàng'],
            ['name' => 'edit_inventory', 'description' => 'Cập nhật tồn kho'],

            // BÁO CÁO
            ['name' => 'view_report', 'description' => 'Xem báo cáo doanh số'],
            ['name' => 'export_report', 'description' => 'Xuất báo cáo'],

            // ROLE / PERMISSION
            ['name' => 'manage_role', 'description' => 'Quản lý role'],
            ['name' => 'manage_permission', 'description' => 'Quản lý permission'],
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(
                ['name' => $perm['name']],
                ['description' => $perm['description']]
            );
        }

        $this->command->info('Permissions đã tạo xong.');

        // ====================== 2. Tạo role và gán permission ======================
        $roles = [
            'admin' => 'all', // admin có tất cả permission
            'staff_sale' => ['create_order', 'view_order', 'view_customer', 'view_report'],
            'staff_customer_support' => ['view_order', 'view_customer', 'edit_customer'],
            'staff_warehouse' => ['view_inventory', 'edit_inventory', 'view_order'],
        ];

        foreach ($roles as $roleName => $perms) {
            $role = Role::firstOrCreate(['name' => $roleName]);

            if ($perms === 'all') {
                $role->permissions()->sync(Permission::pluck('id')->toArray());
            } else {
                $permIds = Permission::whereIn('name', $perms)->pluck('id')->toArray();
                $role->permissions()->sync($permIds);
            }
        }

        $this->command->info('Roles và gán permission xong.');

        // ====================== 3. Tạo admin mẫu ======================
        $adminEmail = 'admin@example.com';
        $admin = User::firstOrCreate(
            ['email' => $adminEmail],
            [
                'username' => 'Admin',
                'password' => Hash::make('12345678'),
                'phone' => '0123456789',
                'status' => 'active',
            ]
        );

        $adminRole = Role::where('name', 'admin')->first();
        $admin->roles()->syncWithoutDetaching([$adminRole->id]);

        $this->command->info('Admin mẫu đã được tạo và gán role admin.');
    }
}
