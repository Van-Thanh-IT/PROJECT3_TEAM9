<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryHistory extends Model
{
    protected $table = 'inventory_history';

    protected $fillable = [
        'product_variant_id',
        'previous_quantity',
        'change_amount',
        'new_quantity',
        'reference_type',
        'reference_id',
        'note'
    ];

    public $timestamps = false;

    // Lịch sử thuộc về 1 variant
    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }
}
