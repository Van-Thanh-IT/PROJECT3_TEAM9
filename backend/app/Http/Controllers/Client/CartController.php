<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\CartService;
use App\Models\Cart;
use Illuminate\Support\Str;

class CartController extends Controller
{
    protected $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }


    public function getCart(Request $request)
    {
        $userId = auth()->id();
        $guestId = $request->guest_id;

        $cart = $this->cartService->getOrCreateCart($userId, $guestId);

        return Cart::with('items.variant.product')->find($cart->id);
    }

    /**
     * Thêm item vào giỏ hàng
     */
    public function addItems(Request $request)
    {
        $request->validate([
            "items" => "required|array|min:1",
            "items.*.product_variant_id" => "required|exists:product_variants,id",
            "items.*.quantity" => "required|integer|min:1"
        ]);

        $userId = auth()->id();
        $guestId = $request->guest_id ?? Str::uuid()->toString();

        $cart = $this->cartService->getOrCreateCart($userId, $guestId);

        $this->cartService->addItems($cart->id, $request->items);

        return response()->json([
            "status" => true,
            "cart_id" => $cart->id,
            "guest_id" => $guestId,
            "message" => "Thêm vào giỏ hàng thành công"
        ]);
    }

    public function merge(Request $request)
    {
        if (!auth()->check()) {
            return response()->json(["message" => "Bạn chưa đăng nhập"], 401);
        }

        $this->cartService->mergeCart(auth()->id(), $request->guest_id);

        return response()->json([
            "status" => true,
            "message" => "Merge giỏ hàng thành công"
        ]);
    }

        // Xóa 1 item
    public function removeItem($id)
    {
        $res = $this->cartService->removeCartItem($id);
        return response()->json($res);
    }

    // Xóa nhiều item sau khi đặt hàng
    public function removeOrderedItems(Request $request)
    {
        $cartId = $request->input('cart_id');
        $productVariantIds = $request->input('product_variant_ids', []);

        $res = $this->cartService->removeOrderedItems($cartId, $productVariantIds);

        return response()->json($res);
    }


   
}
