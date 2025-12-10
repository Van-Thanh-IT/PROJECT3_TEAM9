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
        $userId  = auth()->id();
        $guestId = $request->guest_id;

        $cart = $this->cartService->getCartDetail($userId, $guestId);

        return response()->json([
            'status' => true,
            'data'   => $cart
        ]);
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

    /**
 * Cập nhật số lượng 1 item trong giỏ hàng
 */
    public function updateItemQuantity(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);
        $quantity = $request->input('quantity');
        $item = $this->cartService->updateCartItemQuantity($id, $quantity);

        return response()->json([
            'status' => true,
            'items' =>  $item  
        ], 200);
    }



   
}
