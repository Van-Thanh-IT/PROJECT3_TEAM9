<?php
namespace App\Services;

use App\Models\User;

class UserService
{
    
    public function getAll()
    {
        return User::with('roles')->whereHas('roles', function($q) {
            $q->where('name', 'user');
        })->get();
    }

    // Lấy 1 user theo id, chỉ role = 'user'
    public function findById($id)
    {
         return User::with('roles')->whereHas('roles', function($q) {
            $q->where('name', 'user');
        })
        ->where('id', $id)->get();
    }

   public function updateStatus($id, $status)
    {
        $allowed = ['active', 'inactive', 'banned'];
        if (!in_array($status, $allowed)) {
            return [
                'status' => false,
                'message' => 'Trạng thái không hợp lệ'
            ];
        }

        $user = User::findOrFail($id);
        $user->status = $status;
        $user->save();

        return [
            'status' => true,
            'message' => 'Cập nhật trạng thái thành công',
            'data' => $user
        ];
    }

    //profile
     public function update($id, array $request)
    {
        $user = User::findOrFail($id);
        $user->update($request);
        return $user;
    }


}
