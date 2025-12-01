<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // bạn có thể kiểm tra quyền user ở đây
    }

    public function rules(): array
    {
        // Lấy ID của địa chỉ đang update (nếu có)
        $addressId = $this->route('id');

        return [
            'user_id'      => 'required|exists:users,id',
            'full_name'    => 'required|string|max:100',
            'phone'        => [
                'required',
                'string',
                'max:20',
                Rule::unique('addresses', 'phone')->ignore($addressId),
            ],
            'address_line' => 'required|string|max:255',
            'city'         => 'required|string|max:100',
            'district'     => 'required|string|max:100',
            'ward'         => 'required|string|max:100',
            'is_default'   => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required'      => 'Người dùng không được để trống',
            'user_id.exists'        => 'Người dùng không tồn tại',
            'full_name.required'    => 'Họ và tên không được để trống',
            'full_name.string'      => 'Họ và tên phải là chuỗi',
            'full_name.max'         => 'Họ và tên không được vượt quá 100 ký tự',
            'phone.required'        => 'Số điện thoại không được để trống',
            'phone.string'          => 'Số điện thoại phải là chuỗi',
            'phone.max'             => 'Số điện thoại quá dài',
            'phone.unique'          => 'Số điện thoại đã tồn tại',
            'address_line.required' => 'Địa chỉ chi tiết không được để trống',
            'city.required'         => 'Thành phố không được để trống',
            'district.required'     => 'Quận/Huyện không được để trống',
            'ward.required'         => 'Phường/Xã không được để trống',
            'is_default.boolean'    => 'Giá trị mặc định phải là true hoặc false',
        ];
    }
}
