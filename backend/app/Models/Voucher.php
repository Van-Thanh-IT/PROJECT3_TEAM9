<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Voucher extends Model
{
    use SoftDeletes;

    protected $table = 'vouchers';

    protected $fillable = [
        'name',
        'code',
        'discount_type',
        'discount_value',
        'min_order_value',
        'start_date',
        'end_date',
        'usage_limit', 'used_count'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    public $timestamps = false;

    public function orders()
    {
        return $this->belongsToMany(Order::class);
    }


}
