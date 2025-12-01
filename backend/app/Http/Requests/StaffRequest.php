<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StaffRequest extends FormRequest
{
    // Ai có quyền gửi request này
    public function authorize(): bool
    {
        // Có thể kiểm tra quyền admin ở đây
        return true;
    }

    // Quy tắc validate
   public function rules(): array
{
    $userId = $this->route('id'); // lấy ID từ route nếu có

    return [
        'username'      => 'required|string|max:255',
        'email'         => [
            'required',
            'email',
            Rule::unique('users', 'email')->ignore($userId),
        ],
        'password'      => 'nullable|string|min:6|confirmed',
        'phone'         => [
            'required',
            'string',
            'max:20',
            Rule::unique('users', 'phone')->ignore($userId),
        ],
        'gender'        => 'nullable|in:male,female,other',
        'avatar'        => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        'date_of_birth' => 'nullable|date',
        'role'          => 'nullable|string|in:staff_sale,staff_customer_support,staff_warehouse'
    ];
}

    // Custom messages
    public function messages(): array
    {
        return [
            'username.required' => 'Tên nhân viên không được để trống',
            'username.string'   => 'Tên nhân viên phải là chuỗi',
            'username.max'      => 'Tên nhân viên không được vượt quá 255 ký tự',

            'email.required'    => 'Email không được để trống',
            'email.email'       => 'Email không hợp lệ',
            'email.unique'      => 'Email đã tồn tại',

            'password.required' => 'Mật khẩu không được để trống',
            'password.min'      => 'Mật khẩu phải có ít nhất 6 ký tự',
            'password.confirmed'=> 'Xác nhận mật khẩu không khớp',

            'phone.required'    => 'Số điện thoại không được để trống',
            'phone.max'         => 'Số điện thoại quá dài',
            'phone.unique'      => 'Số điện thoại đã tồn tại',

            'gender.in'         => 'Giới tính phải là male, female hoặc other',

            'avatar.image'      => 'Avatar phải là ảnh',
            'avatar.mimes'      => 'Avatar phải có định dạng: jpeg, png, jpg, gif, svg',
            'avatar.max'        => 'Avatar không được vượt quá 2MB',

            'date_of_birth.date'=> 'Ngày sinh không hợp lệ',

            'role.in'           => 'Role phải là staff_sale, staff_customer_support hoặc staff_warehouse',
        ];
    }
}
