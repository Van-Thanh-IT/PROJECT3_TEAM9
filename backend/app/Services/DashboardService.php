<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DashboardService
{

   public function getSummaryTotal()
    {
        $invalidStatuses = ['914', '906', '1000'];

        return [
          
            'total_orders' => DB::table('orders')->count(),

          
            'total_revenue' => DB::table('orders')
                ->whereNotIn('shipping_status', $invalidStatuses)
                ->sum('final_amount'),

            'total_products_sold' => DB::table('order_items')
                ->join('orders', 'orders.id', '=', 'order_items.order_id')
                ->whereNotIn('orders.shipping_status', $invalidStatuses)
                ->sum('order_items.quantity'),

       
            'total_users' => DB::table('users')->count(),

            'total_canceled_orders' => DB::table('orders')
                ->where('shipping_status', '914')
                ->count()
        ];
    }

    public function getSummary()
    {
        $today = Carbon::today();

        return [
            'orders_today' => DB::table('orders')
                ->whereDate('created_at', $today)
                ->count(),

            'revenue_today' => DB::table('orders')
                ->whereDate('created_at', $today)
                ->sum('final_amount'),

            'products_sold_today' => DB::table('order_items')
                ->join('orders', 'orders.id', '=', 'order_items.order_id')
                ->whereDate('orders.created_at', $today)
                ->sum('order_items.quantity'),

            'new_users_today' => DB::table('users')
                ->whereDate('created_at', $today)
                ->count(),

            'shipping_orders' => DB::table('orders')
                ->where('shipping_status', 904)
                ->count(),

            'cancel_today' => DB::table('orders')
                ->whereDate('created_at', $today)
                ->whereNotNull('cancel_reason')
                ->count(),

            'low_stock_products' => DB::table('product_stocks')
                ->where('quantity', '<=', 5)
                ->count(),

            'completed_orders_today' => DB::table('orders')
                ->whereDate('created_at', $today)
                ->whereIn('shipping_status', [905, 913])
                ->count(), // Đơn đã giao thành công / hoàn tất
        ];
    }

    public function getRevenueChart($range)
    {
        [$start, $end] = $this->resolveDateRange($range);

        return DB::table('orders')
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(final_amount) as total')
            )
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('date')
            ->orderBy('date')
            ->limit(15)
            ->get();
    }

    public function getOrderStatusChart($range)
    {
        [$start, $end] = $this->resolveDateRange($range);

        return DB::table('orders')
            ->select('shipping_status', DB::raw('COUNT(*) as total'))
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('shipping_status')
            ->get();
    }

    public function getTopSellingProducts($range)
    {
        [$start, $end] = $this->resolveDateRange($range);

        return DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->select(
                'product_name',
                'color',
                'size',
                DB::raw('SUM(order_items.quantity) as total_sold')
            )
            ->whereBetween('orders.created_at', [$start, $end])
            ->groupBy('product_variant_id', 'product_name', 'color', 'size')
            ->orderByDesc('total_sold')
            ->limit(10)
            ->get();
    }


    public function getInventoryFlow($range)
    {
        [$start, $end] = $this->resolveDateRange($range);

        return DB::table('inventory_history')
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(CASE WHEN change_amount > 0 THEN change_amount ELSE 0 END) as import_qty'),
                DB::raw('SUM(CASE WHEN change_amount < 0 THEN ABS(change_amount) ELSE 0 END) as export_qty')
            )
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }


    public function getInventoryValue()
    {
        return DB::table('product_stocks as ps')
            ->join('product_variants as pv', 'pv.id', '=', 'ps.product_variant_id')
            ->select(DB::raw('SUM(ps.quantity * pv.price) as total_value'))
            ->first();
    }


    public function getNewUsersChart($range)
    {
        [$start, $end] = $this->resolveDateRange($range);

        return DB::table('users')
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total')
            )
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    
    public function getActiveUsers($range)
    {
        [$start, $end] = $this->resolveDateRange($range);

        return DB::table('users')
            ->whereBetween('last_login', [$start, $end])
            ->count();
    }

    public function getTopCustomers($range)
    {
        [$start, $end] = $this->resolveDateRange($range);

        return DB::table('orders as o')
            ->join('users as u', 'u.id', '=', 'o.user_id')
            ->select(
                'o.user_id',
                'u.username',
                'u.email',
                'u.phone',
                DB::raw('SUM(o.final_amount) as total_spent')
            )
            ->whereBetween('o.created_at', [$start, $end])
            ->groupBy('o.user_id', 'u.username', 'u.email', 'u.phone')
            ->orderByDesc('total_spent')
            ->limit(10)
            ->get();
    }


    public function getVoucherUsage($range)
    {
        [$start, $end] = $this->resolveDateRange($range);

        return DB::table('orders')
            ->select(
                'voucher_id',
                DB::raw('COUNT(*) as used'),
                DB::raw('SUM(discount_amount) as total_discount')
            )
            ->whereNotNull('voucher_id')
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('voucher_id')
            ->get();
    }

   private function resolveDateRange($range)
    {
    
        if (is_string($range) && str_starts_with($range, '{')) {
            $decoded = json_decode($range, true); // Decode thành mảng
            
            // Kiểm tra sau khi decode có phải mảng hợp lệ không
            if (is_array($decoded) && isset($decoded['start']) && isset($decoded['end'])) {
                return [
                    Carbon::parse($decoded['start'])->startOfDay(),
                    Carbon::parse($decoded['end'])->endOfDay()
                ];
            }
        }

        // 2. Xử lý nếu $range là mảng (Trường hợp gọi nội bộ)
        if (is_array($range) && isset($range['start']) && isset($range['end'])) {
            return [
                Carbon::parse($range['start'])->startOfDay(),
                Carbon::parse($range['end'])->endOfDay()
            ];
        }

        // 3. Xử lý các từ khóa (today, 7days,...)
        switch ($range) {
            case 'today':
                return [Carbon::today(), Carbon::today()->endOfDay()];

            case 'yesterday':
                return [Carbon::yesterday()->startOfDay(), Carbon::yesterday()->endOfDay()];

            case '7days':
                return [Carbon::today()->subDays(6)->startOfDay(), Carbon::today()->endOfDay()];

            case '30days':
                return [Carbon::today()->subDays(29)->startOfDay(), Carbon::today()->endOfDay()];

            case '90days':
                return [Carbon::today()->subDays(89)->startOfDay(), Carbon::today()->endOfDay()];
            
            case 'this_month':
                return [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()];

            case 'last_month':
                return [Carbon::now()->subMonth()->startOfMonth(), Carbon::now()->subMonth()->endOfMonth()];

            default:
                return [Carbon::today()->subDays(29)->startOfDay(), Carbon::today()->endOfDay()];
        }
    }
}
