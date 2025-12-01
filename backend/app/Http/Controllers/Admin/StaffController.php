<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\StaffRequest;
use App\Services\StaffService;

class StaffController extends Controller
{
    protected $staffService;

    public function __construct(StaffService $staffService)
    {
        $this->staffService = $staffService;
    }

    public function index()
    {
        $this->authorize('viewAny', User::class);
        $staffs = $this->staffService->getAllStaffs();
        return response()->json($staffs);
    }

    public function show($id)
    {
        $staff = $this->staffService->findStaffById($id);
        $this->authorize('view', $staff);
        return response()->json($staff);
    }

    public function update(StaffRequest $request, $id)
    {
        $staff = $this->staffService->updateStaff($id, $request->only([
            'username', 'email', 'phone', 'gender', 'avatar', 'date_of_birth'
        ]));
        $this->authorize('update', $staff);

        return response()->json([
            'status' => 'success',
            'message' => 'Cập nhật thông tin thành công',
            'user' => $staff
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $staff = $this->staffService->updateStaffStatus($id, $request->status);
        $this->authorize('update', $staff);

        return response()->json([
            'status' => 'success',
            'message' => 'Cập nhật trạng thái thành công',
            'user' => $staff
        ]);
    }

    public function store(StaffRequest $request)
    {
        $user = $this->staffService->createStaff([
            'username' => $request->username,
            'email' => $request->email,
            'password' => $request->password,
            'phone' => $request->phone,
            'gender' => $request->gender,
            'avatar_file' => $request->file('avatar'),
            'date_of_birth' => $request->date_of_birth,
            'role' => $request->role,
        ]);

        return response()->json([
            'status' => true,
            'message' => "Nhân viên '{$user->username}' đã được tạo",
            'data' => $user
        ], 201);
    }
}
