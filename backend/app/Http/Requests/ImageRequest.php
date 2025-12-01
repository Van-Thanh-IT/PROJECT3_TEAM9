<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // PHẢI true để FormRequest hoạt động
    }

    public function rules(): array
    {
        return [
            'images'            => 'required|array|min:1',
            'images.*'          => 'required|image|mimes:jpg,jpeg,png,webp|max:5120', // 5MB
            'product_id'        => 'required|integer|exists:products,id',
        ];
    }

    public function messages(): array
    {
        return [
            'images.required'   => 'Vui lòng chọn ít nhất 1 ảnh.',
            'images.array'      => 'Danh sách ảnh không hợp lệ.',
            'images.min'        => 'Cần ít nhất 1 ảnh để tải lên.',

            'images.*.required' => 'Mỗi ảnh đều phải được chọn.',
            'images.*.image'    => 'Tệp tải lên phải là hình ảnh.',
            'images.*.mimes'    => 'Ảnh chỉ chấp nhận định dạng: jpg, jpeg, png, webp.',
            'images.*.max'      => 'Kích thước ảnh tối đa 5MB.',

            'product_id.required' => 'Thiếu product_id.',
            'product_id.exists'   => 'Sản phẩm không tồn tại.',
        ];
    }
}
