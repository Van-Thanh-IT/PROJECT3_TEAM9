<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Product;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductVariant extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'product_variants';

    protected $fillable = [
        'product_id',
        'color',
        'size',
        'sku',
        'price'

    ];

    public $timestamps = false;

    protected $dates = ['deleted_at'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
