<?php

namespace App\Traits;

use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\UploadedFile;
use Exception;
use Illuminate\Support\Facades\Log;

trait CloudinaryUpload
{
    /**
     * Upload file lên Cloudinary
     *
     * @param UploadedFile $file File từ request (VD: $request->file('image'))
     * @param string $folder Tên folder trên Cloudinary
     * @return string|null Trả về URL ảnh hoặc null nếu lỗi
     */
 
    public function uploadToCloudinary(UploadedFile $file)
    {
        try {
            // Lấy extension để xác định resource_type
            $extension = strtolower($file->getClientOriginalExtension());
            $resourceType = in_array($extension, ['jpg','jpeg','png','gif']) ? 'image' : 'raw';

            // Upload file
            $upload = Cloudinary::upload(
                $file->getRealPath(),
                [
                    'folder' => "project3",
                    'resource_type' => $resourceType,
                    'filename_override' => $file->getClientOriginalName()
                ]
            );
            // Trả về URL an toàn HTTPS
            return $upload->getSecurePath();

        } catch (Exception $e) {
            // Log lỗi để debug
            Log::error('Cloudinary Upload Error: ' . $e->getMessage());
            return null;
        }
    }

    public function deleteFromCloudinary($publicId)
    {
        try {
            return Cloudinary::destroy($publicId);
        } catch (Exception $e) {
            Log::error('Cloudinary Delete Error: ' . $e->getMessage());
            return false;
        }
    }
}