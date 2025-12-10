<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Address;
use App\Models\Payment;
use App\Models\Cart;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Services\GoshipService;
use App\Services\CartService;
use App\Models\Voucher;
use  Illuminate\Support\Facades\Log;

class OrderService
{
    protected $goshipService;
    protected $cartService;
    protected $inventoryService;

    public function __construct(GoshipService $goshipService, CartService $cartService, InventoryService $inventoryService)
    {
        $this->goshipService = $goshipService;
        $this->cartService = $cartService;
        $this->inventoryService = $inventoryService;
    }


    public function getAll(){
        return Order::all();
    }

    // Lấy chi tiết đơn hàng theo id
    public function getOrderById($id)
{
    $order = Order::with([
        'orderItems:id,order_id,product_variant_id,product_name,color,size,quantity,price',
        'address:id,full_name,phone,address_detail,city,district,ward',
        'voucher:id,name,code,discount_type,discount_value',
        'payment:id,order_id,method,amount,status',
        
        'orderItems.variant.product.images' => function($query) {
            $query->where('is_primary', true)
                  ->select('id', 'product_id', 'url', 'is_primary');
        }
    ])->find($id);

    if (!$order) {
        return response()->json([
            'status' => false,
            'message' => 'Order not found'
        ], 404);
    }

    // Map dữ liệu để bỏ variant & product, chỉ giữ ảnh chính
    $orderData = $order->toArray();

    $orderData['order_items'] = collect($order->orderItems)->map(function($item) {
        $imageUrl = optional($item->variant?->product?->images->first())->url ?? null;

        return [
            'id' => $item->id,
            'order_id' => $item->order_id,
            'product_name' => $item->product_name,
            'color' => $item->color,
            'size' => $item->size,
            'quantity' => $item->quantity,
            'price' => $item->price,
            'image' => $imageUrl 
        ];
    })->all();

    return $orderData;
}



    public function createOrder($data)
    {
        return DB::transaction(function () use ($data) {

            //Lưu địa chỉ
            $address = Address::create([
                'full_name'    => $data['full_name'],
                'phone'        => $data['phone'],
                'address_detail' => $data['address_detail'],
                'city'         => $data['city_name'],     
                'district'     => $data['district_name'], 
                'ward'         => $data['ward_name'],     
            ]);

            $user = auth()->user();
            //Tạo Order Code
            $orderCode = 'ORD-' . date('Ymd') . '-' . strtoupper(Str::random(5));
            $order = Order::create([
                'code'            => $orderCode,
                'user_id'         => $user ? $user->id : null,
                'address_id'      => $address->id,
                'voucher_id'      => $data['voucher_id'] ?? null,
                'total_amount'    => $data['sub_total'],
                'discount_amount' => $data['discount'] ?? 0,
                'shipping_fee'    => $data['shipping_fee'],
                'final_amount'    => $data['total'],
                'note'            => $data['note'] ?? null,
            ]);

            // Lưu Order Items
            foreach ($data['items'] as $item) {
                OrderItem::create([
                    'order_id'           => $order->id,
                    'product_variant_id' => $item['product_variant_id'],
                    'product_name'       => $item['product_name'],
                    'color'              => $item['color'],
                    'size'               => $item['size'],
                    'quantity'           => $item['quantity'],
                    'price'              => $item['price'],
                ]);
            }

            // 5. Lưu Payment
            Payment::create([
                'order_id' => $order->id,
                'method'   => strtoupper($data['payment_method']),
                'amount'   => $data['total'],
                'status'   => 'pending',
            ]);

        
            
            // Chuẩn bị dữ liệu cho Goship 
            $goshipData = [
                'rate_id'        => $data['shipping_rate_id'],
                'name'           => $data['full_name'],
                'phone'          => $data['phone'],
                'address_detail' => $data['address_detail'],
                'city'        => $data['city_id'],      
                'district'    => $data['district_id'],  
                'ward'        => $data['ward_id'],     
                'cod'            => ($data['payment_method'] === 'cod') ? $data['total'] : 0, 
                'amount'         => $data['sub_total'],    // Giá trị hàng hóa
            ];

            // Gọi Service
            $goshipResponse = $this->goshipService->createShipment($goshipData);

            // Cập nhật lại Order với thông tin từ Goship
            if (isset($goshipResponse['id'])) {
                $order->update([
                    'goship_shipment_id' => $goshipResponse['id'],
                    'shipping_carrier'    => $goshipResponse['carrier'],
                    'tracking_number'    => $goshipResponse['carrier_transaction_id'] ?? null, // Mã vận đơn GHN
                    'shipment_status_txt'    => $goshipResponse['shipment_status_txt'],
                    'shipping_status'    => $goshipResponse['shipment_status'], 
                ]);
            }


            $subTotal = array_sum(array_map(fn($item) => $item['quantity'] * $item['price'], $data['items']));
            $discount = $data['discount'] ?? 0;
            $discountRate = $subTotal > 0 ? $discount / $subTotal : 0;

            $exportItems = [];
            foreach ($data['items'] as $item) {
                $finalPrice = $item['price'] * (1 - $discountRate); 
                $exportItems[] = [
                    'variant_id' => $item['product_variant_id'],
                    'quantity'   => $item['quantity'],
                    'price'      => $finalPrice,
                ];
            }

            if (!empty($exportItems)) {
                $exportData = [
                    'items'  => $exportItems,
                    'reason' => 'Xuất kho cho đơn ' . $order->code,
                    'note'   => 'Đơn hàng #' . $order->code
                ];

                $this->inventoryService->exportStock($exportData);
            }


            // Xóa giỏ hàng
            $variantIds = array_column($data['items'], 'product_variant_id');
            $result = $this->cartService->removeOrderedItems($variantIds);
            if (!$result['status']) {
                Log::warning($result['message']);
            }
            
            return $order;
        });


    }
    public function getOrdersByUser()
    {
        $userId = auth()->id();

        $statusTextMap = [
            '900' => 'Đơn mới',
            '901' => 'Chờ lấy hàng',
            '902' => 'Lấy hàng',
            '903' => 'Đã lấy hàng',
            '904' => 'Giao hàng',
            '905' => 'Giao thành công',
            '906' => 'Giao thất bại',
            '907' => 'Đang chuyển hoàn',
            '908' => 'Chuyển hoàn',
            '909' => 'Đã đối soát',
            '910' => 'Đã đối soát khách',
            '911' => 'Đã trả COD cho khách',
            '912' => 'Chờ thanh toán COD',
            '913' => 'Hoàn thành',
            '914' => 'Đơn hủy',
            '915' => 'Chậm lấy/giao',
            '916' => 'Giao hàng một phần',
            '917' => 'Thất lạc hàng',
            '918' => 'Đang lưu kho',
            '919' => 'Đang vận chuyển',
            '1000' => 'Đơn lỗi'
        ];

        $orders = Order::with([
            'orderItems.variant.product.images'
        ])
        ->where('user_id', 5)
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($order) use ($statusTextMap) {

            return [
                'order_id'   => $order->id,
                'code'       => $order->code,
                'total'      => $order->final_amount,
                'status'     => $order->shipping_status,
                'status_txt' => $statusTextMap[$order->shipping_status] ?? 'Không xác định',
                'created_at' => $order->created_at->format('d/m/Y H:i'),

                'items' => $order->orderItems->map(function ($item) {
                    $variant = $item->variant;
                    $product = $variant?->product;

                    // lấy ảnh chính (primary)
                    $primaryImage = $product?->images
                        ->where('is_primary', true)
                        ->first()?->url;

                    return [
                        'product_variant_id' => $item->product_variant_id,
                        'product_name'       => $product?->name,
                        'product_slug'       => $product?->slug,
                        'color'              => $variant?->color,
                        'size'               => $variant?->size,
                        'quantity'           => $item->quantity,
                        'price'              => $item->price,
                        'image'              => $primaryImage,
                    ];
                })
            ];
        });

        return $orders;
    }


    public function getOrderDetail($id)
    {
    

        // Map trạng thái Goship
        $statusTextMap = [
            '900' => 'Đơn mới',
            '901' => 'Chờ lấy hàng',
            '902' => 'Lấy hàng',
            '903' => 'Đã lấy hàng',
            '904' => 'Giao hàng',
            '905' => 'Giao thành công',
            '906' => 'Giao thất bại',
            '907' => 'Đang chuyển hoàn',
            '908' => 'Chuyển hoàn',
            '909' => 'Đã đối soát',
            '910' => 'Đã đối soát khách',
            '911' => 'Đã trả COD cho khách',
            '912' => 'Chờ thanh toán COD',
            '913' => 'Hoàn thành',
            '914' => 'Đơn hủy',
            '915' => 'Chậm lấy/giao',
            '916' => 'Giao hàng một phần',
            '917' => 'Thất lạc hàng',
            '918' => 'Đang lưu kho',
            '919' => 'Đang vận chuyển',
            '1000' => 'Đơn lỗi'
        ];

        $userId = auth()->user()->id;
        $order = Order::with([
            'orderItems',
            'orderItems.variant',
            'orderItems.variant.product',
            'orderItems.variant.product.images',
            'address'
        ])
        ->where('user_id', $userId)
        ->where('id', $id)
        ->first();

        if (!$order) {
            return response()->json(["message" => "Không tìm thấy đơn hàng."], 404);
        }

        $order->shipment_status_txt = $statusTextMap[$order->shipping_status] ?? "Không xác định";

        $orders = [
            "id" => $order->id,
            "code" => $order->code,
            "created_at" => $order->created_at->format("d/m/Y H:i"),
            "shipment_status" => $order->shipping_status,
            "shipment_status_txt" => $order->shipment_status_txt,

            "address" => [
                "name" => $order->address->full_name ?? null,
                "phone" => $order->address->phone ?? null,
                "full_address" => 
                $order->address->city . ", " . $order->address->district . ", " . $order->address->ward ?? null,
            ],

            "shipping" => [
                "carrier" => $order->shipping_carrier,
                "shipping_fee" => $order->shipping_fee,
                "tracking_number" => $order->tracking_number,
            ],

            "payment" => [
                "method" => $order->payment_method ?? "COD",
                "total_amount" => $order->total_amount,
                "discount_amount" => $order->discount_amount,
                "shipping_fee" => $order->shipping_fee,
                "final_amount" => $order->final_amount
            ],

            "items" => $order->orderItems->map(function ($item) {
                $variant = $item->variant;
                $product = $variant->product;

                return [
                    "product_name" => $product->name,
                    "slug" => $product->slug,
                    "color" => $variant->color,
                    "size" => $variant->size,
                    "quantity" => $item->quantity,
                    "price" => $item->price,
                    "image" => $product->images->where('is_primary', 1)->first()->url 
                        ?? $product->images->first()->url 
                        ?? null
                ];
            })
        ];

        return $orders;
    }


    public function cancelOrder($userId, $orderId, $reason = null)
    {
        return DB::transaction(function () use ($userId, $orderId, $reason) { // <-- thêm $reason

            // Lấy đơn hàng
            $order = Order::where('id', $orderId)
                ->where('user_id', $userId)
                ->first();

            if (!$order) {
                throw new \Exception("Không tìm thấy đơn hàng.");
            }

            // Trạng thái không cho hủy
            $notCancelable = ['903','904','905','906','907','908','913'];
            if (in_array($order->shipping_status, $notCancelable)) {
                throw new \Exception("Đơn hàng đã vận chuyển, không thể hủy.");
            }

            // Nếu có Goship shipment → hủy
            if (!empty($order->goship_shipment_id)) {
                $goshipResponse = $this->goshipService->cancelShipment($order->goship_shipment_id);
                Log::info("Hủy Goship: ", (array)$goshipResponse);

                if (!isset($goshipResponse['status']) || $goshipResponse['status'] != 'success') {
                    throw new \Exception("Hủy đơn trên Goship thất bại.");
                }
            }

            // Cập nhật DB
            $order->update([
                "shipping_status" => "914",
                "shipment_status_txt" => "Đơn đã hủy bởi khách",
                "cancel_reason" => $reason
            ]);

            return $order;
        });
    }
}