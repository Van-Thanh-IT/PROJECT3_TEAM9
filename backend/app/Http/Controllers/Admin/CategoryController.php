<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CategoryRequest;
use App\Services\CategoryService;

class CategoryController extends Controller
{
    protected $service;

    public function __construct(CategoryService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $category = $this->service->getAll();
        return response()->json([
            'status' => true,
            'data' => $category
        ],200);
    }

     public function show($id)
    {
        $category = $this->service->findById($id);
        return response()->json([
            'status' => true,
            'data' => $category
        ],200);
    }


    public function store(CategoryRequest $request)
    {
        $res = $this->service->create($request);

        if ($res['error']) {
            return response()->json([
                'status' => false,
                'message' => $res['message']
            ], 400);
        }

        return response()->json([
            'status' => true,
            'message' => 'Tạo danh mục thành công',
            'data' => $res['data']
        ], 201);
    }

    public function update(CategoryRequest $request, $id)
    {
        $res = $this->service->update($request, $id);

        if ($res['error']) {
            return response()->json([
                'status' => false,
                'message' => $res['message']
            ], 400);
        }

        return response()->json([
            'status' => true,
            'message' => 'Cập nhật danh mục thành công',
            'data' => $res['data']
        ]);
    }

    public function toggleStatus($id)
    {
        $category = $this->service->toggleStatus($id);

        return response()->json([
            'status' => true,
            'message' => 'Cập nhật trạng thái thành công',
            'data' => [
                'status' => $category->status
            ]
        ]);
    }
}
