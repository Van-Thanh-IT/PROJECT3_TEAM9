<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Cho phép tất cả client gửi request
    }

    public function rules(): array
    {
        return [
            'username' => 'required|min:5|max:50',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:8',
            'phone'    => 'required|unique:users,phone',
        ];
    }

    public function messages(): array
    {
        return [
            'username.required' => 'Vui lòng nhập tên đăng nhập!',
            'username.min' => "Tên đăng nhập phải có ít nhất 5 ký tự!",
            'username.max' => "Tên đăng nhập phải có nhất 50 ký tự!", 
            'password.required' => 'Vui lòng nhập mật khẩu!',
            'password.min'      => 'Mật khẩu phải có ít nhất 8 ký tự!',
            'email.required'    => 'Vui lòng nhập email!',
            'email.email'       => 'Email không hợp lệ!',
            'email.unique'      => 'Email đã tồn tại trong hệ thống!',
            'phone.required'    => 'Vui lòng nhập số diện thoại!',
            'phone.unique'      => 'Số điện thoại đã tồn tại trong hệ thống!',
        ];
    }
}
