<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // cho phép tất cả hoặc bạn có thể thêm logic quyền
    }

    public function rules(): array
    {
        return [
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'material'    => 'nullable|string|max:255',
            'style'       => 'nullable|string|max:255',
            'price'       => 'required|numeric|min:0',
            'category_id' => 'required|integer|exists:categories,id',
            'brand_id'    => 'required|integer|exists:brands,id',
            'variants'    => 'nullable|array',
            'variants.*.color' => 'required_with:variants|string|max:50',
            'variants.*.size'  => 'required_with:variants|string|max:10',
            'variants.*.price' => 'required_with:variants|numeric|min:0',
            'images'      => 'nullable|array',
            'images.*.url' => 'nullable|url',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Tên sản phẩm không được để trống',
            'name.string'   => 'Tên sản phẩm phải là chuỗi ký tự',
            'name.max'      => 'Tên sản phẩm tối đa 255 ký tự',
            'price.required'=> 'Giá sản phẩm không được để trống',
            'price.numeric' => 'Giá sản phẩm phải là số',
            'price.min'     => 'Giá sản phẩm phải lớn hơn hoặc bằng 0',
            'category_id.required' => 'Danh mục sản phẩm không được để trống',
            'category_id.exists'   => 'Danh mục sản phẩm không hợp lệ',
            'brand_id.required'    => 'Thương hiệu sản phẩm không được để trống',
            'brand_id.exists'      => 'Thương hiệu sản phẩm không hợp lệ',
            'variants.*.color.required_with' => 'Màu sắc biến thể không được để trống',
            'variants.*.size.required_with'  => 'Size biến thể không được để trống',
            'variants.*.price.required_with' => 'Giá biến thể không được để trống',
            'images.*.url.url' => 'URL ảnh không hợp lệ',
        ];
    }
}
