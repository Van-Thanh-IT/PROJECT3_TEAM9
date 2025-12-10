import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSummaryTotal } from "../dashboardThunks";
import { Spin } from "antd";
import { 
  ShoppingCartOutlined, 
  DollarCircleOutlined, 
  InboxOutlined, 
  UserOutlined,
  CloseCircleOutlined,
  ArrowUpOutlined
} from "@ant-design/icons";

const SummaryTotalCards = () => {
  const dispatch = useDispatch();
  const { summaryTotal, loading } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchSummaryTotal());
  }, [dispatch]);

  if (loading || !summaryTotal) {
    return <div className="flex justify-center p-10"><Spin size="large" /></div>;
  }

  const items = [
    {
      title: "Tổng đơn hàng",
      value: summaryTotal.total_orders,
      icon: <ShoppingCartOutlined />,
      iconColor: "text-blue-600",
      bgIcon: "bg-blue-100",
      trend: "+12%", // Fake số liệu tăng trưởng để demo đẹp hơn
    },
    {
      title: "Tổng doanh thu",
      value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(summaryTotal.total_revenue),
      icon: <DollarCircleOutlined />,
      iconColor: "text-green-600",
      bgIcon: "bg-green-100",
      trend: "+25%",
    },
    {
      title: "Sản phẩm đã bán",
      value: summaryTotal.total_products_sold,
      icon: <InboxOutlined />,
      iconColor: "text-orange-600",
      bgIcon: "bg-orange-100",
      trend: "+5%",
    },
    {
      title: "Tổng khách hàng",
      value: summaryTotal.total_users,
      icon: <UserOutlined />,
      iconColor: "text-purple-600",
      bgIcon: "bg-purple-100",
      trend: "+8%",
    },
    {
      title: "Đơn hủy",
      value: summaryTotal.total_canceled_orders,
      icon: <CloseCircleOutlined />,
      iconColor: "text-red-600",
      bgIcon: "bg-red-100",
      trend: "-2%", 
      isNegative: true, // Dùng để tô màu đỏ cho trend giảm (hoặc tăng xấu)
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {items.map((item, index) => (
        <div 
          key={index} 
          className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
               <p className="text-gray-500 text-sm font-medium mb-1">{item.title}</p>
               <h3 className="text-2xl font-bold text-gray-800 tracking-tight group-hover:text-blue-600 transition-colors">
                  {item.value}
               </h3>
            </div>
            <div className={`p-3 rounded-lg ${item.bgIcon} ${item.iconColor} text-xl flex items-center justify-center`}>
               {item.icon}
            </div>
          </div>
          
          <div className="flex items-center text-xs font-medium text-gray-400 pt-2 border-t border-gray-50">
             <span className={`${item.isNegative ? 'text-red-500' : 'text-green-500'} flex items-center mr-2 bg-gray-50 px-1.5 py-0.5 rounded`}>
                <ArrowUpOutlined className={`mr-1 ${item.isNegative ? 'rotate-180' : ''}`} />
                {item.trend}
             </span>
             <span>so với tháng trước</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryTotalCards;