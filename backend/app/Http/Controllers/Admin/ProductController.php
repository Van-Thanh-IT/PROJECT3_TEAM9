<?php

namespace App\Http\Controllers\Admin;

use App\Services\ProductService;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use App\Http\Requests\VariantRequest;
use App\Models\Product;

class ProductController extends Controller
{
    protected $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    public function index()
    {
        return response()->json([
            'status' => true,
            'data'   => $this->productService->getAll()
        ]);
    }

    public function show($id)
    {
        return response()->json([
            'status' => true,
            'data'   => $this->productService->findById($id)
        ]);
    }

    public function store(ProductRequest $request)
    {
        $product = $this->productService->create($request);

        return response()->json([
            'status'  => true,
            'message' => "Tạo sản phẩm thành công!",
            'data'    => $product
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $product = $this->productService->update($request, $id);

        return response()->json([
            'status'  => true,
            'message' => "Cập nhật sản phẩm thành công!",
            'data'    => $product
        ]);
    }

    public function toggleStatus(Request $request, $id)
    {
        $product = $this->productService->toggleStatus($id);
        return response()->json([
            'status' => true,
            'message' => $product->status === 'active' 
                ? 'Sản phẩm đã được bật' 
                : 'Sản phẩm đã được ẩn',
            'data' => $product
        ]);
    }


    public function variantStore(Request $request, $id)
    {

        $productVariant = $this->productService->createVariant($id, $request);

        return response()->json([
            'status' => true,
            'message' => 'Thêm biến thể thành công',
            'data' => $productVariant
        ]);
    }

    public function updateVariant(Request $request, $id)
    {
        $variant = $this->productService->updateVariant($request, $id);
        return response()->json([
            'status' => true,
            'message' => 'Cập nhật biến thể thông!',
            'data' => $variant
        ]);
    }

    public function softDeleteVariant($id)
    {
        $this->productService->softDeleteVariant($id);
        return response()->json([
            'status' => true,
            'message' => 'Xóa mềm biến thể thành công!'
        ]);
    }


    public function storeImage(Request $request, $id)
    {
        $images = $this->productService->createImage($id, $request);

        return response()->json([
            'status' => true,
            'message' => 'Thêm ảnh mới thành công!',
            'data' =>  $images
        ]);
    }

    public function softDeleteImage($id)
    {
        $this->productService->softDeleteImage($id);
        return response()->json([
            'status' => true,
            'message' => 'Xóa mềm sản phẩm thông!'
        ]);
    }

    public function setPrimary($productId, $imageId)
    {
        $image = $this->productService->setPrimary($productId, $imageId);
        
        return response()->json([
                'status' => true,
                'message' => 'Đã đặt làm ảnh đại diện thành công',
                'data' => $image
        ], 200);

    }

}
