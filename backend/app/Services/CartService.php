<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Support\Str;

class CartService
{
    
    public function getCartDetail($userId, $guestId)
    {
        $cart = $this->getOrCreateCart($userId, $guestId)
                    ->load(['items.variant.product']);

        $cart->items->transform(function($item) {
            return [
                'id' => $item->id,
                'quantity' => $item->quantity,
                'variant' => [
                    'id' => $item->variant->id,
                    'size' => $item->variant->size,
                    'color' => $item->variant->color,
                    'price' => $item->variant->price,
                    'product' => [
                        'id' => $item->variant->product->id,
                        'name' => $item->variant->product->name,
                        'slug' => $item->variant->product->slug,
                        'price' => $item->variant->product->price,
                        'old_price' => $item->variant->product->old_price,
                        'image' => $item->variant->product->images->where('is_primary', true)->first()?->url,
                    ]
                ]
            ];
        });

        return $cart;
    }


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

    public function removeOrderedItems(array $productVariantIds)
    {
        $deletedCount = CartItem::whereIn('product_variant_id', $productVariantIds)->delete();

        if ($deletedCount === 0) {
            return [
                'status' => false,
                'message' => 'Không tìm thấy sản phẩm nào trong giỏ hàng để xóa'
            ];
        }

        return [
            'status' => true,
            'message' => "Đã xóa $deletedCount sản phẩm khỏi giỏ hàng"
        ];
    }



   public function updateCartItemQuantity($cartItemId, $quantity)
    {
        $item = CartItem::find($cartItemId);

        if (!$item) {
            return ['status' => false, 'message' => 'Item không tồn tại'];
        }

        $item->quantity = $quantity;
        $item->save();

        return $item;
    }
}
