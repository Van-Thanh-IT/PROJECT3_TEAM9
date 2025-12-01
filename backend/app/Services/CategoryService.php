<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Support\Str;
use App\Traits\CloudinaryUpload;

class CategoryService
{
    use CloudinaryUpload;

    /**
     * Lấy toàn bộ danh mục cha + con
     */
    public function getAll()
    {
        return Category::with('children')->whereNull('parent_id')->get();
    }
    /**
     * Tạo danh mục mới
     */
    public function create($request)
    {
        $imageUrl = null;

        if ($request->hasFile('image')) {
            $imageUrl = $this->uploadToCloudinary($request->file('image'));
        }

        // slug
        $slug = Str::slug($request->name);

        // check duplicate
        if (Category::where('slug', $slug)->exists()) {
            return [
                'error' => true,
                'message' => 'Tên danh mục hoặc slug đã tồn tại!'
            ];
        }

        $category = Category::create([
            'name'        => $request->name,
            'slug'        => $slug,
            'parent_id'   => $request->parent_id,
            'description' => $request->description,
            'image'       => $imageUrl
        ]);

        return [
            'error' => false,
            'data' => $category
        ];
    }

    /**
     * Cập nhật danh mục
     */
    public function update($request, $id)
    {
        $category = Category::findOrFail($id);

        // image
        $imageUrl = $category->image;

        if ($request->hasFile('image')) {
            $imageUrl = $this->uploadToCloudinary($request->file('image'));
        }

        // Slug
        $slug = Str::slug($request->name);

        if (Category::where('slug', $slug)->where('id', '!=', $id)->exists()) {
            return [
                'error' => true,
                'message' => 'Tên danh mục hoặc slug đã tồn tại!'
            ];
        }

        $category->update([
            'name'        => $request->name,
            'slug'        => $slug,
            'parent_id'   => $request->parent_id,
            'description' => $request->description,
            'image'       => $imageUrl,
        ]);

        return [
            'error' => false,
            'data' => $category
        ];
    }

    /**
     * Lấy 1 danh mục
     */
    public function findById($id)
    {
        return Category::findOrFail($id);
    }

    /**
     * Chuyển trạng thái bật/tắt
     */
    public function toggleStatus($id)
    {
        $category = Category::findOrFail($id);
        $category->status = !$category->status;
        $category->save();

        return $category;
    }
}
