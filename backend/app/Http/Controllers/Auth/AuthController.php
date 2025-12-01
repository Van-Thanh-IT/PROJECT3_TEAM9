<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\Request;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\ResetPasswordRequest;
use Symfony\Component\HttpFoundation\Response;
use App\Traits\LogUserAction;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    use LogUserAction;

    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    // Đăng ký
    public function register(RegisterRequest $request)
    {
        $this->authService->register($request);

        return response()->json([
            'message' => 'Đăng ký thành công'
        ], 201);
    }

    // Đăng nhập
    public function login(Request $request)
    {
        $token = $this->authService->login($request->only('email', 'password'));

        if (!$token) {
            return response()->json(['message' => 'email hoặc mật khẩu không đúng!'], 401);
        }

        $this->logAction("login_local");

        return $this->respondWithToken($token);
    }

    // Quên mật khẩu
    public function forgotPassword(ForgotPasswordRequest $request)
    {
        $status = $this->authService->forgotPassword($request);

        if ($status === Password::RESET_LINK_SENT) {
            $this->logAction("forgot_password");

            return response()->json([
                'success' => true,
                'message' => "Email đặt lại mật khẩu được gửi! Vui lòng kiểm tra hộp thư của bạn."
            ], 200);
        }

        return response()->json([
            'success' => false,
            'message' => __($status)
        ], 422);
    }

    // Reset mật khẩu
    public function reset(ResetPasswordRequest $request)
    {
        $status = $this->authService->resetPassword($request, function ($user) {
            $this->logAction("password_reset", $user->id);
        });

        if ($status == Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Đặt lại mật khẩu thành công'
            ]);
        }

        return response()->json([
            'message' => 'Token không hợp lệ hoặc đã hết hạn'
        ], 400);
    }

    // Lấy thông tin người dùng
    public function me()
    {
        $user = auth()->user();

        return response()->json([
            'user'        => $user,
            'roles'       => $user->roles->pluck('name'),
            'permissions' => $user->permissions()->pluck('name'),
        ]);
    }

    // Logout
    public function logout()
    {
        auth()->logout();
        return response()->json(['message' => 'Đăng xuất thành công']);
    }

    // Refresh token
    public function refresh()
    {
        return $this->respondWithToken(auth()->refresh());
    }

    // Login Google
    public function loginWithGoogle(Request $request)
    {
        $token = $this->authService->loginWithGoogle($request->token);

        $this->logAction("login_google");

        return $this->respondWithToken($token);
    }

    // Login Facebook
    public function loginWithFacebook(Request $request)
    {
        $token = $this->authService->loginWithFacebook($request->token);

        $this->logAction("login_facebook");

        return $this->respondWithToken($token);
    }

  protected function respondWithToken($token)
{
    // CÁCH FIX: Ép hệ thống dùng token này để lấy user, bất kể đang ở guard nào
    // Nếu auth()->user() null thì thử setToken
    $user = auth()->user();
    
    if (!$user) {
        try {
            $user = auth()->setToken($token)->user();
        } catch (\Exception $e) {
            $user = null;
        }
    }

    // Phòng trường hợp vẫn không lấy được user (tránh lỗi 500)
    if (!$user) {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60,
            'message' => 'Token created but user details unavailable' 
        ]);
    }

    return response()->json([
        'access_token' => $token,
        'token_type' => 'bearer',
        'expires_in' => auth()->factory()->getTTL() * 60,
        
        // Giờ $user đã an toàn để gọi
        'user_info' => [
            'id'       => $user->id,
            'name'     => $user->username ?? $user->name,
            'email'    => $user->email,
            'avatar'   => $user->avatar ?? null,
        ],
        'roles' => $user->roles->pluck('name'),
    ]);
}
}
