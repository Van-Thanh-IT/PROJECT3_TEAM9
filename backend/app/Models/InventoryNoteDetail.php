<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryNoteDetail extends Model
{
    protected $table = 'inventory_note_details';

    protected $fillable = [
        'inventory_note_id',
        'product_variant_id',
        'quantity',
        'price'
    ];

    public $timestamps = false;

    // Mỗi dòng chi tiết thuộc về 1 phiếu kho
    public function inventoryNote()
    {
        return $this->belongsTo(InventoryNote::class, 'inventory_note_id');
    }

    // Dòng chi tiết thuộc về 1 variant
    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }
}