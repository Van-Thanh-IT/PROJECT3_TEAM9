<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductImage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Traits\CloudinaryUpload;
use Exception;

class ProductService
{
    use CloudinaryUpload;
    
    // Hàm lấy tất cả dl
   public function getAll()
    {
        return Product::with([
            'variants',
            'images',
            'category:id,name',   
            'brand:id,name'       
        ])
        ->orderBy('id', 'desc')
        ->get();
    }

    //lấy hiển thị trong home
  public function getProductHome()
{
    return Product::select('id', 'brand_id', 'slug', 'category_id', 'name', 'description', 'price', 'old_price')
        ->with([
            'images' => function($query) {
                $query->select('id', 'product_id', 'url')
                      ->where('is_primary', 1);
            }
        ])
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
    public function getProductDetail($slug)
    {
        return Product::select('id', 'brand_id', 'category_id', 'slug', 'name', 'description', 'price', 'old_price')
            ->with([
                "variants" => function ($query) {
                    $query->select('id', 'product_id', 'color', 'size', 'price');
                }
            ])
            ->with('images')
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->where('slug', $slug) 
            ->firstOrFail();      
    }


    // Lấy 1 sản phẩm theo id
    public function findById($id)
    {
        return Product::with(['variants', 'images'])->findOrFail($id);
    }

    
    
    // Tạo sản phẩm
    public function create($request)
    {
        DB::beginTransaction();
        try {
            // 1. Tạo Product
            $product = Product::create([
                'name'        => $request->name,
                'slug'        => Str::slug($request->name) . "-" . Str::random(5),
                'description' => $request->description,
                'material'    => $request->material,
                'style'       => $request->style,
                'price'       => $request->price,
                'old_price'   => $request->old_price,
                'category_id' => $request->category_id,
                'brand_id'    => $request->brand_id
            ]);

            if ($request->filled('variants')) {

                foreach ($request->variants as $v) {
                    ProductVariant::create([
                        'product_id' => $product->id,
                        'sku'        => $this->generateSKU($product->name, $v['color'], $v['size']),
                        'color'      => $v['color'],
                        'size'       => $v['size'],
                        'price'      => isset($v['price']) ? $v['price'] : 0
                    ]);
                }
            }

            if ($request->hasFile('images')) {
                foreach ($request->images as $index => $file) {
                    $url = $this->uploadToCloudinary($file);

                    if ($url) {
                        ProductImage::create([
                            'product_id' => $product->id,
                            'url'        => $url,
                            'is_primary' => $index === 0 ? 1 : 0 
                        ]);
                    }
                }
            }

            DB::commit();
            
            // Trả về kèm relation để Redux hiển thị ngay
            return $product->load(['variants', 'images']);

        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception($e->getMessage()); 
        }
    }
    
    // Cập nhật sản phẩm (Thông tin cơ bản)
    public function update($request, $id)
    {
        $product = Product::findOrFail($id);
        
        $dataUpdate = [
            'name'        => $request->name,
            'description' => $request->description,
            'price'       => $request->price,
            'old_price'   => $request->old_price,
            'category_id' => $request->category_id,
            'brand_id'    => $request->brand_id
        ];

        if ($product->name !== $request->name) {
            $dataUpdate['slug'] = Str::slug($request->name) . "-" . Str::random(5);
        }

        $product->update($dataUpdate);

        return $product->load(['variants', 'images']);
    }

    public function toggleStatus($id)
    {
        $product = Product::findOrFail($id);

        $product->status = $product->status === 'active' ? 'inactive' : 'active';
        $product->save();

        return $product;
    }

    
    
    public function createVariant($productId, $request)
    {
        $product = Product::findOrFail($productId);
        
        return ProductVariant::create([
            'product_id' => $productId,
            'sku'        => $this->generateSKU($product->name, $request->color, $request->size),
            'color'      => $request->color,
            'size'       => $request->size,
            'price'      => $request->price
        ]);
    }

    public function updateVariant($request, $id)
    {
        $variant = ProductVariant::findOrFail($id);
        $variant->update($request->all());
        return $variant;
    }

    public function softDeleteVariant($id)
    {
        $variant = ProductVariant::findOrFail($id);
        $variant->delete();
        return [
            'status' => true,
            'message' => 'Variant đã được xóa mềm',
            'data' => $variant
        ];
    }

    public function createImage($id, $request)
    {
        $product = Product::findOrFail($id);
        if(empty($product)) return response()->json(['message' => 'Không tìm thấy sản phẩm!'], 400);
        $url = null;
        if($request->hasFile('url')) {
            $url = $this->uploadToCloudinary($request->file('url'));
        }
        return ProductImage::create([
                'product_id' => $product->id,
                'url'        => $url,
                'is_primary' => 0
            ]);
          
    }

    public function softDeleteImage($id)
    {
        $image = ProductImage::findOrFail($id);
        $image->delete(); 
        return [
            'status' => true,
            'message' => 'Image đã được xóa',
            'data' => $image
        ];
    }

    public function setPrimary($productId, $imageId)
    {
        try {
            DB::beginTransaction();
            
            $image = ProductImage::where('product_id', $productId)
                                 ->where('id', $imageId)
                                 ->first();

            if (!$image) {
                return response()->json([
                    'status' => false,
                    'message' => 'Hình ảnh không tồn tại hoặc không thuộc sản phẩm này'
                ], 404);
            }
            ProductImage::where('product_id', $productId)
                        ->update(['is_primary' => 0]);

            $image->update(['is_primary' => 1]);

            DB::commit();

            return $image;

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage()
            ], 500);
        }
    }

    private function generateSKU($name, $color, $size)
    {
        $prefix = strtoupper(substr(Str::slug($name), 0, 3));
        $colorCode = strtoupper(substr(Str::slug($color), 0, 2));
        $sizeCode = strtoupper($size);
        $random = rand(1000, 9999);

        return "{$prefix}-{$colorCode}-{$sizeCode}-{$random}";
    }
}