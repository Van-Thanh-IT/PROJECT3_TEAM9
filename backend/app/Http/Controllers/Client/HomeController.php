<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\VnpaySevice;
use App\Services\ProductService;
use App\Services\CategoryService;
use App\Services\OrderService;
use App\Services\VoucherService;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\ApplyVoucherRequest;


class HomeController extends Controller
{
     protected $vnpayService;
     protected $prodctService;
     protected $categoryService;
     protected $orderService;
     protected $voucherService;

    public function __construct(
        VnpaySevice $vnpayService,
        ProductService $prodctService,
        CategoryService $categoryService,
        OrderService $orderService,
        VoucherService $voucherService
    ) {
        $this->vnpayService = $vnpayService;
        $this->prodctService = $prodctService;
        $this->categoryService = $categoryService;
        $this->orderService = $orderService;
        $this->voucherService = $voucherService;
    }

    public function getProductHome() {
        $products = $this->prodctService->getProductHome();
        return response()->json($products);
    }

    public function getBestSellingProduct() {
        $products = $this->prodctService->getBestSelling();
        return response()->json($products);
    }

    public function getProductReviewsForHome() {
        $products = $this->prodctService->getProductReviewsForHome();
        return response()->json($products);
    
    }



    public function getProductDetail($slug) {
        $product = $this->prodctService->getProductDetail($slug);
        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }

     public function getProductsByCategorySlug($slug)
    {
        try {
            $products = $this->categoryService->getProductsByCategorySlug($slug);

            return response()->json([
                'error' => false,
                'data' => $products
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'error' => true,
                'message' => 'Danh mục không tồn tại!'
            ], 404);
        }
    }

    public function search(Request $request){
        $product = $this->prodctService->search($request);
        return response()->json($product);
    }
    
    public function payment(Request $request) {
        $vnpayReturn = $this->vnpayService->createPayment($request);
        return $vnpayReturn;
    }

    public function createOrder(StoreOrderRequest $request)
    {
        try {
            $order = $this->orderService->createOrder($request);

            return response()->json([
                'status' => 'success',
                'data' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apply(ApplyVoucherRequest $request)
    {
        $code = $request->code;
        $orderTotal = $request->order_total;

        $result = $this->voucherService->applyVoucher($code, $orderTotal);

        return response()->json($result);
    }
}
