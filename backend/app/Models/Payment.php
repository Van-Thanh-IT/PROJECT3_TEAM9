<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Order;

class Payment extends Model
{
    use HasFactory;

    protected $table = 'payments';

    protected $fillable = [
        'order_id',
        'amount',
        'method',
        'status',
        'transaction_code',
        ' provider_response',
        'created_at',
        'updated_at'
    ];  

    public function orders()
    {
        return $this->belongsTo(Order::class);
    }
}
