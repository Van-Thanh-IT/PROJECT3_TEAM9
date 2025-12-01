<?php

namespace App\Services;

use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Tymon\JWTAuth\Facades\JWTAuth;
use Laravel\Socialite\Facades\Socialite;

class AuthService
{
    /**
     * Đăng ký
     */
    public function register($request)
    {
        return DB::transaction(function () use ($request) {

            $user = User::create([
                'username' => $request->username,
                'email'    => $request->email,
                'password' => bcrypt($request->password),
                'phone'    => $request->phone,
            ]);

            $this->assignDefaultRole($user);

            return $user;
        });
    }


    /**
     * Đăng nhập
     */
    public function login($credentials)
    {
        
        return auth()->attempt($credentials);
    }


    /**
     * Quên mật khẩu
     */
    public function forgotPassword($request)
    {
        return Password::sendResetLink(
            $request->only('email')
        );
    }


    /**
     * Reset mật khẩu
     */
    public function resetPassword($request, $logCallback)
    {
        return Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) use ($logCallback) {
                $user->password = Hash::make($password);
                $user->save();
                $logCallback($user);
            }
        );
    }


    /**
     * Đăng nhập Google
     */
    public function loginWithGoogle($token)
    {
        $googleUser = Socialite::driver('google')->stateless()->userFromToken($token);

        $user = User::where('email', $googleUser->getEmail())->first();

        if ($user) {
            $user->update([
                'username' => $googleUser->getName(),
                'provider' => 'google',
                'provider_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
            ]);
        } else {
            $user = User::create([
                'email' => $googleUser->getEmail(),
                'username' => $googleUser->getName(),
                'provider' => 'google',
                'provider_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'password' => bcrypt(uniqid()),
            ]);
        }

        $this->assignDefaultRole($user);

        return JWTAuth::fromUser($user);
    }


    /**
     * Đăng nhập Facebook
     */
    public function loginWithFacebook($token)
    {
        $fbUser = Socialite::driver('facebook')->stateless()->userFromToken($token);

        $user = User::where('provider_id', $fbUser->getId())->first();

        if ($user) {
            $user->update([
                'username' => $fbUser->getName(),
                'provider' => 'facebook',
                'provider_id' => $fbUser->getId(),
                'avatar' => $fbUser->getAvatar(),
            ]);
        } else {
            $user = User::create([
                'email' => $fbUser->getEmail() ?? ($fbUser->getId() . '@facebook.com'),
                'username' => $fbUser->getName(),
                'provider' => 'facebook',
                'provider_id' => $fbUser->getId(),
                'avatar' => $fbUser->getAvatar(),
                'password' => bcrypt(uniqid()),
            ]);
        }

        $this->assignDefaultRole($user);

        return JWTAuth::fromUser($user);
    }


    /**
     * Gán role mặc định
     */
    public function assignDefaultRole(User $user)
    {
        if (!$user->roles()->exists()) {
            $defaultRole = Role::firstOrCreate(
                ['name' => 'user'],
                ['description' => 'Vai trò người dùng']
            );

            $user->roles()->syncWithoutDetaching($defaultRole->id);
        }
    }
}
