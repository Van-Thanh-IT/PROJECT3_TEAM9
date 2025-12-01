<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class UserLog extends Model
{
    use HasFactory;

    protected $table = 'user_logs';

    protected $fillable = [
        'user_id',
        'action',
        'ip_address',
        'user_agent'
    ];

    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
