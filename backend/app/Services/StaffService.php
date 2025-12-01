<?php

namespace App\Services;

use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Traits\CloudinaryUpload;

class StaffService
{
    use CloudinaryUpload;

    /**
     * Lấy danh sách nhân viên theo role
     */
    public function getAllStaffs()
    {
        $users = User::whereHas('roles', function ($q) {
            $q->whereIn('name', ['staff_sale', 'staff_customer_support', 'staff_warehouse']);
        })->with('roles.permissions')->get();

        $users->each(function($user){
            $user->all_permissions = $user->roles
                ->pluck('permissions')
                ->flatten()
                ->unique('id')
                ->map(function($perm){
                    return [
                        'id' => $perm->id,
                        'name' => $perm->name,
                        'description' => $perm->description
                    ];
                });
        });

        return $users;

    }


    /**
     * Lấy 1 nhân viên theo id
     */
    public function findStaffById($id)
    {
        return User::with('roles')->findOrFail($id);
    }

    /**
     * Cập nhật thông tin nhân viên
     */
    public function updateStaff($id, array $data)
    {
        $staff = User::findOrFail($id);

        // 1. Upload avatar nếu có
        if (!empty($data['avatar']) && $data['avatar']) {
            $avatarUrl = $this->uploadToCloudinary($data['avatar']);
            $data['avatar'] = $avatarUrl;
        } else {
            unset($data['avatar']); // Không thay đổi avatar cũ
        }

        // 2. Cập nhật thông tin
        $staff->update($data);

        // 3. Cập nhật role nếu có
        if (!empty($data['role'])) {
            $validRoles = ['staff_sale', 'staff_customer_support', 'staff_warehouse'];
            $roleName = strtolower($data['role']);
            if (in_array($roleName, $validRoles)) {
                $role = Role::firstOrCreate(
                    ['name' => $roleName],
                    ['description' => ucfirst(str_replace('_', ' ', $roleName))]
                );
                $staff->roles()->sync([$role->id]);
            }
        }

        return $staff;
    }


    /**
     * Cập nhật trạng thái active/inactive
     */
    public function updateStaffStatus($id, $status)
    {
        $staff = User::findOrFail($id);
        $staff->status = $status;
        $staff->save();
        return $staff;
    }

    /**
     * Tạo nhân viên mới
     */
    public function createStaff(array $data)
    {
        DB::beginTransaction();

        try {
            // Upload avatar nếu có
            $avatar = $data['avatar'] ?? null;
            if (!empty($data['avatar_file'])) {
                $avatar = $this->uploadToCloudinary($data['avatar_file']);
            }

            $user = User::create([
                'username'      => $data['username'],
                'email'         => $data['email'],
                'password'      => Hash::make($data['password']),
                'phone'         => $data['phone'] ?? null,
                'gender'        => $data['gender'] ?? null,
                'avatar'        => $avatar,
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'status'        => 'active',
            ]);

            $roleName = strtolower($data['role'] ?? 'staff_sale');

            $role = Role::firstOrCreate(
                ['name' => $roleName],
                ['description' => ucfirst(str_replace('_', ' ', $roleName))]
            );

            $user->roles()->sync([$role->id]);

            DB::commit();

            return $user;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
