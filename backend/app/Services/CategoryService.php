<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Support\Str;
use App\Traits\CloudinaryUpload;
use App\Models\Product;

class CategoryService
{
    use CloudinaryUpload;

    /**
     * Lấy toàn bộ danh mục cha + con
     */
    public function getAll()
    {
        return Category::with('children')
                    ->whereNull('parent_id')
                    ->take(10) // giới hạn tối đa 10 cha
                    ->get();
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

    public function getProductsByCategorySlug($slug)
    {
        // Lấy danh mục theo slug
        $category = Category::with('children')->where('slug', $slug)->firstOrFail();

        $categoryIds = [$category->id];
        if ($category->children) {
            $categoryIds = array_merge($categoryIds, $category->children->pluck('id')->toArray());
        }

        // Lấy sản phẩm thuộc các danh mục
       return Product::select('id', 'brand_id', 'slug', 'category_id', 'name', 'description', 'price', 'old_price')
        ->with([
            'images' => function($query) {
                $query->select('id', 'product_id', 'url')
                      ->where('is_primary', 1);
            }
        ])
        ->whereIn('category_id', $categoryIds)
        ->where('status', 1)
        ->withAvg('reviews', 'rating')
        ->withCount('reviews')
        ->get()
        ->map(function($product){
            $product->image = $product->images->first()->url ?? null;
            unset($product->images);
            
            $avgRating = (float)($product->reviews_avg_rating ?? 0);
            $product->reviews_avg_rating = round($avgRating, 1);
            $product->reviews_count = $product->reviews_count ?? 0;


          $product->discountPercent = ($product->old_price && $product->old_price > $product->price)
            ? round((($product->old_price - $product->price) / $product->old_price) * 100)
            : 0;


            return $product;
        });
    }

}
