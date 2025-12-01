<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Address extends Model
{
    use HasFactory;

    protected $table = 'addresses';

    protected $fillable = [
        'user_id',
        'full_name',
        'phone',
        'address_line',
        'city',
        'district',
        'ward',
        'is_default',
    ];

    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // public function orders()
    // {
    //     return $this->hasMany(Order::class);
    // }
}
