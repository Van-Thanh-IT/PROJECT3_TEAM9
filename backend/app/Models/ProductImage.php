<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Product;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductImage extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $table = "product_images";

    protected $fillable = [
        "product_id",
        "url",
        "is_primary"
    ];
    
    public $timestamps = false;

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    protected $dates = ['deleted_at'];

    public function product(){
       return $this->belongsTo(Product::class, "product_id");
    }
    
}
