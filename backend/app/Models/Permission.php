<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Permission extends Model
{
    use HasFactory;

    protected $table = 'permissions';

    protected $fillable = [
        'name',
        'description'
    ];

    public $timestamps = false;

    public function users()
    {
        return $this->belongsToMany(User::class);
    }

}
