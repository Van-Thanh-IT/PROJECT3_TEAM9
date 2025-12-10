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
        'address_detail',
        'city',
        'district',
        'ward'
    ];

    public $timestamps = false;


    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
