<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VoucherRequest extends FormRequest
{
    public function rules()
    {
        return [
            'name' => 'required|string|max:255',
            'discount_type' => 'required|in:percent,fixed',
            'discount_value' => 'required|numeric|min:1',
            'min_order_value' => 'nullable|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'usage_limit' => 'nullable|integer|min:0',
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'Vui lòng nhập tên voucher',
            'name.max' => 'Tên voucher không được vượt quá 255 ký tự',
            'discount_type.required' => 'Vui lòng chọn loại giảm giá',
            'discount_type.in' => 'Loại giảm giá không hợp lệ',
            'discount_value.required' => 'Vui lòng nhập giá trị giảm giá',
            'discount_value.numeric' => 'Giá trị giảm giá phải là số',
            'discount_value.min' => 'Giá trị giảm giá phải lớn hơn hoặc bằng 1',
            'min_order_value.numeric' => 'Giá trị đơn hàng tối thiểu phải là số',
            'min_order_value.min' => 'Giá trị đơn hàng tối thiểu phải lớn hơn hoặc bằng 0',
            'start_date.required' => 'Vui lòng chọn ngày bắt đầu',
            'start_date.date' => 'Ngày bắt đầu không hợp lệ',
            'end_date.required' => 'Vui lòng chọn ngày kết thúc',
            'end_date.date' => 'Ngày kết thúc không hợp lệ',
            'end_date.after_or_equal' => 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu',
            'usage_limit.integer' => 'Số lần sử dụng phải là số nguyên',
            'usage_limit.min' => 'Số lần sử dụng phải lớn hơn hoặc bằng 0',
        ];
    }
}
