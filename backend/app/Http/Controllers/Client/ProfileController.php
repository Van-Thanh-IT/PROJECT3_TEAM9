<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\UserService;
use App\Services\ProductService;
use App\Services\OrderService;
use App\Models\User;


class ProfileController extends Controller
{

    protected $userService;
    protected $orderService;
    protected $productService;


    public function __construct( UserService $userService,
        ProductService $productService, OrderService $orderService)
    {
        $this->userService = $userService;
        $this->orderService = $orderService;
        $this->productService = $productService;
    }

    public function update(Request $request)
    {
        $userId = auth()->user()->id;

        $profile = $this->userService->update($userId, $request->only([
            'username','phone', 'gender', 'avatar', 'date_of_birth'
        ]));

        return response()->json([
            'status' => 'success',
            'message' => 'Cập nhật thông tin thành công',
            'user' => $profile
        ]);
    }

    public function getOrdersByUser()
    {
        $orders = $this->orderService->getOrdersByUser();
         return response()->json([
            'status' => 'success',
            'data' => $orders
        ]);
        
    }

    public function getOrderDetail($orderId)
    {
        $order = $this->orderService->getOrderDetail($orderId);
        return response()->json([
            'status' => 'success',
            'data' => $order
        ]);
    }

   public function cancelOrder(Request $request, $orderId)
    {
        $userId = auth()->user()->id;
        $reason = $request->input('reason');

        try {
            $order = $this->orderService->cancelOrder($userId, $orderId, $reason);

            return response()->json([
                "status" => "success",
                "message" => "Hủy đơn hàng thành công.",
                "order_id" => $order->id,
                "cancel_reason" => $order->cancel_reason
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                "status" => "error",
                "message" => $e->getMessage()
            ], 400);
        }

    }

    public function createReview(Request $request) {
        $review = $this->prodctService->createReview($request);
        return response()->json($review);
    }


}
