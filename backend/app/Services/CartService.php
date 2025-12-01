<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Support\Str;

class CartService
{
    public function getOrCreateCart($userId, $guestId)
    {
        $cartKey = $userId ? "user_" . $userId : "guest_" . $guestId;

        return Cart::firstOrCreate(
            ['cart_key' => $cartKey],
            ['user_id' => $userId]
        );
    }

    public function addItems($cartId, $items)
    {
        foreach ($items as $item) {

            $existing = CartItem::where('cart_id', $cartId)
                ->where('product_variant_id', $item['product_variant_id'])
                ->first();

            if ($existing) {
                $existing->quantity += $item['quantity'];
                $existing->save();
            } else {
                CartItem::create([
                    'cart_id' => $cartId,
                    'product_variant_id' => $item['product_variant_id'],
                    'quantity' => $item['quantity']
                ]);
            }
        }
    }

    // MERGE GIỎ HÀNG
    public function mergeCart($userId, $guestId)
    {
        $userCartKey = "user_" . $userId;
        $guestCartKey = "guest_" . $guestId;

        $userCart = Cart::where("cart_key", $userCartKey)->first();
        $guestCart = Cart::where("cart_key", $guestCartKey)->first();

        if (!$guestCart) return;

        if (!$userCart) {
            // Nếu user chưa có giỏ -> chuyển nguyên giỏ guest sang user
            $guestCart->update([
                "cart_key" => $userCartKey,
                "user_id"  => $userId
            ]);
            return;
        }

        // NẾU CẢ 2 GIỎ ĐỀU TỒN TẠI → MERGE
        foreach ($guestCart->items as $gItem) {
            $uItem = CartItem::where('cart_id', $userCart->id)
                ->where('product_variant_id', $gItem->product_variant_id)
                ->first();

            if ($uItem) {
                $uItem->quantity += $gItem->quantity;
                $uItem->save();
            } else {
                CartItem::create([
                    'cart_id' => $userCart->id,
                    'product_variant_id' => $gItem->product_variant_id,
                    'quantity' => $gItem->quantity
                ]);
            }
        }

        // Xóa giỏ guest
        $guestCart->delete();
    }

    public function removeCartItem($id)
    {
        $item = CartItem::find($id);

        if (!$item) {
            return [
                'status' => false,
                'message' => 'Cart item không tồn tại',
            ];
        }

        $item->delete();

        return [
            'status' => true,
            'message' => 'Đã xóa sản phẩm khỏi giỏ hàng',
            'data' => $item
        ];
    }

     public function removeOrderedItems($cartId, array $productVariantIds)
    {
        $cart = Cart::find($cartId);

        if (!$cart) {
            return [
                'status' => false,
                'message' => 'Giỏ hàng không tồn tại'
            ];
        }

        $items = CartItem::where('cart_id', $cartId)
                        ->whereIn('product_variant_id', $productVariantIds)
                        ->get();

        if ($items->isEmpty()) {
            return [
                'status' => false,
                'message' => 'Không tìm thấy sản phẩm nào trong giỏ hàng để xóa'
            ];
        }

        foreach ($items as $item) {
            $item->delete();
        }

        return [
            'status' => true,
            'message' => 'Đã xóa các sản phẩm đã đặt khỏi giỏ hàng',
            'data' => $items
        ];
    }



}
