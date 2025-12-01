import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import { FaStar, FaStarHalfAlt, FaRegStar, FaTruck, FaShieldAlt, FaUndo } from 'react-icons/fa';
import { message } from 'antd';
import { fetchProductDetail } from './../productThunks'; 

const ProductDetail = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();


  const { productDetail, status } = useSelector((state) => state.product); 

  // State local cho giao diện
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (slug) {
      dispatch(fetchProductDetail(slug));
    }
  }, [dispatch, slug]);

  // 3. Cập nhật state local khi dữ liệu từ Redux về
  useEffect(() => {
    if (productDetail) {
      // Set ảnh mặc định là ảnh chính (is_primary = true)
      const primaryImg = productDetail.images?.find(img => img.is_primary) || productDetail.images?.[0];
      if (primaryImg) setSelectedImage(primaryImg.url);

      // Auto select màu đầu tiên để UX tốt hơn
      const firstVariant = productDetail.variants?.[0];
      if (firstVariant) {
        setSelectedColor(firstVariant.color);
      }
    }
  }, [productDetail]);

  // 4. Xử lý Loading và Error
  if (status === 'loading') return <div className="min-h-screen flex justify-center items-center">Đang tải...</div>;
  if (!productDetail) return <div className="min-h-screen flex justify-center items-center">Sản phẩm không tồn tại</div>;

  // --- LOGIC LỌC BIẾN THỂ (VARIANTS) ---
  
  // Lấy danh sách màu duy nhất
  const uniqueColors = [...new Set(productDetail.variants?.map(v => v.color) || [])];

  // Lấy danh sách size dựa trên màu đã chọn
  const availableSizes = productDetail.variants
    ?.filter(v => v.color === selectedColor)
    .map(v => v.size) || [];

  // Tìm Variant ID cuối cùng để Add to Cart
  const currentVariant = productDetail.variants?.find(
      v => v.color === selectedColor && v.size === selectedSize
  );

  // --- CÁC HÀM XỬ LÝ ---
  const handleAddToCart = () => {
      if (!selectedColor) {
          message.warning('Vui lòng chọn màu sắc!');
          return;
      }
      if (!selectedSize) {
          message.warning('Vui lòng chọn kích thước!');
          return;
      }
      
      console.log("Add to cart:", {
          product_id: productDetail.id,
          variant_id: currentVariant?.id,
          quantity: quantity,
          price: currentVariant?.price || productDetail.price
      });
      message.success('Đã thêm vào giỏ hàng!');
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div className="bg-gray-50 min-h-screen py-10 font-sans">
       <div className="text-sm text-gray-500 mb-2"><Link to="/">Trang chủ</Link> / <Link to="/product">Sản phẩm</Link> / {productDetail.name}</div>
      <div className="container mx-auto px-4 max-w-6xl">
        
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
            
            {/* --- CỘT TRÁI: ẢNH SẢN PHẨM (GALLERY) --- */}
            <div className="p-6 md:p-8 bg-gray-50 flex flex-col gap-4">
              {/* Ảnh chính to */}
              <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative group">
                <img 
                    src={selectedImage || "https://via.placeholder.com/500"} 
                    alt={productDetail.name} 
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110 cursor-zoom-in"
                />
                {/* Badge giảm giá nếu có */}
                {productDetail.old_price && Number(productDetail.old_price) > Number(productDetail.price) && (
                    <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                        -{Math.round(((productDetail.old_price - productDetail.price) / productDetail.old_price) * 100)}%
                    </span>
                )}
              </div>

              {/* List ảnh nhỏ (Thumbnails) */}
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {productDetail.images?.map((img) => (
                    <button 
                        key={img.id}
                        onClick={() => setSelectedImage(img.url)}
                        className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImage === img.url ? 'border-black opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                    >
                        <img src={img.url} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                ))}
              </div>
            </div>

            {/* --- CỘT PHẢI: THÔNG TIN CHI TIẾT --- */}
            <div className="p-6 md:p-8 flex flex-col">

              {/* Tên sản phẩm */}
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 leading-tight">
                  {productDetail.name}
              </h1>

              {/* Rating & Sold */}
              <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center text-yellow-400 gap-1">
                      <span className="font-bold text-black mr-1">{Number(productDetail.reviews_avg_rating).toFixed(1)}</span>
                      {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={i < Math.round(productDetail.reviews_avg_rating || 0) ? "fill-current" : "text-gray-300"} />
                      ))}
                  </div>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="text-sm text-gray-500">{productDetail.reviews_count} Đánh giá</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="text-sm text-gray-500">Đã bán 1.2k</span>
              </div>

              {/* Giá tiền */}
              <div className="mb-8 bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-end gap-3">
                      <span className="text-3xl font-extrabold text-red-600">{formatPrice(productDetail.price)}</span>
                      {productDetail.old_price && Number(productDetail.old_price) > Number(productDetail.price) && (
                          <span className="text-lg text-gray-400 line-through mb-1">{formatPrice(productDetail.old_price)}</span>
                      )}
                  </div>
              </div>

              {/* --- CHỌN MÀU SẮC --- */}
              <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Màu sắc: <span className="text-gray-500 font-normal normal-case">{selectedColor}</span></h3>
                  <div className="flex flex-wrap gap-3">
                      {uniqueColors.map((color) => (
                          <button
                              key={color}
                              onClick={() => {
                                  setSelectedColor(color);
                                  setSelectedSize(''); // Reset size khi đổi màu
                              }}
                              className={`px-6 py-2 rounded-full border text-sm font-medium transition-all ${
                                  selectedColor === color 
                                  ? 'border-black bg-black text-white shadow-lg transform scale-105' 
                                  : 'border-gray-200 text-gray-700 hover:border-black'
                              }`}
                          >
                              {color}
                          </button>
                      ))}
                  </div>
              </div>

              {/* --- CHỌN SIZE --- */}
              <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Kích thước: <span className="text-gray-500 font-normal normal-case">{selectedSize}</span></h3>
                      <button className="text-xs text-blue-600 underline hover:text-blue-800">Hướng dẫn chọn size</button>
                  </div>
                  
                  {/* Hiển thị danh sách tất cả các size có thể có, disable những size không khả dụng */}
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                      {/* Bạn có thể thay mảng tĩnh này bằng logic lấy unique sizes từ variants nếu muốn động hoàn toàn */}
                      {['38', '39', '40', '41', '42', '43', '44', '45'].map((size) => {
                          const isAvailable = availableSizes.includes(size);
                          return (
                              <button
                                  key={size}
                                  disabled={!isAvailable}
                                  onClick={() => setSelectedSize(size)}
                                  className={`py-3 rounded-lg border text-sm font-bold transition-all ${
                                      selectedSize === size
                                      ? 'border-black bg-black text-white shadow-md'
                                      : isAvailable 
                                          ? 'border-gray-200 text-gray-900 hover:border-black' 
                                          : 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50'
                                  }`}
                              >
                                  {size}
                              </button>
                          )
                      })}
                  </div>
              </div>

              {/* --- SỐ LƯỢNG & ACTION BUTTONS --- */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <div className="flex items-center border border-gray-300 rounded-full w-max h-12">
                      <button 
                          onClick={() => setQuantity(q => Math.max(1, q - 1))}
                          className="w-12 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-full text-lg"
                      >-</button>
                      <input 
                          type="number" 
                          value={quantity} 
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-12 text-center border-none focus:ring-0 font-bold text-gray-900 appearance-none m-0"
                      />
                      <button 
                          onClick={() => setQuantity(q => q + 1)}
                          className="w-12 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-full text-lg"
                      >+</button>
                  </div>

                  <button 
                      onClick={handleAddToCart}
                      className="flex-1 bg-black text-white h-12 rounded-full font-bold text-lg shadow-xl hover:bg-gray-800 hover:shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95"
                  >
                      Thêm vào giỏ hàng
                  </button>
              </div>

              {/* --- CHÍNH SÁCH BÁN HÀNG --- */}
              <div className="grid grid-cols-1 gap-4 py-6 border-t border-gray-100 text-sm text-gray-600">
                  <div className="flex items-center gap-3">
                      <FaTruck className="text-xl text-black" />
                      <span>Miễn phí vận chuyển cho đơn hàng trên 500k</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <FaUndo className="text-xl text-black" />
                      <span>Đổi trả miễn phí trong vòng 30 ngày</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <FaShieldAlt className="text-xl text-black" />
                      <span>Bảo hành chính hãng 12 tháng</span>
                  </div>
              </div>

              {/* --- MÔ TẢ SẢN PHẨM --- */}
              <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Mô tả sản phẩm</h3>
                  <div className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                      {productDetail.description}
                  </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;