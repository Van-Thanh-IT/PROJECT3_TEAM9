<?php

namespace App\Services;

use App\Models\Order;

class OrderService
{
    public function getAll()
    {
        return Order::with(['user', 'orderItems'])->get();
    }
}