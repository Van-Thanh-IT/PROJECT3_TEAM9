import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders } from "../orderThunks"; 
import { Tabs, Badge, Empty, Button, Tag, Spin } from "antd";
import { Link } from "react-router-dom";
import { 
  FileTextOutlined, 
  CarOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  InboxOutlined 
} from "@ant-design/icons";


const TABS = [
  { 
    key: "all", 
    label: "Tất cả", 
    statuses: [] // Rỗng nghĩa là lấy hết
  },
  { 
    key: "pending", 
    label: "Chờ xác nhận", 
    icon: <FileTextOutlined />,
    statuses: ["900"] // Đơn mới
  },
  { 
    key: "processing", 
    label: "Chờ lấy hàng", 
    icon: <InboxOutlined />,
    statuses: ["901", "902", "903", "918"] // Chờ lấy, Lấy hàng, Đã lấy, Lưu kho
  },
  { 
    key: "shipping", 
    label: "Đang giao", 
    icon: <CarOutlined />,
    statuses: ["904", "919", "916"] // Giao hàng, Đang vận chuyển, Giao 1 phần
  },
  { 
    key: "completed", 
    label: "Hoàn thành", 
    icon: <CheckCircleOutlined />,
    statuses: ["905", "909", "910", "911", "912", "913"] // Giao thành công, Đối soát, Hoàn thành
  },
  { 
    key: "cancelled", 
    label: "Đã hủy", 
    icon: <CloseCircleOutlined />,
    statuses: ["914", "906", "907", "908", "915", "917", "1000"] // Hủy, Thất bại, Hoàn, Lỗi...
  },
];

const OrderHistory = () => {
  const dispatch = useDispatch();
  const { userOrders, status } = useSelector((state) => state.order);
  const [activeTab, setActiveTab] = useState("all");
  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  // --- LOGIC LỌC ĐƠN HÀNG THEO TAB ---
  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return userOrders;
    
    // Tìm cấu hình của tab hiện tại
    const currentTabConfig = TABS.find(t => t.key === activeTab);
    if (!currentTabConfig) return userOrders;

    // Lọc đơn có status nằm trong danh sách statuses của Tab
    return userOrders.filter(order => currentTabConfig.statuses.includes(String(order.status)));
  }, [userOrders, activeTab]);

  // --- LOGIC ĐẾM SỐ LƯỢNG CHO BADGE ---
  const getCount = (tabKey) => {
    if (tabKey === "all") return 0; // Không hiện số ở tab Tất cả
    const config = TABS.find(t => t.key === tabKey);
    if (!config) return 0;
    return userOrders.filter(order => config.statuses.includes(String(order.status))).length;
  };

  // Helper format tiền
  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  // Helper render badge màu trạng thái
  const renderStatusTag = (statusTxt, statusCode) => {
      let color = "default";
      if (["900"].includes(statusCode)) color = "blue"; // Mới
      else if (["905", "913"].includes(statusCode)) color = "green"; // Thành công
      else if (["914", "906", "1000"].includes(statusCode)) color = "red"; // Hủy/Lỗi
      else if (["904", "919"].includes(statusCode)) color = "processing"; // Đang giao
      else color = "orange"; // Còn lại (Chờ lấy, Hoàn...)

      return <Tag color={color}>{statusTxt}</Tag>;
  };

  // --- RENDER TAB ITEMS ---
  const tabItems = TABS.map((tab) => ({
    key: tab.key,
    label: (
      <span className="flex items-center gap-2 px-2 py-1">
        {tab.icon}
        {tab.label}
        {/* Hiển thị số lượng đỏ nếu > 0 */}
        {getCount(tab.key) > 0 && (
           <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full min-w-[18px] text-center">
             {getCount(tab.key) > 99 ? '99+' : getCount(tab.key)}
           </span>
        )}
      </span>
    ),
  }));

  if (status === "loading") {
      return <div className="flex justify-center items-center min-h-[400px]"><Spin size="large" /></div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Lịch sử đơn hàng</h1>

        {/* --- TABS --- */}
        <div className="bg-white rounded-t-lg shadow-sm border-b border-gray-200 sticky top-0 z-10">
           <Tabs 
              defaultActiveKey="all" 
              items={tabItems} 
              onChange={setActiveTab} 
              size="large"
              tabBarStyle={{ marginBottom: 0, paddingLeft: 16 }}
           />
        </div>

        {/* --- DANH SÁCH ĐƠN HÀNG --- */}
        <div className="space-y-4 mt-4">
            {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                    <div key={order.order_id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                        
                        {/* Header Đơn */}
                        <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-4 text-sm">
                                <span className="font-bold text-gray-700">#{order.code}</span>
                                <span className="text-gray-400">|</span>
                                <span className="text-gray-500">{order.created_at}</span>
                            </div>
                            <div className="uppercase font-medium text-sm">
                                {renderStatusTag(order.status_txt, String(order.status))}
                            </div>
                        </div>

                        {/* List Sản phẩm */}
                        <div className="px-6 py-4">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex gap-4 mb-4 last:mb-0">
                                    <div className="w-20 h-20 border rounded-md overflow-hidden flex-shrink-0">
                                        <img src={item.image || "https://via.placeholder.com/80"} alt={item.product_name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-base font-medium text-gray-800 line-clamp-2">{item.product_name}</h4>
                                        <div className="text-sm text-gray-500 mt-1">
                                            Phân loại: {item.color} - Size {item.size}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            x{item.quantity}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-red-500 font-medium">{formatPrice(item.price)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer Đơn: Tổng tiền & Nút bấm */}
                        <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="text-gray-500 text-sm">
                                {/* Có thể thêm text "Đánh giá ngay để nhận xu" nếu đơn thành công */}
                                {["905", "913"].includes(String(order.status)) && (
                                    <span className="text-orange-500">Đơn hàng đã hoàn thành</span>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <span className="text-gray-600 text-sm mr-2">Thành tiền:</span>
                                    <span className="text-xl font-bold text-red-600">{formatPrice(order.total)}</span>
                                </div>
                                
                                <div className="flex gap-2">
                                    {/* Logic nút bấm tùy trạng thái */}
                                    <Link to={`/user/orders/${order.order_id}`}>
                                        <Button>Xem chi tiết</Button>
                                    </Link>
                                    
                                    {/* Nút Mua Lại (Chỉ hiện khi đã hoàn thành hoặc hủy) */}
                                    {["905", "913", "914"].includes(String(order.status)) && 
                                        order.items.map((item) => (
                                            <Link key={item.product_id} to={`/product/${item.product_slug}`}>
                                                <Button type="primary" className="bg-blue-600">Mua lại</Button>
                                            </Link>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="bg-white p-12 text-center rounded-lg shadow-sm">
                    <Empty description="Chưa có đơn hàng nào" />
                    <Link to="/product/">
                        <Button type="primary" className="mt-4 bg-blue-600">Mua sắm ngay</Button>
                    </Link>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;