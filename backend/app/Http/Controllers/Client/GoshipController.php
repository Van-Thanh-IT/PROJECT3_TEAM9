<?php

namespace App\Http\Controllers\Client;

use App\Services\GoshipService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class GoshipController extends Controller
{
    protected $goship;

    public function __construct(GoshipService $goship)
    {
        $this->goship = $goship;
    }

    // Lấy danh sách Thành phố
    public function cities()
    {
        return response()->json($this->goship->getCities());
    }

    // Lấy Quận/Huyện theo city_code
    public function districts($cityCode)
    {
        return response()->json($this->goship->getDistrictsByCity($cityCode));
    }

    // Lấy Xã/Phường theo district_code
    public function wards($districtCode)
    {
        return response()->json($this->goship->getWardsByDistrict($districtCode));
    }

     //API tính phí ship
    public function shippingFee(Request $request)
    {
        $data = $request->validate([
            "city" => "required",
            "district" => "required",
            "ward" => "required",

            "cod" => "required|numeric",
            "amount" => "required|numeric",
            "weight" => "required|numeric",
            "width" => "required|numeric",
            "height" => "required|numeric",
            "length" => "required|numeric",
        ]);

        $result = $this->goship->calculateShippingFee($data);

        return response()->json([
            "status" => "success",
            "data" => $result,
        ], 200);
    }


    public function webhook(Request $request)
    {

        $event = $request->input('event');
        $data = $request->input('data');

        if (!$data || !isset($data['id'])) {
            return response()->json(['status' => 'error', 'message' => 'Invalid data'], 400);
        }

        $goshipId = $data['id'];
        $order = \App\Models\Order::where('goship_shipment_id', $goshipId)->first();

        if ($order) {
            // status của Goship: picking, picking_success, delivering, delivered, return, returning, returned
            $newStatus = $data['status']; 

            // Cập nhật trạng thái
            $order->update([
                'shipping_status' => $newStatus,
                'tracking_number' => $data['carrier_transaction_id'] ?? $order->tracking_number, // Cập nhật mã vận đơn nếu có
            ]);

            if ($newStatus == 'delivered' && $order->payment && $order->payment->method == 'COD') {
                $order->payment->update(['status' => 'completed']);
            }

            return response()->json(['status' => 'success', 'message' => 'Order updated'], 200);
        }

        return response()->json(['status' => 'error', 'message' => 'Order not found'], 404);
    }

}
