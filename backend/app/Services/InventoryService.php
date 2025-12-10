<?php

namespace App\Services;

use App\Models\ProductStock;
use App\Models\InventoryNote;
use App\Models\InventoryNoteDetail;
use App\Models\InventoryHistory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\ProductVariant;
use App\Exceptions\BadRequestException;

class InventoryService
{

public function getAll()
{
    $stocks = ProductStock::with(['variant.product.images'])
        ->orderBy('product_variant_id')
        ->get();

    return $stocks->map(function($stock) {
      $lastNoteDetail = $stock->variant->inventoryNoteDetails()
        ->join('inventory_notes', 'inventory_notes.id', '=', 'inventory_note_details.inventory_note_id')
        ->orderBy('inventory_notes.created_at', 'desc')
        ->first();

        return [
            'id' => $stock->id,
            'quantity' => $stock->quantity,
            'variant_id' => $stock->product_variant_id,
            'last_note_id' => $lastNoteDetail->inventory_note_id ?? null, // id phiếu gần nhất
            'variant' => [
                'id' => $stock->variant->id,
                'color' => $stock->variant->color,
                'size' => $stock->variant->size,
                'sku' => $stock->variant->sku,
                'price' => $stock->variant->price,
                'image' => optional(
                    $stock->variant->product->images->where('is_primary', 1)->first()
                )->url ?? '',
                'product' => [
                    'id' => $stock->variant->product->id,
                    'name' => $stock->variant->product->name,
                    'slug' => $stock->variant->product->slug,
                    'price' => $stock->variant->product->price,
                    'old_price' => $stock->variant->product->old_price,
                    'status' => $stock->variant->product->status,
                ]
            ]
        ];
    });
}



    public function getNoteDetail($noteId)
    {
        return InventoryNote::with('details.variant.product')
            ->findOrFail($noteId);
    }



    /**
     * NHẬP KHO
     */
    public function importStock($data)
    {
        return DB::transaction(function () use ($data) {

            if (empty($data['items']) || !is_array($data['items'])) {
                throw new BadRequestException("Danh sách sản phẩm nhập kho không hợp lệ.");
            }

            if (empty($data['supplier_name'])) {
                throw new BadRequestException("Tên nhà cung cấp không được để trống.");
            }

            $userId = Auth::id();

            $note = InventoryNote::create([
                'code'          => 'NK-' . now()->format('YmdHis'),
                'type'          => 'IMPORT',
                'reason'        => $data['reason'] ?? 'Nhập hàng',
                'user_id'       => $userId,
                'supplier_name' => $data['supplier_name'],
                'total_amount'  => 0,
                'note'          => $data['note'] ?? null,
            ]);

            $totalAmount = 0;

            foreach ($data['items'] as $item) {

                if (!isset($item['variant_id'], $item['quantity'], $item['price'])) {
                    throw new BadRequestException("Thiếu dữ liệu trong item nhập kho.");
                }

                if ($item['quantity'] <= 0) {
                    throw new BadRequestException("Số lượng nhập phải lớn hơn 0.");
                }

                if ($item['price'] < 0) {
                    throw new BadRequestException("Giá nhập không hợp lệ.");
                }

                $variantId = $item['variant_id'];

                if (!ProductVariant::where('id', $variantId)->exists()) {
                    throw new BadRequestException("Variant ID {$variantId} không tồn tại.");
                }

                $stock = ProductStock::firstOrCreate(
                    ['product_variant_id' => $variantId],
                    ['quantity' => 0]
                );

                $previous = $stock->quantity;
                $newQty = $previous + $item['quantity'];

                $stock->update(['quantity' => $newQty]);

                InventoryNoteDetail::create([
                    'inventory_note_id' => $note->id,
                    'product_variant_id'=> $variantId,
                    'quantity'          => $item['quantity'],
                    'price'             => $item['price']
                ]);

                InventoryHistory::create([
                    'product_variant_id' => $variantId,
                    'previous_quantity'  => $previous,
                    'change_amount'      => $item['quantity'],
                    'new_quantity'       => $newQty,
                    'reference_type'     => 'IMPORT',
                    'reference_id'       => $note->id,
                    'note'               => 'Nhập kho'
                ]);

                $totalAmount += ($item['quantity'] * $item['price']);
            }

            $note->update(['total_amount' => $totalAmount]);

            return $note;
        });
    }

    /**
     * XUẤT KHO
     */
   public function exportStock($data)
    {
        return DB::transaction(function () use ($data) {

            if (empty($data['items']) || !is_array($data['items'])) {
                throw new BadRequestException("Danh sách xuất kho không hợp lệ.");
            }

            $userId = Auth::id();

            $note = InventoryNote::create([
                'code'     => 'XK-' . time(),
                'type'     => 'EXPORT',
                'reason'   => $data['reason'] ?? 'Xuất hàng',
                'user_id'  => $userId,
                'note'     => $data['note'] ?? null,
                'total_amount' => 0,
            ]);

            $totalAmount = 0;
            foreach ($data['items'] as $item) {

                if (!isset($item['variant_id'], $item['quantity'])) {
                    throw new BadRequestException("Thiếu dữ liệu xuất kho.");
                }

                if ($item['quantity'] <= 0) {
                    throw new BadRequestException("Số lượng xuất phải lớn hơn 0.");
                }

                $variantId = $item['variant_id'];
                $quantity  = $item['quantity'];
                $price     = $item['price'] ?? 0;

                $stock = ProductStock::where('product_variant_id', $variantId)->first();

                if (!$stock) {
                    throw new BadRequestException("Variant ID {$variantId} chưa có tồn kho.");
                }

                if ($stock->quantity < $quantity) {
                    throw new BadRequestException("Không đủ tồn kho để xuất.");
                }

                $previous = $stock->quantity;
                $newQty = $previous - $quantity;

                $stock->update(['quantity' => $newQty]);

                InventoryNoteDetail::create([
                    'inventory_note_id' => $note->id,
                    'product_variant_id'=> $variantId,
                    'quantity'          => $quantity,
                    'price'             => $price
                ]);

                InventoryHistory::create([
                    'product_variant_id' => $variantId,
                    'previous_quantity'  => $previous,
                    'change_amount'      => -$quantity,
                    'new_quantity'       => $newQty,
                    'reference_type'     => 'EXPORT',
                    'reference_id'       => $note->id,
                    'note'               => 'Xuất kho'
                ]);

               
                $totalAmount += $quantity * $price;
            }

            $note->update(['total_amount' => $totalAmount]);

            return $note;
        });
    }


    /**
     * ĐIỀU CHỈNH TỒN KHO
     */
    public function adjustStock($data)
    {
        return DB::transaction(function () use ($data) {

            if (!isset($data['variant_id'], $data['adjust_quantity'])) {
                throw new BadRequestException("Dữ liệu điều chỉnh tồn kho không hợp lệ.");
            }

            if ($data['adjust_quantity'] == 0) {
                throw new BadRequestException("Số lượng điều chỉnh không được bằng 0.");
            }

            if (!ProductVariant::where('id', $data['variant_id'])->exists()) {
                throw new BadRequestException("Variant ID không tồn tại.");
            }

            $variantId = $data['variant_id'];
            $adjust    = $data['adjust_quantity'];
            $reason    = $data['reason'] ?? 'Điều chỉnh tồn kho';
            $userId    = Auth::id();

            $stock = ProductStock::firstOrCreate(
                ['product_variant_id' => $variantId],
                ['quantity' => 0]
            );

            $previous = $stock->quantity;
            $newQty = $previous + $adjust;

            if ($newQty < 0) {
                throw new BadRequestException("Điều chỉnh khiến tồn kho âm.");
            }

            $stock->update(['quantity' => $newQty]);

            $note = InventoryNote::create([
                'code'        => 'ADJ-' . time(),
                'type'        => 'ADJUST',
                'reason'      => $reason,
                'user_id'     => $userId,
                'total_amount'=> 0,
                'note'        => $data['note'] ?? null
            ]);

            InventoryNoteDetail::create([
                'inventory_note_id' => $note->id,
                'product_variant_id'=> $variantId,
                'quantity'          => $adjust,
                'price'             => 0
            ]);

            InventoryHistory::create([
                'product_variant_id' => $variantId,
                'previous_quantity'  => $previous,
                'change_amount'      => $adjust,
                'new_quantity'       => $newQty,
                'reference_type'     => 'ADJUST',
                'reference_id'       => $note->id,
                'note'               => $reason
            ]);

            return $note;
        });
    }

    /**
     * LỊCH SỬ
     */
    public function getVariantHistory($variantId)
    {
        return InventoryHistory::where('product_variant_id', $variantId)
            ->orderBy('created_at', 'desc')
             ->limit(20)
            ->get();
    }
}
