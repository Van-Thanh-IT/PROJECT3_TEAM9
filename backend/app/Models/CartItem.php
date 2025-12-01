<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Cart;
use App\Models\ProductVariant;

class CartItem extends Model
{
    use HasFactory;

    protected $table = 'cart_items';

    protected $fillable = [
        'cart_id',
        'product_variant_id',
        'quantity',
    ];

    public $timestamps = false;

    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class);
    }
}
