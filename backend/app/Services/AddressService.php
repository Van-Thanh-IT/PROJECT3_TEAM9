<?php

namespace App\Services;

use App\Models\Address;
use Illuminate\Support\Facades\DB;

class AddressService
{
    /**
     * Lấy tất cả địa chỉ của 1 user
     */
    public function getAllByUser(int $userId)
    {
        return Address::where('user_id', $userId)
                      ->orderByDesc('is_default')
                      ->get();
    }

    /**
     * Lấy địa chỉ mặc định của user
     */
    public function getDefault(int $userId)
    {
        return Address::where('user_id', $userId)
                      ->where('is_default', true)
                      ->first();
    }

    /**
     * Tạo địa chỉ mới
     */
    public function create(array $request)
    {
        DB::beginTransaction();
        try {
            $address = Address::create([
                'user_id'      => $data['user_id'],
                'full_name'    => $data['full_name'],
                'phone'        => $data['phone'],
                'address_line' => $data['address_line'],
                'city'         => $data['city'],
                'district'     => $data['district'],
                'ward'         => $data['ward'],
                'is_default'   => $data['is_default'] ?? false,
            ]);

            // Nếu là mặc định thì reset các địa chỉ khác
            if (!empty($data['is_default'])) {
                $this->setDefault($address->id, $data['user_id']);
            }

            DB::commit();
            return $address;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Cập nhật địa chỉ
     */
    public function update(int $id, array $data)
    {
        $address = Address::findOrFail($id);
        $address->update($data);

        // Nếu set mặc định
        if (!empty($data['is_default'])) {
            $this->setDefault($id, $address->user_id);
        }

        return $address;
    }

    /**
     * Xóa địa chỉ
     */
    public function delete(int $id)
    {
        $address = Address::findOrFail($id);
        return $address->delete();
    }

    /**
     * Đặt địa chỉ mặc định
     */
    public function setDefault(int $id, int $userId)
    {
        DB::transaction(function () use ($id, $userId) {
            // Reset tất cả về false
            Address::where('user_id', $userId)->update(['is_default' => false]);
            // Set địa chỉ hiện tại thành true
            Address::where('id', $id)->update(['is_default' => true]);
        });
    }
}
