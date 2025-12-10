import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// Import các Thunks
import { fetchUserOrderDetail, cancelOrder } from "../orderThunks"; 
import { createTicket } from "../../support/supportTicketThunks"; // Import action Chat

// Import UI
import { Spin, Button, Tag, Divider, Modal, Input, message, Radio } from "antd";
import { 
  ArrowLeftOutlined, 
  EnvironmentOutlined, 
  CreditCardOutlined, 
  CarOutlined,
  FileTextOutlined,
  CustomerServiceOutlined // Icon Hỗ trợ
} from "@ant-design/icons";

const OrderDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Lấy dữ liệu từ Redux Store
  const { userOrderDetail, status } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.auth); // Lấy user để check login khi chat

  // State cho Modal hủy đơn
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [otherReason, setOtherReason] = useState("");

  // Fetch chi tiết đơn hàng khi vào trang
  useEffect(() => {
    if (id) {
        dispatch(fetchUserOrderDetail(id));
    }
  }, [dispatch, id]);

  // --- HELPER: Format tiền tệ ---
  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  // --- HELPER: Hiển thị trạng thái đơn hàng ---
  const renderStatusTag = (statusCode, statusTxt) => {
    let color = "default";
    if (statusCode === "900") color = "blue";      // Đơn mới
    else if (statusCode === "905") color = "green"; // Giao thành công
    else if (["914", "1000", "906"].includes(statusCode)) color = "red"; // Hủy/Lỗi
    else color = "orange"; // Đang xử lý/Giao hàng
    return <Tag color={color} className="text-sm px-3 py-1 uppercase font-bold">{statusTxt}</Tag>;
  };

  // --- HANDLER: CHAT VỚI SHOP (MỚI) ---
  const handleChatSupport = async () => {
    if (!user) {
        message.warning("Vui lòng đăng nhập để chat");
        return;
    }
    try {
        message.loading({ content: "Đang kết nối hỗ trợ...", key: 'chat_loading' });
        
        // Gọi API tạo ticket kèm order_id (Backend sẽ tự tạo tin nhắn thẻ đơn hàng)
        await dispatch(createTicket({
            subject: `Hỗ trợ đơn hàng #${order.code}`,
            order_id: order.id, 
            email: user.email
        })).unwrap();

        message.success({ content: "Đã kết nối!", key: 'chat_loading' });
        
        // Chuyển hướng sang trang Chat và truyền orderId để hiển thị context
        navigate('/user/support', { 
            state: { orderId: order.id } 
        });
        
    } catch (error) {
        message.error({ content: "Lỗi kết nối: " + (error.message || "Thử lại sau"), key: 'chat_loading' });
    }
  };

  // --- HANDLER: HỦY ĐƠN HÀNG ---
  const handleCancelOrder = async () => {
    if (!cancelReason) {
        message.warning("Vui lòng chọn lý do hủy!");
        return;
    }
    
    const finalReason = cancelReason === "Khác" ? otherReason : cancelReason;
    if (!finalReason.trim()) {
        message.warning("Vui lòng nhập lý do cụ thể!");
        return;
    }

    try {
        // Gọi API hủy đơn
        await dispatch(cancelOrder({ id, reason: finalReason })).unwrap();
        message.success("Đã hủy đơn hàng thành công!");
        setIsCancelModalOpen(false);
        // Refresh lại dữ liệu đơn hàng
        dispatch(fetchUserOrderDetail(id));
    } catch (error) {
        message.error(error.message || "Hủy đơn thất bại!");
    }
  };

  // --- LOADING / EMPTY STATE ---
  if (status === "loading") return <div className="min-h-screen flex justify-center items-center"><Spin size="large" /></div>;
  
  // Xử lý cấu trúc dữ liệu trả về (đôi khi API trả về bọc trong data hoặc trực tiếp)
  const order = userOrderDetail?.data || userOrderDetail;
  
  if (!order || status === "failed") return <div className="min-h-screen flex justify-center items-center text-gray-500">Không tìm thấy đơn hàng</div>;

  // --- UI CHÍNH ---
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* 1. Header: Mã đơn & Trạng thái */}
        <div className="bg-white p-4 rounded-t-lg shadow-sm border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
                <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate("/profile/orders")} className="text-gray-500 hover:text-blue-600">TRỞ LẠI</Button>
                <span className="text-lg font-bold text-gray-800">Mã đơn: {order.code}</span>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-gray-500 text-sm">Ngày đặt: {order.created_at}</span>
                <span className="text-gray-300">|</span>
                {renderStatusTag(order.shipment_status, order.shipment_status_txt)}
            </div>
        </div>

        {/* 2. Địa chỉ nhận hàng */}
        <div className="bg-white p-6 shadow-sm mb-4 border-t-4 border-t-blue-500 bg-[url('https://i.imgur.com/C498V9v.png')] bg-bottom bg-repeat-x bg-[length:auto_3px]">
            <div className="flex items-start gap-4">
                <EnvironmentOutlined className="text-blue-500 text-xl mt-1" />
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Địa chỉ nhận hàng</h3>
                    <div className="text-gray-700">
                        <span className="font-bold">{order.address?.name}</span>
                        <span className="mx-2 text-gray-400">|</span>
                        <span className="font-medium text-gray-600">{order.address?.phone}</span>
                    </div>
                    <p className="text-gray-500 mt-1">{order.address?.full_address}</p>
                </div>
            </div>
        </div>

        {/* 3. Danh sách sản phẩm */}
        <div className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2 font-medium text-gray-700">
                <FileTextOutlined /> Danh sách sản phẩm
            </div>
            <div>
                {order.items?.map((item, index) => (
                    <div key={index} className="flex gap-4 p-4 border-b border-gray-50 last:border-none hover:bg-gray-50/50 transition-colors">
                        <div className="w-20 h-20 border border-gray-200 rounded-md overflow-hidden flex-shrink-0">
                            <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium text-gray-800 text-base line-clamp-2">
                                <Link to={`/product/${item.slug}`} className="hover:text-blue-600">{item.product_name}</Link>
                            </h4>
                            <div className="text-sm text-gray-500 mt-1">Phân loại: {item.color} - Size {item.size}</div>
                            <div className="text-sm text-gray-800 mt-1 font-semibold">x{item.quantity}</div>
                        </div>
                        <div className="text-right">
                            <span className="text-blue-600 font-bold text-base">{formatPrice(item.price)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* 4. Thông tin thanh toán & Vận chuyển */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm h-full">
                <h4 className="font-bold text-gray-800 mb-4 pb-2 border-b">Thông tin bổ sung</h4>
                <div className="mb-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1"><CarOutlined /> <span className="font-medium">Đơn vị vận chuyển:</span></div>
                    <div className="pl-6 text-gray-800 font-semibold">{order.shipping?.carrier || "Chưa cập nhật"}</div>
                    {order.shipping?.tracking_number && <div className="pl-6 text-xs text-blue-500 mt-1">Mã vận đơn: {order.shipping.tracking_number}</div>}
                </div>
                <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1"><CreditCardOutlined /> <span className="font-medium">Phương thức thanh toán:</span></div>
                    <div className="pl-6 text-gray-800 font-semibold uppercase">{order.payment?.method || "COD"}</div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="font-bold text-gray-800 mb-4 pb-2 border-b">Chi tiết thanh toán</h4>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-600"><span>Tổng tiền hàng</span><span>{formatPrice(order.payment?.total_amount)}</span></div>
                    <div className="flex justify-between text-gray-600"><span>Phí vận chuyển</span><span>{formatPrice(order.payment?.shipping_fee)}</span></div>
                    <div className="flex justify-between text-green-600"><span>Giảm giá Voucher</span><span>- {formatPrice(order.payment?.discount_amount)}</span></div>
                    <Divider className="my-2" />
                    <div className="flex justify-between items-end">
                        <span className="font-bold text-gray-800 text-base">Tổng thanh toán</span>
                        <span className="text-2xl font-bold text-red-600">{formatPrice(order.payment?.final_amount)}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* 5. CÁC NÚT HÀNH ĐỘNG (ACTION BUTTONS) */}
        <div className="mt-6 flex justify-end gap-3 flex-wrap">
             {/* Nút Liên hệ Shop (Luôn hiện để khách cần hỗ trợ bất cứ lúc nào) */}
             <Button 
                size="large" 
                icon={<CustomerServiceOutlined />} 
                onClick={handleChatSupport}
                className="border-blue-500 text-blue-600 hover:bg-blue-50 font-medium"
             >
                Liên hệ Shop
             </Button>

             {/* Nút Mua Lại (Hiện khi đơn Hoàn thành hoặc Giao thành công) */}
             {["905", "913"].includes(String(order.shipment_status)) && (
                 <Button size="large" type="primary" className="bg-blue-600 font-medium">Mua Lại</Button>
             )}
             
             {/* Nút Hủy Đơn (Chỉ hiện khi đơn Mới - 900) */}
             {String(order.shipment_status) === "900" && (
                 <Button size="large" danger onClick={() => setIsCancelModalOpen(true)} className="font-medium">Hủy Đơn Hàng</Button>
             )}
        </div>

        {/* --- MODAL HỦY ĐƠN HÀNG --- */}
        <Modal
            title="Xác nhận hủy đơn hàng"
            open={isCancelModalOpen}
            onOk={handleCancelOrder}
            onCancel={() => setIsCancelModalOpen(false)}
            okText="Xác nhận hủy"
            okButtonProps={{ danger: true }}
            cancelText="Đóng"
        >
            <p className="mb-3 text-gray-600">Vui lòng chọn lý do bạn muốn hủy đơn hàng này:</p>
            <Radio.Group onChange={(e) => setCancelReason(e.target.value)} value={cancelReason} className="flex flex-col gap-2">
                <Radio value="Thay đổi địa chỉ giao hàng">Thay đổi địa chỉ giao hàng</Radio>
                <Radio value="Muốn nhập/thay đổi mã Voucher">Muốn nhập/thay đổi mã Voucher</Radio>
                <Radio value="Đổi ý, không muốn mua nữa">Đổi ý, không muốn mua nữa</Radio>
                <Radio value="Thấy chỗ khác rẻ hơn">Thấy chỗ khác rẻ hơn</Radio>
                <Radio value="Khác">Lý do khác</Radio>
            </Radio.Group>
            
            {cancelReason === "Khác" && (
                <div className="mt-3">
                    <Input.TextArea 
                        rows={3} 
                        placeholder="Nhập lý do cụ thể..." 
                        value={otherReason}
                        onChange={(e) => setOtherReason(e.target.value)}
                    />
                </div>
            )}
        </Modal>

      </div>
    </div>
  );
};

export default OrderDetail;