<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\VnpaySevice;
use App\Services\ProductService;
use App\Services\CategoryService;

class HomeController extends Controller
{
     protected $vnpayService;
     protected $prodctService;
     protected $categoryService;

    public function __construct(VnpaySevice $vnpayService, ProductService $prodctService, CategoryService $categoryService) {
        $this->vnpayService = $vnpayService;
        $this->prodctService = $prodctService;
        $this->categoryService = $categoryService;
    }

    public function getProductHome() {
        $products = $this->prodctService->getProductHome();
        return response()->json([
            'success' => true,
            'data' => $products
        ]);
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
}
