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
        return $this->belongsTo(Product::class, "product_id");
    }

    public function stock()
    {
        return $this->hasOne(ProductStock::class, 'product_variant_id');
    }

    public function inventoryHistories()
    {
        return $this->hasMany(InventoryHistory::class, 'product_variant_id');
    }

    public function inventoryNoteDetails()
    {
        return $this->hasMany(InventoryNoteDetail::class, 'product_variant_id');
    }

}
