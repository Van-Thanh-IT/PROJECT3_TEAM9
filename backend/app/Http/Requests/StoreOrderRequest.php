<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize()
    {
        return true; // Cho phép tất cả user gửi request
    }

    public function rules()
    {
        return [
            'full_name'        => 'required|string|max:100',

            // Validate số điện thoại VN
            'phone' => [
                'required',
                'regex:/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/',
            ],

            'address_detail'   => 'required|string',

            'city_id'             => 'required|string',
            'district_id'         => 'required|string',
            'ward_id'             => 'required|string',

            'shipping_rate_id' => 'required',

            'payment_method'   => 'required|in:cod,vnpay',
            'shipping_fee'     => 'required|numeric',
            'sub_total'        => 'required|numeric',
            'total'            => 'required|numeric',

            'note'             => 'nullable|string',

            'items'            => 'required|array',
        ];
    }

    public function messages()
    {
        return [
            'full_name.required' => 'Vui lòng nhập họ và tên.',

            'phone.required'     => 'Vui lòng nhập số điện thoại.',
            'phone.regex'        => 'Số điện thoại không hợp lệ.',

            'address_detail.required' => 'Vui lòng nhập địa chỉ chi tiết.',

            'city_id.required'      => 'Vui lòng chọn tỉnh/thành.',
            'district_id.required'  => 'Vui lòng chọn quận/huyện.',
            'ward_id.required'      => 'Vui lòng chọn phường/xã.',

            'shipping_rate_id.required' => 'Vui lòng chọn phương thức giao hàng.',

            'payment_method.required' => 'Vui lòng chọn phương thức thanh toán.',
            'payment_method.in'       => 'Phương thức thanh toán không hợp lệ.',

            'shipping_fee.required' => 'Thiếu phí vận chuyển.',
            'shipping_fee.numeric'  => 'Phí vận chuyển phải là số.',

            'sub_total.required'    => 'Thiếu tổng tiền hàng.',
            'sub_total.numeric'     => 'Tổng tiền hàng phải là số.',

            'total.required'        => 'Thiếu tổng giá trị đơn.',
            'total.numeric'         => 'Tổng giá trị đơn phải là số.',

            'items.required'        => 'Giỏ hàng không được để trống.',
            'items.array'           => 'Dữ liệu giỏ hàng không hợp lệ.',
        ];
    }
}
