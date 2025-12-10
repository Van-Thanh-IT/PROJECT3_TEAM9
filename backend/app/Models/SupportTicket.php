<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupportTicket extends Model
{
    use HasFactory;

    protected $table = 'support_tickets';

    protected $fillable = [
        'user_id',
        'email',
        'order_id',
        'subject',
        'status',
    ];

    // Ticket thuộc về 1 user (nếu có)
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Ticket thuộc về 1 đơn hàng (nếu có)
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    // Ticket có nhiều message
    public function messages()
    {
        return $this->hasMany(SupportMessage::class, 'ticket_id');
    }
}
