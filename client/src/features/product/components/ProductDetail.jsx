import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaStar, FaTruck, FaShieldAlt, FaUndo } from 'react-icons/fa';
import { message, Spin } from 'antd';

// Import Thunks
import { fetchProductDetail } from './../productThunks'; 
import { addToCart, fetchCart } from '../../../features/cart/cartThunks';

const ProductDetail = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();

  const { productDetail, status } = useSelector((state) => state.product); 
  // Chỉ lấy isLoading để disable nút khi đang add
  const { isLoading: isCartLoading } = useSelector((state) => state.cart);

  const [selectedImage, setSelectedImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  // 1. Fetch Product Detail
  useEffect(() => {
    if (slug && (!productDetail || productDetail.slug !== slug)) {
        dispatch(fetchProductDetail(slug));
    }
  }, [dispatch, slug, productDetail]);

  // 2. Set Default State (Ảnh chính & Màu có sẵn)
  useEffect(() => {
    if (productDetail) {
      const primaryImg = productDetail.images?.find(img => img.is_primary) || productDetail.images?.[0];
      if (primaryImg) setSelectedImage(primaryImg.url);
    }
  }, [productDetail]);

  // --- LOGIC BIẾN THỂ & TỒN KHO ---
  const variants = productDetail?.variants || [];
  const uniqueColors = [...new Set(variants.map(v => v.color))];

  // Lấy list size theo màu đã chọn
  const availableSizes = variants
    .filter(v => v.color === selectedColor)
    .map(v => ({ 
        size: v.size, 
        stock: v.stock?.quantity || 0,
        id: v.id 
    }));

  // Tìm biến thể hiện tại
  const currentVariant = variants.find(
      v => v.color === selectedColor && v.size === selectedSize
  );

  const currentStock = currentVariant?.stock?.quantity || 0;
  const isOutOfStock = currentVariant && currentStock <= 0;

  // Reset quantity về 1 khi đổi phân loại
  useEffect(() => {
      setQuantity(1);
  }, [selectedColor, selectedSize]);

  // --- HANDLER ---
  const handleQuantityChange = (type) => {
      if (type === 'decrease') {
          setQuantity(prev => Math.max(1, prev - 1));
      } else {
          // Chỉ tăng số lượng, không check giới hạn ở đây nữa (Backend sẽ lo)
          // Tuy nhiên, logic UI cơ bản: Không cho tăng quá tồn kho hiện tại để UX tốt hơn
          if (currentStock > 0 && quantity >= currentStock) {
             message.warning(`Kho chỉ còn ${currentStock} sản phẩm!`);
             return;
          }
          setQuantity(prev => prev + 1);
      }
  };

  const handleAddToCart = () => {
      // 1. Validate Client cơ bản
      if (!selectedColor) return message.warning('Vui lòng chọn màu sắc!');
      if (!selectedSize) return message.warning('Vui lòng chọn kích thước!');
      if (!currentVariant) return message.error('Phiên bản này không tồn tại!');
      
      if (currentStock <= 0) {
          return message.error('Sản phẩm này hiện đang hết hàng!');
      }
      
      const payload = {
        items: [{ product_variant_id: currentVariant.id, quantity }]
      };

      // 2. Gọi API Add to Cart
      dispatch(addToCart(payload))
        .unwrap()
        .then(() => {
            message.success('Đã thêm vào giỏ hàng!');
            dispatch(fetchCart()); // Update giỏ hàng header
        })
        .catch((err) => {
            // Hiển thị lỗi từ Backend trả về (VD: "Quá số lượng cho phép", "Hết hàng"...)
            const errorMsg = typeof err === 'string' ? err : (err.message || 'Lỗi thêm giỏ hàng');
            message.error(errorMsg);
        });
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  // --- RENDER ---
  if (status === 'loading' && !productDetail) return <div className="min-h-screen flex justify-center items-center"><Spin size="large"/></div>;
  if (status === 'failed' || !productDetail) return <div className="min-h-screen flex justify-center items-center text-gray-500">Không tìm thấy sản phẩm.</div>;

  return (
    <div className="bg-white min-h-screen font-sans">
       <div className="bg-gray-100 py-3 mb-6">
           <div className="container mx-auto px-4 max-w-6xl text-sm text-gray-600">
                <Link to="/" className="hover:text-black">Trang chủ</Link> 
                <span className="mx-2">/</span> 
                <Link to="/product" className="hover:text-black">Sản phẩm</Link> 
                <span className="mx-2">/</span> 
                <span className="text-black font-medium truncate">{productDetail.name}</span>
           </div>
       </div>
       
      <div className="container mx-auto px-4 max-w-6xl pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           
           {/* --- LEFT: IMAGES --- */}
           <div className="space-y-4">
              <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 relative">
                <img 
                    src={selectedImage || "https://via.placeholder.com/500"} 
                    alt={productDetail.name} 
                    className="w-full h-full object-cover"
                />
                {productDetail.old_price && Number(productDetail.old_price) > Number(productDetail.price) && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        -{Math.round(((productDetail.old_price - productDetail.price) / productDetail.old_price) * 100)}%
                    </span>
                )}
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2">
                {productDetail.images?.map((img) => (
                    <div 
                        key={img.id}
                        onClick={() => setSelectedImage(img.url)}
                        className={`w-20 h-20 rounded-md overflow-hidden border-2 cursor-pointer transition-all ${
                            selectedImage === img.url ? 'border-black' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                    >
                        <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
                    </div>
                ))}
              </div>
           </div>

           {/* --- RIGHT: INFO --- */}
           <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{productDetail.name}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                  <div className="flex text-yellow-400 text-sm">
                      {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={i < Math.round(productDetail.reviews_avg_rating || 0) ? "" : "text-gray-300"} />
                      ))}
                  </div>
                  <span className="text-sm text-gray-500 border-l pl-4 border-gray-300">
                      {productDetail.reviews_count} Đánh giá
                  </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-bold text-red-600">{formatPrice(productDetail.price)}</span>
                      {productDetail.old_price && Number(productDetail.old_price) > Number(productDetail.price) && (
                          <span className="text-lg text-gray-400 line-through">{formatPrice(productDetail.old_price)}</span>
                      )}
                  </div>
              </div>

              {/* Color Selection */}
              <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-3 text-gray-700">Màu sắc: <span className="text-black ml-1">{selectedColor}</span></h3>
                  <div className="flex flex-wrap gap-3">
                      {uniqueColors.map((color) => (
                          <button
                              key={color}
                              onClick={() => { setSelectedColor(color); setSelectedSize(''); }}
                              className={`px-4 py-2 border rounded-md text-sm font-medium transition-all ${
                                  selectedColor === color 
                                  ? 'border-black bg-black text-white' 
                                  : 'border-gray-200 text-gray-700 hover:border-black'
                              }`}
                          >
                              {color}
                          </button>
                      ))}
                  </div>
              </div>

              {/* Size Selection */}
              <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-3 text-gray-700">Kích thước: <span className="text-black ml-1">{selectedSize}</span></h3>
                  <div className="flex flex-wrap gap-3">
                      {['38', '39', '40', '41', '42', '43', '44', '45'].map((size) => {
                          const sizeData = availableSizes.find(s => s.size === size);
                          // Logic UI: Nếu size đó có tồn kho > 0 thì sáng, ngược lại mờ
                          // Vẫn cho phép click vào size hết hàng để xem thông báo
                          const isMatch = sizeData !== undefined; 
                          
                          return (
                              <button
                                  key={size}
                                  disabled={!isMatch}
                                  onClick={() => setSelectedSize(size)}
                                  className={`w-12 h-12 flex items-center justify-center border rounded-md text-sm font-medium transition-all relative ${
                                      selectedSize === size
                                      ? 'border-black bg-black text-white'
                                      : isMatch 
                                          ? 'border-gray-200 hover:border-black text-gray-900' 
                                          : 'border-gray-100 bg-gray-100 text-gray-300 cursor-not-allowed opacity-50'
                                  }`}
                              >
                                  {size}
                              </button>
                          )
                      })}
                  </div>
              </div>

              {/* Stock Status Info */}
              <div className="mb-6 h-6">
                  {currentVariant ? (
                      currentStock > 0 ? (
                          <span className="text-sm text-green-600 font-bold">
                              ✓ Còn {currentStock} sản phẩm
                          </span>
                      ) : (
                          <span className="text-sm text-red-500 font-bold">
                              Sản phẩm này đang tạm hết hàng
                          </span>
                      )
                  ) : (
                      <span className="text-sm text-gray-400 italic">Vui lòng chọn màu sắc và kích thước</span>
                  )}
              </div>

              {/* Actions */}
              <div className="flex gap-4 mb-8 border-b border-gray-100 pb-8">
                  <div className="flex items-center border border-gray-300 rounded-md">
                      <button 
                        onClick={() => handleQuantityChange('decrease')} 
                        disabled={quantity <= 1}
                        className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                      >-</button>
                      <input 
                        type="number" 
                        value={quantity} 
                        readOnly 
                        className="w-12 text-center border-none focus:ring-0 font-medium bg-white" 
                      />
                      <button 
                        onClick={() => handleQuantityChange('increase')} 
                        disabled={currentVariant && quantity >= currentStock || quantity >= 20}
                        className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                      >+</button>
                  </div>

                  <button 
                      onClick={handleAddToCart}
                      disabled={isCartLoading || currentStock <= 0}
                      className={`flex-1 h-12 rounded-md font-bold text-lg transition-all ${
                          isCartLoading || currentStock <= 0
                          ? 'bg-gray-400 cursor-not-allowed text-white'
                          : 'bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl active:scale-95'
                      }`}
                  >
                      {isCartLoading ? 'Đang xử lý...' : (currentStock <= 0 && currentVariant ? 'HẾT HÀNG' : 'THÊM VÀO GIỎ')}
                  </button>
              </div>

              {/* Policies */}
              <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-3"><FaTruck className="text-lg" /><span>Miễn phí vận chuyển cho đơn hàng trên 500k</span></div>
                  <div className="flex items-center gap-3"><FaUndo className="text-lg" /><span>Đổi trả miễn phí trong vòng 30 ngày</span></div>
                  <div className="flex items-center gap-3"><FaShieldAlt className="text-lg" /><span>Bảo hành chính hãng 12 tháng</span></div>
              </div>
           </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Mô tả sản phẩm</h3>
            <div className="prose max-w-none text-gray-600 whitespace-pre-line leading-relaxed">
                {productDetail.description || "Đang cập nhật mô tả..."}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;