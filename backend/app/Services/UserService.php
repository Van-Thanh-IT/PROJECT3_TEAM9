<?php
namespace App\Services;

use App\Models\User;
use App\Traits\CloudinaryUpload;

class UserService
{
    use CloudinaryUpload;
    
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
     public function update($id, array $data)
    {
        $user = User::findOrFail($id);

         if (!empty($data['avatar']) && $data['avatar']) {
            $avatarUrl = $this->uploadToCloudinary($data['avatar']);
            $data['avatar'] = $avatarUrl;
        } else {
            unset($data['avatar']); 
        }
        $user->update($data);
        return $user;
    }


}
