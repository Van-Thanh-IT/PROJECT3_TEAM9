<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Facades\JWTAuth;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
     public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = JWTAuth::parseToken()->authenticate();

        $userRoles = $user->roles->pluck('name')->toArray(); // lấy roles từ JWT hoặc DB

        foreach ($roles as $role) {
            if (in_array($role, $userRoles)) {
                return $next($request);
            }
        }
        return response()->json([
            'status' => 'error',
            'message' => 'Bạn không có đủ quyền để truy cập!',
            'code' => 403
        ], 403);
    }
}
