<?php

namespace App\Services;

use App\Models\Brand;
use App\Traits\CloudinaryUpload;
use Illuminate\Support\Str;

class BrandService
{
    use CloudinaryUpload;

    /**
     * Lấy tất cả brand chưa bị xóa
     */
    public function getAll()
    {
        return Brand::orderBy('id', 'desc')->get();
    }

    /**
     * Lấy brand theo ID
     */
    public function findById($id)
    {
        return Brand::findOrFail($id);
    }

    /**
     * Tạo brand
     */
    public function create($request)
    {
        $image = null;

        if ($request->hasFile('logo')) {
            $image = $this->uploadToCloudinary($request->file('logo'));
        }

        $slug = Str::slug($request->name);

        if (Brand::where('slug', $slug)->exists()) {
            return [
                'error' => true,
                'message' => 'Slug hoặc tên thương hiệu đã tồn tại!'
            ];
        }

        $brand = Brand::create([
            'name'        => $request->name,
            'slug'        => $slug,
            'logo'        => $image,
            'description' => $request->description
        ]);

        return [
            'error' => false,
            'data'  => $brand
        ];
    }

    /**
     * Cập nhật brand
     */
    public function update($request, $id)
    {
        $brand = Brand::findOrFail($id);

        $slug = Str::slug($request->name);

        if (Brand::where('slug', $slug)->where('id', '!=', $id)->exists()) {
            return [
                'error' => true,
                'message' => 'Slug hoặc tên thương hiệu đã tồn tại!'
            ];
        }

        // Upload ảnh mới (nếu có)
        $image = $brand->logo;
        if ($request->hasFile('logo')) {
            $image = $this->uploadToCloudinary($request->file('logo'));
        }

        $brand->update([
            'name'        => $request->name,
            'slug'        => $slug,
            'logo'        => $image,
            'description' => $request->description
        ]);

        return [
            'error' => false,
            'data'  => $brand
        ];
    }


    // Xóa mềm brand
    public function softDelete($id)
    {
        $brand = Brand::findOrFail($id);
        $brand->delete();

        return [
            'error' => false,
            'message' => 'Đã xóa thương hiệu (soft delete thành công).'
        ];
    }

    /**
     * Danh sách brand đã bị xóa mềm
     */
    public function getTrashed()
    {
        return Brand::onlyTrashed()->orderBy('id', 'desc')->get();
    }

    /**
     * Khôi phục brand đã xóa mềm
     */
    public function restore($id)
    {
        $brand = Brand::onlyTrashed()->findOrFail($id);
        $brand->restore();

        return [
            'error' => false,
            'message' => 'Khôi phục thương hiệu thành công!',
            'data' => $brand
        ];
    }

}
