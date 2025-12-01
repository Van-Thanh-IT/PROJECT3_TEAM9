<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // SỬA: Thêm dấu ! vào trước để kiểm tra "KHÔNG tồn tại"
        // Hoặc dùng: User::where(...)->doesntExist()
        if (!User::where('email', 'tranbatinh7@gmail.com')->exists()) { 
            
            $adminRole = Role::firstOrCreate(
                ['name' => 'admin'],
                ['description' => 'Vai trò quản trị']
            );

            $admin = User::create([
                'username' => 'Quản trị viên',
                'email' => 'tranbatinh7@gmail.com',
                'password' => Hash::make('12345678'),
                'phone' => '0329802523',
            ]);

            // Gán role cho user
            $admin->roles()->syncWithoutDetaching($adminRole->id);
            
            $this->command->info('Admin mặc định đã được tạo thành công!');
            Log::info('Admin mặc định đã được tạo');
        } else {
            $this->command->warn('Admin với email này đã tồn tại, không tạo thêm.');
        }
    }
}