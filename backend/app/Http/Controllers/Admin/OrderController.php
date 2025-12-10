<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\OrderService;

class OrderController extends Controller
{
    protected $orderService;
    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    public function index()
    {
        $orders = $this->orderService->getAll();
        return response()->json([
            'status' => true,
            'data' => $orders
        ]);
    }

    public function show($id)
    {
        $order = $this->orderService->getOrderById($id);
        return response()->json([
            'status' => true,
            'data' => $order
        ]);
    }

}
