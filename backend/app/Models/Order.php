<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\OrderItem;
use App\Models\User;
use App\Models\Voucher;
use App\Models\Address;
use App\Models\Payment;

class Order extends Model
{
    use HasFactory;

    protected $table = 'orders';

     protected $fillable = [
        'code',
        'user_id',
        'address_id',
        'voucher_id',
        'total_amount',
        'discount_amount',
        'final_amount',

        'goship_shipment_id',
        'shipping_fee',
        'shipping_carrier',
        'tracking_number',
        'shipping_status',
        'shipment_status_txt',

        'cancel_reason',
        'note',
        'created_at',
        'updated_at',

    ];


    public function orderItems() {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function address() {
        return $this->belongsTo(Address::class);
    }

    public function voucher() {
        return $this->belongsTo(Voucher::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }
 
}
