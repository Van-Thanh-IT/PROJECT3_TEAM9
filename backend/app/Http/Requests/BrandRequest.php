<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BrandRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|min:3|max:50',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'description' => 'required|string|max:200',
        ];
    }

    public function messages(): array{
        return [
            'name.required' => 'Vui lòng nhập tên thương hiệu',
            'name.min' => 'Tên thương hiệu quá ngắn (tối thiểu 3 ký tự)',
            'name.max' => 'Tên thương hiệu quá dài (tối đa 50 ký tự)',

            'description.max' => 'Mô tả quá dài, tối đa 200 ký tự',
            'description.required' => 'Vui lòng nhập mô tả',

            'logo.image' => 'Ảnh phải có định dạng jpeg, png, jpg, gif',
            'logo.mimes' => 'Ảnh phải có định dạng jpeg, png, jpg, gif',
            'logo.max' => 'Ảnh quá lớn, tối đa 2MB',
        ];
    }
}
