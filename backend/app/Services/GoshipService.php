<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;


class GoshipService
{
    protected $baseUrl;
    protected $token;

    public function __construct()
    {
        $this->baseUrl = "https://sandbox.goship.io/api/v2";
        $this->token = env("GOSHIP_API_TOKEN");
    }

    // Lấy danh sách Thành phố
    public function getCities()
    {
        return Http::withToken($this->token)
            ->get("{$this->baseUrl}/cities")
            ->json();
    }

    // Lấy Quận/Huyện theo city_code
    public function getDistrictsByCity($cityCode)
    {
        return Http::withToken($this->token)
            ->get("{$this->baseUrl}/cities/{$cityCode}/districts")
            ->json();
    }

    // Lấy Phường/Xã theo district_code
    public function getWardsByDistrict($districtCode)
    {
        return Http::withToken($this->token)
            ->get("{$this->baseUrl}/districts/{$districtCode}/wards")
            ->json();
    }

   // ** Tính phí ship & lọc GHN **
    public function calculateShippingFee($data)
    {
        $response = Http::withToken($this->token)
            ->post("{$this->baseUrl}/rates", [
                "shipment" => [
                    "address_from" => [
                        "city" => env("SHOP_CITY_CODE"),
                        "district" => env("SHOP_DISTRICT_CODE"),
                        "ward" => env("SHOP_WARD_CODE"),
                    ],
                    "address_to" => [
                        "city" => $data["city"],
                        "district" => $data["district"],
                        "ward" => $data["ward"],
                    ],
                    "parcel" => [
                        "cod" => $data["cod"],
                        "amount" => $data["amount"],
                        "weight" => $data["weight"],
                        "width" => $data["width"],
                        "height" => $data["height"],
                        "length" => $data["length"],
                    ]
                ]
            ])
            ->json();
            // // Lọc GHN
        $ghn = collect($response["data"])
        ->firstWhere("carrier_name", "Giao Hàng Nhanh (v3)");

        return $ghn;
    }


    //Tạo vận đơn Goship
    public function createShipment($data)
    {
     
        $response = Http::withToken($this->token)
            ->post("{$this->baseUrl}/shipments", [
                "shipment" => [
                    "rate" => $data['rate_id'], // ID gói cước (lấy từ bước tính phí)
                    "payer" => 0, // 0: Người nhận trả phí (nếu COD + Ship), 1: Shop trả
                    
                    // Địa chỉ Shop (Lấy từ .env hoặc config)
                    "address_from" => [
                        "name"     => env("SHOP_NAME", "MyShop"),
                        "phone"    => env("SHOP_PHONE", "0987654321"),
                        "street"   => env("SHOP_ADDRESS", "123 Đường ABC"),
                        "city"     => env("SHOP_CITY_CODE"),
                        "district" => env("SHOP_DISTRICT_CODE"),
                        "ward"     => env("SHOP_WARD_CODE"),
                    ],

                    // Địa chỉ Khách hàng
                    "address_to" => [
                        "name"     => $data['name'],
                        "phone"    => $data['phone'],
                        "street"   => $data['address_detail'],
                        "city"     => $data['city'],    
                        "district" => $data['district'],
                        "ward"     => $data['ward'],   
                    ],

                    // Thông tin kiện hàng
                    "parcel" => [
                        "cod"      => (int)$data['cod'],    // Tiền thu hộ
                        "amount"   => (int)$data['amount'], // Giá trị bảo hiểm
                        "weight"   => 220,
                        "width"    => "1",
                        "height"   => "1",
                        "length"   => "1",
                        "metadata" => "Hàng dễ vỡ, vui lòng nhẹ tay."
                    ]
                ]
            ]);

        if ($response->failed()) {
            // Ném lỗi để OrderService catch được và rollback transaction
            throw new \Exception("Lỗi tạo đơn Goship: " . $response->body());
        }

        return $response->json();
    }

    public function cancelShipment($shipmentId)
    {
        try {
            $response = Http::withToken($this->token)
                ->delete("{$this->baseUrl}/shipments/{$shipmentId}");

            $resJson = $response->json();
            return $resJson;
        } catch (\Exception $e) {
            \Log::error("Lỗi API Goship khi hủy đơn: " . $e->getMessage());
            return [
                "success" => false,
                "message" => "Lỗi kết nối Goship"
            ];
        }
    }



}
