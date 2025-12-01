import React from "react";
import { FaStar, FaEye } from "react-icons/fa";

export default function ProductCard({ product, onViewDetail }) {
  // Hàm an toàn để format giá tiền
  const formatPrice = (price) => {
    return Number(price).toLocaleString('vi-VN') + '₫';
  };

  return (
    <div
      className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col overflow-hidden cursor-pointer"
      onClick={() => onViewDetail(product)}
    >
      
      {/* --- 1. KHUNG ẢNH (QUAN TRỌNG: Dùng aspect-square để ảnh luôn vuông) --- */}
      <div className="relative w-full aspect-square bg-gray-100 overflow-hidden flex-shrink-0">
        <img
          src={product.image || "https://via.placeholder.com/300"}
          alt={product.name}
          // object-cover: Cắt ảnh vừa khít khung, không bị méo
          // object-center: Lấy trọng tâm giữa ảnh
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
        />

        {/* Badge giảm giá */}
        {product.discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md z-10">
            -{product.discountPercent}%
          </span>
        )}

        {/* Nút Xem chi tiết (Trượt từ dưới lên) */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-center">
          <button className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 bg-white text-gray-900 text-xs font-bold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 hover:bg-black hover:text-white">
            <FaEye /> Xem chi tiết
          </button>
        </div>
      </div>

      {/* --- 2. THÔNG TIN SẢN PHẨM --- */}
      <div className="p-3 flex flex-col flex-grow">
        {/* Tên sản phẩm */}
        <h3
          className="text-sm font-bold text-gray-800 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors min-h-[40px]"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Mô tả ngắn */}
        <p className="text-xs text-gray-500 line-clamp-1 mb-3">
          {product.description || "Mô tả sản phẩm đang cập nhật..."}
        </p>

        {/* Phần chân: Giá và Đánh giá (Luôn đẩy xuống đáy) */}
        <div className="mt-auto pt-2 border-t border-gray-100">
          <div className="flex flex-col gap-1">
            
            {/* Giá tiền */}
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-base font-extrabold text-red-600">
                {formatPrice(product.price)}
              </span>

              {product.price < product.old_price && (
                 <span className="text-[15px] line-through text-gray-400">
                  {formatPrice(product.old_price)}
                </span>
              )}

              
             
              
            </div>
            

            {/* Đánh giá */}
            <div className="flex items-center justify-between">
              <div className="flex text-yellow-400 text-[10px] gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FaStar
                    key={i}
                    className={i < Math.round(product.reviews_avg_rating || 0) ? "fill-current" : "text-gray-300"}
                  />
                ))}
              </div>
              <span className="text-[10px] text-gray-400">
                {product.reviews_count ? `(${product.reviews_count} đánh giá)` : "Chưa có đánh giá"}
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}