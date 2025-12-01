<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\CartItem;

class Cart extends Model
{
    use HasFactory;

    protected $table = 'carts';

    protected $fillable = [
        'user_id',
        'cart_key'
    ];

    public function items()
    {
        return $this->hasMany(CartItem::class);
    }

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    // ProductVariant.php
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // Product.php
    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

}
