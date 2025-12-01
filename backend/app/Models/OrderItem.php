<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Order;
use App\Models\ProductVariant;

class OrderItem extends Model
{
    use HasFactory;

    protected $table = 'order_items';

    protected $fillable = [
        'order_id',
        'product_variant_id',
        'product_name',
        'color',
        'size',
        'quantity',
        'price',
        'created_at',
        'updated_at'
    ];

    public function order() {
        return $this->belongsTo(Order::class);
    }

    public function productVariant() {
        return $this->belongsTo(ProductVariant::class);
    }
}
