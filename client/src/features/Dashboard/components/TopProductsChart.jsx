import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTopProducts } from "../dashboardThunks";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid
} from "recharts";
import { Spin, Select, DatePicker, Typography, Empty } from "antd";
import { TrophyOutlined } from "@ant-design/icons";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

export default function TopProductsChart() {
  const dispatch = useDispatch();
  
  // Lấy data từ Redux
  const { topProducts, loading } = useSelector((state) => state.dashboard);

  const [range, setRange] = useState("30days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // 1. Fetch Data
  useEffect(() => {
    if (range !== "custom") {
      dispatch(fetchTopProducts(range));
    }
  }, [range, dispatch]);

  // 2. Filter Custom
  const handleDateChange = (dates) => {
      if (dates) {
          setCustomStart(dates[0].format("YYYY-MM-DD"));
          setCustomEnd(dates[1].format("YYYY-MM-DD"));
      }
  };

  const applyCustomRange = () => {
      if (!customStart || !customEnd) return;
      const customPayload = JSON.stringify({ start: customStart, end: customEnd });
      dispatch(fetchTopProducts(customPayload));
  };

  // 3. Xử lý dữ liệu (Quan trọng)
  const chartData = useMemo(() => {
    // Kiểm tra an toàn: nếu topProducts undefined hoặc null thì trả về mảng rỗng
    if (!topProducts || !Array.isArray(topProducts)) return [];
    


    return topProducts.map((item, index) => ({
        name: item.product_name, // Tên cho trục Y
        // Tạo label đầy đủ cho Tooltip: Tên + (Màu/Size)
        fullLabel: `${item.product_name} (${item.color}/${item.size})`,
        // Ép kiểu số cho total_sold (quan trọng)
        sales: Number(item.total_sold) || 0,
        rank: index + 1
    }));
  }, [topProducts]);

  // Màu sắc Top 3
  const getBarColor = (index) => {
      if (index === 0) return "#FFD700"; // Vàng
      if (index === 1) return "#C0C0C0"; // Bạc
      if (index === 2) return "#CD7F32"; // Đồng
      return "#3b82f6"; // Xanh mặc định
  };

  // Tooltip tùy chỉnh
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg z-50">
          <div className="font-bold text-gray-800 mb-1 flex items-center gap-2">
             {data.rank === 1 && <TrophyOutlined className="text-yellow-500" />}
             #{data.rank} {data.fullLabel}
          </div>
          <div className="text-sm font-semibold text-blue-600">
             Đã bán: {new Intl.NumberFormat('vi-VN').format(data.sales)}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-5 shadow rounded-xl h-full flex flex-col border border-gray-100">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
              <h2 className="text-lg font-bold text-gray-800 m-0">Top sản phẩm bán chạy</h2>
              <Text type="secondary" className="text-xs">Xếp hạng theo số lượng bán ra</Text>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
             <Select 
                defaultValue="30days" 
                value={range} 
                onChange={setRange}
                className="w-32"
                size="small"
             >
                 <Option value="today">Hôm nay</Option>
                 <Option value="7days">7 ngày</Option>
                 <Option value="30days">30 ngày</Option>
                 <Option value="90days">3 tháng</Option>
                 <Option value="custom">Tùy chọn</Option>
             </Select>

             {range === "custom" && (
                 <div className="flex gap-1">
                     <RangePicker size="small" style={{ width: 200 }} onChange={handleDateChange} />
                     <button 
                        onClick={applyCustomRange}
                        className="bg-blue-600 text-white text-xs px-2 rounded hover:bg-blue-700 transition"
                     >
                        Lọc
                     </button>
                 </div>
             )}
          </div>
      </div>

      {/* CHART CONTENT */}
      {/* Fix cứng minHeight để đảm bảo biểu đồ luôn hiện */}
      <div style={{ width: '100%', height: 400, minHeight: 350 }}>
         {loading ? (
             <div className="h-full flex justify-center items-center"><Spin size="large" /></div>
         ) : chartData.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
                 <BarChart 
                    data={chartData} 
                    layout="vertical" 
                    // Tăng margin left để không bị che tên sản phẩm
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    barCategoryGap={20} // Khoảng cách giữa các cột
                 >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                    
                    {/* Trục X là số lượng (Type number) */}
                    <XAxis type="number" hide />
                    
                    {/* Trục Y là Tên sản phẩm (Type category) */}
                    <YAxis 
                        type="category" 
                        dataKey="name" // Dùng tên ngắn gọn để hiển thị trục Y
                        width={150} 
                        tick={{ fontSize: 11, fill: '#555' }}
                        interval={0} // Hiển thị tất cả các nhãn
                        // Cắt bớt tên nếu quá dài
                        tickFormatter={(value) => value.length > 20 ? `${value.substring(0, 20)}...` : value}
                    />
                    
                    <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                    
                    <Bar dataKey="sales" radius={[0, 4, 4, 0]} barSize={24} animationDuration={1000}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                        ))}
                    </Bar>
                 </BarChart>
             </ResponsiveContainer>
         ) : (
             <div className="h-full flex flex-col justify-center items-center text-gray-400">
                 <Empty description="Chưa có dữ liệu bán hàng" />
             </div>
         )}
      </div>
    </div>
  );
}