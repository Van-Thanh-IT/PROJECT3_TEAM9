<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VariantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'variants'              => 'required|array|min:1',
            'variants.*.color'      => 'required|string|max:50',
            'variants.*.size'       => 'required|string|max:10',
            'variants.*.price'      => 'required|numeric|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'variants.required'           => 'Biến thể sản phẩm không được để trống!.',
            'variants.array'              => 'Dữ liệu biến thể phải là mảng.',
            'variants.*.color.required'   => 'Màu của biến thể không được để trống.',
            'variants.*.color.string'     => 'Màu của biến thể phải là chuỗi.',
            'variants.*.color.max'        => 'Màu của biến thể tối đa 50 ký tự.',
            'variants.*.size.required'    => 'Size của biến thể không được để trống.',
            'variants.*.size.string'      => 'Size của biến thể phải là chuỗi.',
            'variants.*.size.max'         => 'Size của biến thể tối đa 10 ký tự.',
            'variants.*.price.required'   => 'Giá của biến thể không được để trống.',
            'variants.*.price.numeric'    => 'Giá của biến thể phải là số.',
            'variants.*.price.min'        => 'Giá của biến thể phải lớn hơn hoặc bằng 0.',
        ];
    }
}
