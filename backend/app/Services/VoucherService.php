<?php

namespace App\Services;

use App\Models\Voucher;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
class VoucherService
{
    public function getAll()
    {
        return Voucher::orderBy('id', 'desc')->get();
    }

    public function store($data)
    {
        if (empty($data['code'])) {
            $data['code'] = 'SALE-' . strtoupper(Str::random(8));
        }
        return Voucher::create($data);
    }

    public function update($id, $data)
    {
        $voucher = Voucher::findOrFail($id);
        $voucher->update($data);

        return $voucher;
    }

    public function softDelete($id)
    {
        $voucher = Voucher::findOrFail($id);
        $voucher->delete();
    }

    public function restore($id)
    {
        return Voucher::withTrashed()->findOrFail($id)->restore();
    }

    public function applyVoucher($code, $orderTotal)
    {
        $voucher = Voucher::where('code', $code)->first();

        if (!$voucher) return ["error" => "Voucher không tồn tại"];

        $now = Carbon::now();

        if ($now < $voucher->start_date || $now > $voucher->end_date) {
            return ["error" => "Voucher đã hết hạn"];
        }

        if ($orderTotal < $voucher->min_order_value) {
            return ["error" => "Chưa đạt giá trị đơn tối thiểu"];
        }

        if ($voucher->usage_limit > 0 && $voucher->used_count >= $voucher->usage_limit) {
            return ["error" => "Voucher đã hết lượt sử dụng"];
        }

        $discount = $voucher->discount_type === "percent"
            ? $orderTotal * ($voucher->discount_value / 100)
            : $voucher->discount_value;

        $voucher->used_count += 1;
        $voucher->save();

        return [
            "voucher" => $voucher,
            "discount" => $discount
        ];
    }

}
