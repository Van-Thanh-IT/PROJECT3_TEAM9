<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Notifications\Notifiable;
use App\Notifications\ResetPasswordNotification;
use App\Models\Address;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $table = "users";

    protected $fillable = [
        'username', 'email', 'password', 'phone',
        'provider', 'provider_id', 'avatar',
        'status', 'gender', 'date_of_birth'
    ];

    protected $hidden = ['roles', 'permissions', 'pivot', 'password'];

    /**
     * Gửi email reset password
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles', 'user_id', 'role_id');
    }

    public function permissions()
    {
        // Lấy tất cả permission từ role
        return $this->roles()->with('permissions')->get()
            ->pluck('permissions')
            ->flatten()
            ->unique('id');
    }

    public function hasRole(string $role): bool
    {
        return $this->roles()->pluck('name')->contains($role);
    }

    public function hasPermission(string $permissionName): bool
    {
        $permissions = $this->permissions()->pluck('name');

        return $permissions->contains($permissionName);
    }

    /**
     * JWT
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [
            'username'    => $this->username,
            'roles'       => $this->roles->pluck('name'),
            'permissions' => $this->permissions()->pluck('name'),
        ];
    }


    public function supportTickets()
    {
        return $this->hasMany(SupportTicket::class);
    }

    public function supportMessages()
    {
        return $this->hasMany(SupportMessage::class, 'sender_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

}
