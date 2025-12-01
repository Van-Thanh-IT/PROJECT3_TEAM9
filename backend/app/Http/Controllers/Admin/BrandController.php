<?php

namespace App\Http\Controllers\Admin;

use App\Services\BrandService;
use App\Http\Requests\BrandRequest;
use App\Http\Controllers\Controller;

class BrandController extends Controller
{
    protected $brandService;

    public function __construct(BrandService $brandService)
    {
        $this->brandService = $brandService;
    }

    /**
     * Lấy tất cả brands (kể cả chưa xoá)
     */
    public function index()
    {
        $brands = $this->brandService->getAll();

        return response()->json([
            'status' => true,
            'data' => $brands
        ]);
    }

    /**
     * Lấy brand theo ID
     */
    public function show($id)
    {
        $brand = $this->brandService->findById($id);

        return response()->json([
            'status' => true,
            'data' => $brand
        ]);
    }

    /**
     * Tạo mới brand
     */
    public function store(BrandRequest $request)
    {
        $res = $this->brandService->create($request);

        if ($res['error']) {
            return response()->json([
                'status' => false,
                'message' => $res['message']
            ], 400);
        }

        return response()->json([
            'status' => true,
            'message' => 'Tạo thương hiệu thành công!',
            'data' => $res['data']
        ], 201);
    }

    /**
     * Cập nhật brand
     */
    public function update(BrandRequest $request, $id)
    {
        $res = $this->brandService->update($request, $id);

        if ($res['error']) {
            return response()->json([
                'status' => false,
                'message' => $res['message']
            ], 400);
        }

        return response()->json([
            'status' => true,
            'message' => 'Cập nhật thương hiệu thành công!',
            'data' => $res['data']
        ]);
    }

    /**
     * Xóa mềm brand
     */
    public function destroy($id)
    {
        $res = $this->brandService->softDelete($id);

        return response()->json([
            'status' => true,
            'message' => $res['message']
        ]);
    }

    /**
     * Danh sách brands đã bị xóa mềm
     */
    public function trash()
    {
        $trashed = $this->brandService->getTrashed();

        return response()->json([
            'status' => true,
            'data' => $trashed
        ]);
    }

    /**
     * Khôi phục brand đã xóa mềm
     */
    public function restore($id)
    {
        $res = $this->brandService->restore($id);

        return response()->json([
            'status' => true,
            'message' => $res['message'],
            'data' => $res['data']
        ]);
    }
}
