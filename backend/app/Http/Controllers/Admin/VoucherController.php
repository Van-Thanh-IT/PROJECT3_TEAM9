<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\VoucherRequest;
use App\Services\VoucherService;
use App\Http\Controllers\Controller;

class VoucherController extends Controller
{
    protected $voucherService;

    public function __construct(VoucherService $service)
    {
        $this->voucherService = $service;
    }

    public function index()
    {
        return response()->json($this->voucherService->getAll());
    }

    public function store(VoucherRequest $request)
    {
        $voucher = $this->voucherService->store($request->validated());
        return response()->json([
            "message" => "Created",
            "voucher" => $voucher
        ], 201);
    }

    public function update(VoucherRequest $request, $id)
    {
        $voucher = $this->voucherService->update($id, $request->validated());
        return response()->json([
            "message" => "Updated",
             "voucher" => $voucher
        ], 200);
    }

    public function destroy($id)
    {
        $this->voucherService->softDelete($id);
        return response()->json(["message" => "Deleted (soft)"]);
    }

    public function restore($id)
    {
        $this->voucherService->restore($id);
        return response()->json(["message" => "Restored"]);
    }

}
