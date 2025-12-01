<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\UserService;
use App\Services\AddressService;
use App\Models\User;


class ProfileController extends Controller
{
    protected $AddressService;
    protected $userService;

    public function __construct(AddressService $AddressService, UserService $userService)
    {
        $this->AddressService = $AddressService;
        $this->userService = $userService;
    }

    public function index()
    {
        $user = User::with('addresses')->where('id', auth()->user()->id)->first();
        return response()->json($user);
    }

    public function update(Request $request, $id)
    {

        $profile = $this->userService->update($id, $request->only([
            'username', 'email', 'phone', 'gender', 'avatar', 'date_of_birth'
        ]));

        return response()->json([
            'status' => 'success',
            'message' => 'Cập nhật thông tin thành công',
            'user' => $profile
        ]);
    }


}
