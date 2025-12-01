<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;

// ⚡ Đảm bảo bạn có 3 dòng này
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;

class Handler extends ExceptionHandler
{
    protected $dontReport = [];
    protected $dontFlash = ['password', 'password_confirmation'];

    public function register(): void
    {
        //
    }

    public function render($request, Throwable $e)
    {
        if ($request->is('api/*')) {

            // Bắt lỗi PostPolicy
             if ($e instanceof AuthorizationException) {
                return response()->json([
                    'status' => 'error',
                    'message' =>'Bạn không có quyền thực hiện hành động này',
                    'code' => 403,
                ], 403);
            }

            // Bắt lỗi role / permission
            if ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpException) {
                return response()->json([
                    'status' => 'error',
                    'message' => $e->getMessage(),
                    'code' => $e->getStatusCode(),
                ], $e->getStatusCode());
            }

            // Validation
            if ($e instanceof ValidationException) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $e->errors(),
                    'code' => 422,
                ], 422);
            }

            // Model not found
            if ($e instanceof ModelNotFoundException) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Không tìm thấy tài nguyên!',
                    'code' => 404,
                ], 404);
            }

            // Route not found
            if ($e instanceof NotFoundHttpException) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Đường dẫn không tồn tại!',
                    'code' => 404,
                ], 404);
            }

            // Auth errors
            if ($e instanceof AuthenticationException) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Bạn chưa đăng nhập hoặc token không hợp lệ!',
                    'code' => 401,
                ], 401);
            }

            // JWT errors
            if ($e instanceof TokenExpiredException) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Token đã hết hạn, vui lòng đăng nhập lại',
                    'code' => 401,
                ], 401);
            }

            if ($e instanceof TokenInvalidException) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Token không hợp lệ, vui lòng đăng nhập lại',
                    'code' => 401,
                ], 401);
            }

            if ($e instanceof JWTException) {
                $msg = $e->getMessage();
                if (str_contains($msg, 'Token not provided')) {
                    $msg = 'Bạn chưa đăng nhập — vui lòng gửi token trong header Authorization';
                } else {
                    $msg = 'Lỗi xác thực token: ' . $msg;
                }

                return response()->json([
                    'status' => 'error',
                    'message' => $msg,
                    'code' => 401,
                ], 401);
            }

            // 🔹 Thêm khối bắt tất cả lỗi khác, trả JSON 500
            return response()->json([
                'status' => 'error',
                'message' => "Lỗi hệ thống: ". $e->getMessage(),
                'code' => 500,
            ], 500);
        }

        return parent::render($request, $e);
    }
}