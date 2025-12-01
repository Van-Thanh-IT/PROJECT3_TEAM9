<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;
use App\Models\Product;

class Brand extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $table = 'brands';

    protected $fillable = ['name', 'slug', 'logo', 'description'];
    
    protected $dates = ['deleted_at'];

    public $timestamps = false;

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    protected static function booted()
    {
        static::deleting(function ($brand) {
            $brand->products()->delete(); // soft delete các product liên quan
        });
    }
}
