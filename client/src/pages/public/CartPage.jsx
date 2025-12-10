import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaArrowRight, FaShoppingBag } from 'react-icons/fa';
import { message } from 'antd';

// Import Thunk
import { fetchCart, removeCartItem, updateCartQuantity } from '../../features/cart/cartThunks'; 

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Lấy state từ Redux
  const { cartItems = [], isLoading } = useSelector((state) => state.cart);

  // State quản lý sản phẩm được chọn
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Logic mặc định chọn tất cả khi load giỏ hàng
  useEffect(() => {
    if (Array.isArray(cartItems) && cartItems.length > 0) {
        const allIds = cartItems.map(item => item.id);
        setSelectedItems(allIds);
    }
  }, [cartItems]);

  // Hàm toggle checkbox
  const handleToggleItem = (id) => {
      setSelectedItems(prev => {
          if (prev.includes(id)) {
              return prev.filter(itemId => itemId !== id);
          } else {
              return [...prev, id];
          }
      });
  };

  // Hàm chọn tất cả
  const handleSelectAll = () => {
      if (selectedItems.length === cartItems.length) {
          setSelectedItems([]);
      } else {
          setSelectedItems(cartItems.map(item => item.id));
      }
  };

  const formatPrice = (price) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  // Tính tổng tiền
  const calculatedTotal = useMemo(() => {
    if (!Array.isArray(cartItems)) return 0;
    
    return cartItems.reduce((total, item) => {
        if (selectedItems.includes(item.id)) {
            const price = Number(item?.variant?.price || 0);
            const qty = Number(item?.quantity || 0);
            return total + (price * qty);
        }
        return total;
    }, 0);
  }, [cartItems, selectedItems]);

  const handleProceedToCheckout = () => {
      // Lọc ra danh sách các item đã chọn
      const itemsToCheckout = cartItems.filter(item => selectedItems.includes(item.id));
      
  
      navigate('/checkout', { 
          state: { 
              cartTotal: calculatedTotal, 
              checkoutItems: itemsToCheckout
          } 
      });
  };

  const handleRemoveItem = (id) => {
    dispatch(removeCartItem(id))
      .unwrap()
      .then(() => {
          message.success('Đã xóa sản phẩm khỏi giỏ!');
          setSelectedItems(prev => prev.filter(itemId => itemId !== id));
      })
      .catch(() => message.error('Có lỗi xảy ra khi xóa!'));
  };

  // --- HÀM CẬP NHẬT SỐ LƯỢNG (ĐÃ SỬA) ---
  const handleUpdateQuantity = (id, currentQty, type) => {
     const newQty = type === 'plus' ? currentQty + 1 : currentQty - 1;
     if (newQty < 1) return;
     dispatch(updateCartQuantity({ id, quantity: newQty }))
        .unwrap()
        .then(() => {
            dispatch(fetchCart());
        })
        .catch((err) => {
            const errorMsg = typeof err === 'string' ? err : 'Lỗi cập nhật số lượng';
            message.error(errorMsg);
        });
  };

  // --- RENDER ---
  if (isLoading && cartItems.length === 0) { // Chỉ hiện loading khi chưa có data lần đầu
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-20">
        <FaShoppingBag className="text-6xl text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng của bạn đang trống</h2>
        <p className="text-gray-500 mb-6">Hãy thêm vài món đồ sành điệu vào nhé!</p>
        <Link to="/" className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* CỘT TRÁI */}
          <div className="lg:w-2/3 flex flex-col gap-4">
            
            {/* Header Select All */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                <input 
                    type="checkbox" 
                    checked={cartItems.length > 0 && selectedItems.length === cartItems.length}
                    onChange={handleSelectAll}
                    className="w-5 h-5 accent-black cursor-pointer"
                />
                <span className="font-semibold text-gray-700">Chọn tất cả ({cartItems.length} sản phẩm)</span>
            </div>

            {Array.isArray(cartItems) && cartItems.map((item) => {
                const product = item?.variant?.product;
                if (!product) return null;
                const isSelected = selectedItems.includes(item.id);

                return (
                    <div key={item.id} className={`bg-white p-4 rounded-2xl shadow-sm border flex gap-4 items-center relative group transition-all ${isSelected ? 'border-black ring-1 ring-black' : 'border-gray-100'}`}>
                    
                    <div className="flex-shrink-0">
                        <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => handleToggleItem(item.id)}
                            className="w-5 h-5 accent-black cursor-pointer rounded"
                        />
                    </div>

                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden relative">
                        <img 
                        src={product.image || "https://via.placeholder.com/150"} 
                        alt={product.name} 
                        className={`w-full h-full object-cover transition-opacity ${isSelected ? 'opacity-100' : 'opacity-70 grayscale-[0.5]'}`}
                        />
                    </div>

                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">
                            <Link to={`/product/${product.slug}`} className="hover:underline">
                                {product.name}
                            </Link>
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium text-gray-600">
                                Size: {item?.variant?.size}
                            </span>
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium text-gray-600">
                                Màu: {item?.variant?.color}
                            </span>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-gray-500 transition p-2"
                            title="Xóa sản phẩm"
                        >
                            <FaTrash />
                        </button>
                        </div>

                        <div className="flex justify-between items-end mt-2">
                        <div className="font-bold text-red-600 text-lg">
                            {formatPrice(item.variant?.price)}
                        </div>

                        {/* Button tăng giảm số lượng */}
                        <div className="flex items-center border border-gray-200 rounded-lg h-9">
                            <button 
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, 'minus')}
                            disabled={item.quantity <= 1} 
                            className="w-8 h-full flex items-center justify-center hover:bg-gray-100 rounded-l-lg disabled:opacity-50"
                            >
                             -
                            </button>
                            <input 
                            type="text" 
                            readOnly 
                            value={item.quantity} 
                            className="w-10 text-center text-sm font-bold text-gray-900 border-none p-0 focus:ring-0"
                            />
                            <button 
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, 'plus')}
                            disabled={item.quantity >= 20}
                            className="w-8 h-full flex items-center justify-center hover:bg-gray-100 rounded-r-lg"
                            >
                             +
                            </button>
                        </div>
                        </div>
                    </div>
                    </div>
                );
            })}
          </div>

          {/* CỘT PHẢI */}
          <div className="lg:w-1/3">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-20">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Thanh toán</h2>

              <div className="space-y-4 mb-6 border-b border-gray-100 pb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Số lượng sản phẩm</span>
                  <span className="font-medium text-gray-900">{selectedItems.length} sản phẩm</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-medium text-gray-900">{formatPrice(calculatedTotal)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                <span className="text-2xl font-extrabold text-red-600">{formatPrice(calculatedTotal)}</span>
              </div>

              <button
                onClick={handleProceedToCheckout} // Gọi hàm chuyển hướng
                disabled={selectedItems.length === 0}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 group transition-all ${
                    selectedItems.length > 0 
                    ? 'bg-black text-white hover:bg-gray-800' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Tiến hành thanh toán
                {selectedItems.length > 0 && <FaArrowRight className="group-hover:translate-x-1 transition-transform" />}
              </button>

              <div className="mt-4 text-center">
                 <Link to="/#product" className="text-sm text-gray-500 hover:text-black hover:underline">
                    Hoặc tiếp tục mua sắm
                 </Link>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartPage;