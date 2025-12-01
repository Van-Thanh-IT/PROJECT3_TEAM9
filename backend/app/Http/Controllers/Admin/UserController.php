<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\UserService;
use Illuminate\Http\Request;

class UserController extends Controller
{
    protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    // Lấy tất cả user
    public function index()
    {
        $users = $this->userService->getAll();
        return response()->json([
            'status' => true,
            'data' => $users
        ]);

    }

    // Lấy 1 user theo id
    public function show($id)
    {
        $user = $this->userService->findById($id);
        return response()->json([
            'status' => true,
            'data' => $user
        ]);
    }
    
    // Cập nhật trạng thái tk
    public function updateStatus(Request $request, $id)
    {
        $res = $this->userService->updateStatus($id, $request->status);
        return response()->json($res, $res['status'] ? 200 : 400);
    }

}
