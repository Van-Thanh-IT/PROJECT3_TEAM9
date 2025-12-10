<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    protected $dashboard;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboard = $dashboardService;
    }

     public function summaryTotal()
    {
        return response()->json([
            'status' => true,
            'data'   => $this->dashboard->getSummaryTotal(),
        ]);
    }

    // 1) Summary
    public function summary()
    {
        return response()->json([
            'status' => true,
            'data'   => $this->dashboard->getSummary(),
        ]);
    }

    // 2) Revenue chart
    public function revenue(Request $request)
    {
        $range = $request->get('range', '30days');

        return response()->json([
            'status' => true,
            'data'   => $this->dashboard->getRevenueChart($range),
        ]);
    }

    // 3) Order status
    public function orderStatus(Request $request)
    {
        $range = $request->get('range', '30days');

        return response()->json([
            'status' => true,
            'data'   => $this->dashboard->getOrderStatusChart($range),
        ]);
    }

    // 4) Top products
    public function topProducts(Request $request)
    {
        $range = $request->get('range', '30days');

        return response()->json([
            'status' => true,
            'data'   => $this->dashboard->getTopSellingProducts($range),
        ]);
    }

    // 6) Inventory flow
    public function inventoryFlow(Request $request)
    {
        $range = $request->get('range', '30days');

        return response()->json([
            'status' => true,
            'data'   => $this->dashboard->getInventoryFlow($range),
        ]);
    }

    // 7) Inventory value
    public function inventoryValue()
    {
        return response()->json([
            'status' => true,
            'data'   => $this->dashboard->getInventoryValue(),
        ]);
    }

    // 8) New user chart
    public function newUsers(Request $request)
    {
        $range = $request->get('range', '30days');

        return response()->json([
            'status' => true,
            'data'   => $this->dashboard->getNewUsersChart($range),
        ]);
    }

    // 9) Active users
    public function activeUsers(Request $request)
    {
        $range = $request->get('range', '30days');

        return response()->json([
            'status' => true,
            'data'   => $this->dashboard->getActiveUsers($range),
        ]);
    }

    // 10) Top customers
    public function topCustomers(Request $request)
    {
        $range = $request->get('range', '30days');

        return response()->json([
            'status' => true,
            'data'   => $this->dashboard->getTopCustomers($range),
        ]);
    }

    // 11) Voucher usage
    public function voucherUsage(Request $request)
    {
        $range = $request->get('range', '30days');

        return response()->json([
            'status' => true,
            'data'   => $this->dashboard->getVoucherUsage($range),
        ]);
    }
}
