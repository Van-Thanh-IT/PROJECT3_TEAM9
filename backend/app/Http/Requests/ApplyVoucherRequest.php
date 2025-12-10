<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ApplyVoucherRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'code' => 'required|string',
            'order_total' => 'required|numeric|min:0'
        ];
    }

    public function messages()
    {
        return [
            'code.required' => 'Vui lòng nhập mã voucher',
            'order_total.required' => 'Thiếu tổng tiền đơn hàng',
        ];
    }
}
