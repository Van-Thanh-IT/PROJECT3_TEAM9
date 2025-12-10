import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { message } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";

import {
  fetchCities,
  fetchDistricts,
  fetchWards,
  calculateShippingFee,
  resetLocation,
  resetWards,
} from "../../features/checkout/goshipSlice";
import { placeOrder } from "../../features/order/orderThunks";
import { clearErrors } from "../../features/order/orderSlice";
import { fetchVouchers } from "../../features/voucher/voucherThunks";
import VoucherModalSelector from "../../components/common/modal/VoucherModalSelector";

// --- REUSABLE COMPONENTS ---
const InputField = ({ label, name, value, onChange, placeholder, error, type = "text" }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-700">
      {label} <span className="text-red-500">*</span>
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full border rounded-lg p-2.5 outline-none transition-all duration-200 
        ${error 
          ? "border-red-500 bg-red-50 focus:ring-1 focus:ring-red-500" 
          : "border-gray-300 focus:border-black focus:ring-1 focus:ring-gray-200"
        }`}
    />
    {error && <span className="text-xs text-red-500 italic mt-0.5">{error}</span>}
  </div>
);

const SelectField = ({ label, value, onChange, options, disabled, placeholder, error }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <select
      className={`w-full border rounded-lg p-2.5 outline-none transition-all duration-200
        ${error ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-black"} 
        ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
      // Đảm bảo value luôn là string hoặc rỗng để select hiển thị đúng
      value={value || ""} 
      onChange={onChange}
      disabled={disabled}
    >
      <option value="">{placeholder}</option>
      {options?.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.name}
        </option>
      ))}
    </select>
    {error && <span className="text-xs text-red-500 italic mt-0.5">{error}</span>}
  </div>
);

// --- MAIN CHECKOUT COMPONENT ---
const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { cartTotal = 0, checkoutItems = [] } = location.state || {};

  // Redux State
  const { user } = useSelector((state) => state.auth);
  const { validationErrors, status: orderStatus } = useSelector((state) => state.order);
  const { cities, districts, wards, shippingFeeInfo, status: shipStatus } = useSelector((state) => state.goship);
  const { vouchers } = useSelector((state) => state.voucher);
  console.log(orderStatus);
  // --- Local State ---
  const [formData, setFormData] = useState({
    name: user?.username || "",
    phone: user?.phone || "",
    addressDetail: "",
    note: "",
    cityName: "",
    districtName: "",
    wardName: "",
  });

  // State ID riêng biệt để xử lý logic API (Khởi tạo là chuỗi rỗng)
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  // --- Effect: Fetch dữ liệu ban đầu ---
  useEffect(() => {
    if (!checkoutItems || checkoutItems.length === 0) {
      navigate("/cart");
    }
    dispatch(fetchCities());
    dispatch(fetchVouchers());

    return () => { dispatch(clearErrors()); };
  }, [dispatch, navigate, checkoutItems]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- LOGIC XỬ LÝ LOCATION (Đã Fix lỗi kiểu dữ liệu) ---
  const handleLocationChange = (type, e) => {
    // 1. Lấy giá trị thô từ sự kiện (luôn là String)
    const rawValue = e.target.value;
    
    // Nếu chọn placeholder (value=""), reset và return
    if (!rawValue) {
        if (type === 'city') { setSelectedCity(""); setSelectedDistrict(""); setSelectedWard(""); }
        if (type === 'district') { setSelectedDistrict(""); setSelectedWard(""); }
        if (type === 'ward') { setSelectedWard(""); }
        return;
    }

    // 2. Chuyển đổi kiểu dữ liệu cho đúng với ID trong database
    // City & District thường là Number, Ward thường là String (tuỳ API GHN/GHTK)
    // Ở đây ta ép kiểu Number cho City/District để an toàn
    const valueId = (type === 'ward') ? rawValue : Number(rawValue);

    // 3. Helper tìm tên (Dùng == để so sánh lỏng lẻo, phòng trường hợp 1 bên string 1 bên number)
    const getName = (list, id) => list?.find(item => item.id == id)?.name || "";

    if (type === "city") {
        const name = getName(cities, valueId);
        
        setSelectedCity(valueId);
        setSelectedDistrict(""); // Reset District
        setSelectedWard("");     // Reset Ward
        
        // Lưu tên
        setFormData(prev => ({ ...prev, cityName: name, districtName: "", wardName: "" }));

        dispatch(resetLocation());
        dispatch(fetchDistricts(valueId)); // Gọi API lấy Quận

    } else if (type === "district") {
        const name = getName(districts, valueId);

        setSelectedDistrict(valueId);
        setSelectedWard(""); // Reset Ward

        setFormData(prev => ({ ...prev, districtName: name, wardName: "" }));

        dispatch(resetWards());
        dispatch(fetchWards(valueId)); // Gọi API lấy Phường

    } else if (type === "ward") {
        const name = getName(wards, valueId);
        setSelectedWard(valueId);
        setFormData(prev => ({ ...prev, wardName: name }));

        // Tính phí ship (Chỉ tính khi có đủ 3 thông tin)
        // Lưu ý: Dùng giá trị state hiện tại cho City/District vì chúng đã được chọn từ trước
        if (selectedCity && selectedDistrict && valueId) {
            dispatch(calculateShippingFee({
                city: selectedCity, 
                district: selectedDistrict, 
                ward: valueId,
                cod: cartTotal, amount: cartTotal, weight: 220,
                width: 10, height: 10, length: 10,
            }));
        }
    }
  };

  // --- Tính giảm giá ---
  const discountAmount = useMemo(() => {
    if (!selectedVoucher) return 0;
    if (cartTotal < selectedVoucher.min_order_value) {
        setSelectedVoucher(null);
        return 0;
    }
    let discount = 0;
    if (selectedVoucher.discount_type === "percent") {
      discount = cartTotal * (selectedVoucher.discount_value / 100);
      if (selectedVoucher.max_discount_amount && discount > selectedVoucher.max_discount_amount) {
        discount = selectedVoucher.max_discount_amount;
      }
    } else {
      discount = selectedVoucher.discount_value;
    }
    return discount > cartTotal ? cartTotal : discount;
  }, [selectedVoucher, cartTotal]);

  // --- Submit Đơn Hàng ---
  const handlePlaceOrder = async () => {
    if (!selectedCity || !selectedDistrict || !selectedWard) {
        message.error("Vui lòng chọn đầy đủ địa chỉ giao hàng!");
        return;
    }
    if (!shippingFeeInfo) {
      message.error("Đang tính phí vận chuyển, vui lòng đợi...");
      return;
    }

    const shippingFee = shippingFeeInfo.total_fee;
    const finalTotal = cartTotal + shippingFee - discountAmount;

    const orderData = {
      full_name: formData.name,
      phone: formData.phone,
      address_detail: formData.addressDetail,
      
      city_id: String(selectedCity),
      city_name: formData.cityName,

      district_id: String(selectedDistrict),
      district_name: formData.districtName,

      ward_id: String(selectedWard),
      ward_name: formData.wardName,
      
      shipping_rate_id: shippingFeeInfo.id,
      total_weight: 220,
      payment_method: paymentMethod,
      sub_total: cartTotal,
      shipping_fee: shippingFee,
      discount: discountAmount,
      voucher_id: selectedVoucher ? selectedVoucher.id : null,
      total: finalTotal,
      note: formData.note,
      items: checkoutItems.map((item) => ({
        product_variant_id: item.variant.id,
        product_name: item.variant.product.name,
        color: item.variant.color,
        size: item.variant.size,
        quantity: item.quantity,
        price: item.variant.price,
      })),
    };

    try {
      const result = await dispatch(placeOrder(orderData)).unwrap();
      message.success("Đặt hàng thành công!");
      if (paymentMethod === "vnpay" && result.payment_url) {
        window.location.href = result.payment_url;
      } else {
        navigate("/order-success", { state: { orderId: result.data.order_id } });
      }
    } catch (err) {
      console.error(err);
      if (!err.errors) {
        message.error(err.message || "Có lỗi xảy ra khi đặt hàng.");
      } else {
        message.error("Vui lòng kiểm tra lại thông tin nhập vào.");
      }
    }
  };

  const formatPrice = (value) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
  // Helper lấy lỗi từ Laravel trả về (dạng array)
  const getError = (fieldName) => validationErrors?.[fieldName]?.[0];

  return (
    <div className="bg-gray-50 min-h-screen py-8 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Thanh toán đơn hàng</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* CỘT TRÁI */}
          <div className="lg:w-2/3 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-5 border-b pb-2">Thông tin nhận hàng</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <InputField label="Họ tên" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nguyễn Văn A" error={getError("full_name")} />
                <InputField label="Số điện thoại" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="0123456789" error={getError("phone")} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <SelectField 
                    label="Tỉnh/Thành" 
                    value={selectedCity} 
                    onChange={(e) => handleLocationChange("city", e)} 
                    options={cities} 
                    placeholder="Chọn Tỉnh" 
                    error={getError("city_id")} // Check lỗi theo ID
                />
                <SelectField 
                    label="Quận/Huyện" 
                    value={selectedDistrict} 
                    onChange={(e) => handleLocationChange("district", e)} 
                    options={districts} 
                    disabled={!selectedCity} 
                    placeholder="Chọn Quận" 
                    error={getError("district_id")} 
                />
                <SelectField 
                    label="Phường/Xã" 
                    value={selectedWard} 
                    onChange={(e) => handleLocationChange("ward", e)} 
                    options={wards} 
                    disabled={!selectedDistrict} 
                    placeholder="Chọn Phường" 
                    error={getError("ward_id")} 
                />
              </div>

              <div className="mb-5">
                <InputField label="Địa chỉ cụ thể" name="addressDetail" value={formData.addressDetail} onChange={handleInputChange} placeholder="Số nhà, đường..." error={getError("address_detail")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea name="note" className="w-full border rounded-lg p-2.5 outline-none focus:border-black resize-none" rows="2" value={formData.note} onChange={handleInputChange} placeholder="Lời nhắn..."></textarea>
              </div>
            </div>

            {/* Thanh toán */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Phương thức thanh toán</h3>
              <div className="space-y-3">
                {[
                  { id: 'cod', label: 'Thanh toán khi nhận hàng (COD)', desc: 'Thanh toán tiền mặt cho shipper.' },
                  { id: 'vnpay', label: 'Thanh toán VNPAY-QR', desc: 'Quét mã QR qua ứng dụng ngân hàng.' }
                ].map(method => (
                  <label key={method.id} className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === method.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
                    <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="w-5 h-5 accent-blue-600" />
                    <div>
                      <span className="font-bold block text-gray-800">{method.label}</span>
                      <span className="text-sm text-gray-500">{method.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI */}
          <div className="lg:w-1/3">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-10">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Đơn hàng ({checkoutItems.length} món)</h3>
              
              <div className="max-h-64 overflow-y-auto mb-4 space-y-3 pr-1 custom-scrollbar">
                {checkoutItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.variant?.product?.image} alt="" className="w-12 h-12 rounded object-cover border" />
                    <div className="flex-1 text-sm">
                      <p className="font-semibold line-clamp-1">{item.variant?.product?.name}</p>
                      <div className="flex justify-between text-gray-500 mt-1">
                        <span>{item.variant?.color} - {item.variant?.size} x{item.quantity}</span>
                        <span className="font-medium text-gray-700">{formatPrice(item.variant?.price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-5 border-t pt-4">
                 <VoucherModalSelector 
                    vouchers={vouchers} 
                    cartTotal={cartTotal}
                    selectedVoucherId={selectedVoucher?.id}
                    onSelect={setSelectedVoucher}
                 />
                 {selectedVoucher && (
                    <div className="mt-3 flex justify-between items-center bg-green-50 text-green-700 px-3 py-2 rounded border border-green-200 text-sm animate-fade-in">
                        <span>Đã dùng: <strong>{selectedVoucher.code}</strong></span>
                        <CloseCircleOutlined 
                            className="cursor-pointer hover:text-green-900 text-lg" 
                            onClick={() => setSelectedVoucher(null)} 
                        />
                    </div>
                 )}
              </div>

              <div className="border-t pt-4 space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span className="font-medium">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Phí vận chuyển:</span>
                  {shipStatus === "loading" ? (
                    <span className="text-blue-500 animate-pulse text-xs">Đang tính...</span>
                  ) : shippingFeeInfo ? (
                    <span className="font-medium">{formatPrice(shippingFeeInfo.total_fee)}</span>
                  ) : (
                    <span className="text-orange-500 text-xs">Chưa có địa chỉ</span>
                  )}
                </div>
                {selectedVoucher && (
                    <div className="flex justify-between text-green-600 font-medium">
                        <span>Voucher giảm:</span>
                        <span>- {formatPrice(discountAmount)}</span>
                    </div>
                )}
              </div>

              <div className="border-t my-4 pt-4 flex justify-between items-center">
                <span className="font-bold text-lg text-gray-900">Tổng cộng:</span>
                <div className="text-right">
                    {(discountAmount > 0) && (
                        <div className="text-xs text-gray-400 line-through mb-1">
                            {formatPrice(cartTotal + (shippingFeeInfo?.total_fee || 0))}
                        </div>
                    )}
                    <span className="font-extrabold text-2xl text-red-600">
                        {formatPrice(cartTotal + (shippingFeeInfo?.total_fee || 0) - discountAmount)}
                    </span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={orderStatus === 'loading' || !shippingFeeInfo}
                className={`w-full py-3.5 rounded-lg font-bold text-white shadow-lg transition-all transform active:scale-95 ${
                  orderStatus === 'loading' || !shippingFeeInfo
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800"
                }`}
              >
                {orderStatus === 'loading' ? "ĐANG XỬ LÝ..." : "ĐẶT HÀNG NGAY"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;