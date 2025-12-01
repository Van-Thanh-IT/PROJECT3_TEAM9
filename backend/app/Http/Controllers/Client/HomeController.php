<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\VnpaySevice;
use App\Services\ProductService;

class HomeController extends Controller
{
     protected $vnpayService;
     protected $prodctService;

    public function __construct(VnpaySevice $vnpayService, ProductService $prodctService) {
        $this->vnpayService = $vnpayService;
        $this->prodctService = $prodctService;
    }

    public function getProductHome() {
        $products = $this->prodctService->getProductHome();
        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }

    public function getProductDetail($id) {
        $product = $this->prodctService->getProductDetail($id);
        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }
    
    public function payment(Request $request) {
        $vnpayReturn = $this->vnpayService->createPayment($request);
        return $vnpayReturn;
    }
}
