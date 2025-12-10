import React, { useState } from "react";
import { Modal, Empty, Radio, Button } from "antd";
import { RightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const VoucherModalSelector = ({ 
  vouchers, 
  cartTotal = 0, 
  onSelect, 
  selectedVoucherId 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- LOGIC ---
  const getDiscountLabel = (v) => {
    if (!v) return "";
    if (v.discount_type === "percent") {
      return `Giảm ${v.discount_value}% ${v.max_discount_amount ? `(Tối đa ${v.max_discount_amount.toLocaleString()}đ)` : ""}`;
    }
    return `Giảm ${v.discount_value?.toLocaleString()}đ`;
  };

  const checkEligibility = (v) => {
    if (!v) return { valid: false, reason: "Lỗi dữ liệu" };
    const now = dayjs();
    const startDate = dayjs(v.start_date);
    const endDate = dayjs(v.end_date);

    if (now.isBefore(startDate)) return { valid: false, reason: "Chưa bắt đầu" };
    if (now.isAfter(endDate)) return { valid: false, reason: "Hết hạn" };
    if (v.usage_limit && v.used_count >= v.usage_limit) return { valid: false, reason: "Hết lượt" };
    if (cartTotal < v.min_order_value) {
      const diff = v.min_order_value - cartTotal;
      return { valid: false, reason: `Mua thêm ${diff.toLocaleString()}đ` };
    }
    return { valid: true };
  };

  const sortedVouchers = vouchers.map(v => ({ ...v, status: checkEligibility(v) }));
  const eligibleVouchers = sortedVouchers.filter(v => v.status.valid);
  const disabledVouchers = sortedVouchers.filter(v => !v.status.valid);

  // Xử lý chọn/bỏ chọn
  const handleToggle = (voucher) => {
    if (selectedVoucherId === voucher.id) {
      onSelect(null); 
    } else {
      onSelect(voucher); 
    }
  
  };

  // --- COMPONENT CARD VOUCHER CHUYÊN NGHIỆP ---
  const VoucherCard = ({ voucher, disabled }) => {
    if (!voucher) return null;
    const isSelected = selectedVoucherId === voucher.id;

    return (
      <div 
        onClick={() => !disabled && handleToggle(voucher)}
        className={`group relative flex items-center w-full h-24 mb-3 rounded-lg overflow-hidden border transition-all duration-200
          ${disabled 
            ? "bg-gray-100 border-gray-200 opacity-70 cursor-not-allowed grayscale-[0.8]" 
            : "bg-white border-gray-200 hover:border-blue-400 hover:shadow-md cursor-pointer"}
          ${isSelected ? "border-blue-500 bg-blue-50/30" : ""}
        `}
      >
        {/* Phần 1: Left Ticket Stub (Màu sắc) */}
        <div className={`h-full w-28 flex flex-col items-center justify-center text-white relative
             ${disabled ? "bg-gray-500" : "bg-gradient-to-br from-blue-600 to-blue-500"}
        `}>
           <div className="font-bold text-xs opacity-80 mb-1">VOUCHER</div>
           <div className="font-bold text-lg tracking-wider">{voucher.code}</div>
           
           {/* Răng cưa trang trí (CSS trick dùng radial-gradient tạo lỗ tròn) */}
           <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full"></div>
           <div className="absolute right-0 top-0 bottom-0 border-r-2 border-dashed border-white/30"></div>
        </div>

        {/* Phần 2: Nội dung chính */}
        <div className="flex-1 px-4 py-2 flex flex-col justify-center h-full relative">
           <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{voucher.name}</h4>
           <div className="text-red-500 font-bold text-xs mt-0.5">{getDiscountLabel(voucher)}</div>
           <div className="text-[10px] text-gray-500 mt-1">
              Đơn tối thiểu: {voucher.min_order_value?.toLocaleString()}đ
           </div>
           
           {/* Lý do lỗi */}
           {disabled && (
               <div className="text-[10px] text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded w-fit mt-1">
                   {voucher.status.reason}
               </div>
           )}

           {/* Hạn sử dụng */}
           {!disabled && (
               <div className="text-[10px] text-gray-400 mt-1">
                   HSD: {dayjs(voucher.end_date).format("DD/MM/YYYY")}
               </div>
           )}
        </div>

        {/* Phần 3: Radio Button */}
        <div className="pr-4 pl-2">
            <Radio checked={isSelected} disabled={disabled} className="scale-110" />
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Trigger Bar (Thanh bên ngoài) */}
      <div 
        onClick={() => setIsModalOpen(true)}
        className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-all shadow-sm group"
      >
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
            </div>
            <div className="flex flex-col">
                <span className="font-medium text-gray-700 text-sm group-hover:text-blue-600 transition-colors">Shop Voucher</span>
                {selectedVoucherId ? (
                   <span className="text-xs text-green-600 font-medium">Đã chọn 1 mã ưu đãi</span>
                ) : (
                   <span className="text-xs text-gray-400">Chọn hoặc nhập mã</span>
                )}
            </div>
         </div>
         
         <div className="flex items-center gap-2">
            {selectedVoucherId && (
                <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded font-bold border border-red-200">
                   - Đã áp dụng
                </span>
            )}
            <RightOutlined className="text-gray-400 text-xs" />
         </div>
      </div>

      {/* Modal Danh sách */}
      <Modal
        title={<div className="text-center font-bold text-lg pb-2 border-b">Chọn Voucher Shop</div>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
             <Button key="back" onClick={() => setIsModalOpen(false)} size="large" className="w-full bg-black text-white hover:!bg-gray-800 hover:!text-white border-none">
                Đồng ý
             </Button>
        ]}
        width={500}
        bodyStyle={{ maxHeight: '65vh', overflowY: 'auto', backgroundColor: '#f3f4f6', padding: '16px' }}
        centered
      >
        {/* Option: Không dùng mã */}
        <div 
            onClick={() => onSelect(null)}
            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 mb-4 cursor-pointer hover:bg-gray-50"
        >
            <span className="text-gray-700 font-medium">Không sử dụng ưu đãi</span>
            <Radio checked={selectedVoucherId === null} />
        </div>

        <div className="text-gray-500 text-xs font-bold uppercase mb-2">Mã giảm giá khả dụng</div>
        
        {vouchers.length === 0 ? (
             <div className="py-10 flex flex-col items-center justify-center bg-white rounded-lg">
                <Empty description="Kho voucher trống" image={Empty.PRESENTED_IMAGE_SIMPLE} />
             </div>
        ) : (
            <div className="space-y-3">
                {/* List Khả dụng */}
                {eligibleVouchers.map(v => <VoucherCard key={v.id} voucher={v} />)}

                {/* List Không khả dụng */}
                {disabledVouchers.length > 0 && (
                    <>
                        <div className="text-gray-500 text-xs font-bold uppercase mt-6 mb-2">Không đủ điều kiện</div>
                        {disabledVouchers.map(v => <VoucherCard key={v.id} voucher={v} disabled />)}
                    </>
                )}
            </div>
        )}
      </Modal>
    </>
  );
};

export default VoucherModalSelector;