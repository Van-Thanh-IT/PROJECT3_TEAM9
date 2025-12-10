import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTopCustomers } from "../dashboardThunks";
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
import { Spin, Select, DatePicker, Empty, Typography, Avatar } from "antd";
import { CrownFilled, UserOutlined } from "@ant-design/icons";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

export default function TopCustomersChart() {
  const dispatch = useDispatch();
  const { topCustomers, loading } = useSelector((state) => state.dashboard);

  const [range, setRange] = useState("30days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // 1. Fetch Data
  useEffect(() => {
    if (range !== "custom") {
        dispatch(fetchTopCustomers(range));
    }
  }, [range, dispatch]);

  const applyCustomRange = () => {
      if (!customStart || !customEnd) return;
      const customPayload = JSON.stringify({ start: customStart, end: customEnd });
      dispatch(fetchTopCustomers(customPayload));
  };

  const handleDateChange = (dates) => {
    if (dates) {
        setCustomStart(dates[0].format("YYYY-MM-DD"));
        setCustomEnd(dates[1].format("YYYY-MM-DD"));
    }
  };

  // 2. Xử lý dữ liệu cho biểu đồ
  const chartData = useMemo(() => {
    if (!Array.isArray(topCustomers)) return [];
    
    return [...topCustomers]
        .map((item, index) => ({
            name: item.username, // Tên hiển thị trục X
            email: item.email,
            phone: item.phone,
            avatar: item.avatar,
            total: Number(item.total_spent) || 0, // Giá trị trục Y
            rank: index + 1
        }))
        .sort((a, b) => b.total - a.total) // Sắp xếp giảm dần
        .slice(0, 10); // Lấy top 10
  }, [topCustomers]);

  // Màu sắc cột
  const getBarColor = (index) => {
      if (index === 0) return "#FFD700"; // Vàng
      if (index === 1) return "#C0C0C0"; // Bạc
      if (index === 2) return "#CD7F32"; // Đồng
      return "#8b5cf6"; // Tím mặc định
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg z-50">
          <div className="flex items-center gap-3 mb-2">
             <Avatar src={data.avatar} icon={<UserOutlined />} size={32} />
             <div>
                 <div className="font-bold text-gray-800 text-sm">{data.name}</div>
                 <div className="text-xs text-gray-500">{data.email}</div>
             </div>
          </div>
          <div className="text-sm font-semibold text-purple-600 border-t pt-2 mt-1">
             Chi tiêu: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.total)}
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
              <h2 className="text-lg font-bold text-gray-800 m-0">Top Khách Hàng</h2>
              <Text type="secondary" className="text-xs">Xếp hạng theo tổng chi tiêu</Text>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
             <Select 
                defaultValue="30days" 
                value={range} 
                onChange={setRange}
                className="w-28"
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
                     <button onClick={applyCustomRange} className="bg-purple-600 text-white text-xs px-2 rounded">Lọc</button>
                 </div>
             )}
          </div>
      </div>

      {/* CHART CONTENT */}
      {/* Fix cứng chiều cao để tránh lỗi trắng biểu đồ */}
      <div style={{ width: '100%', height: 350 }}>
         {loading ? (
             <div className="h-full flex justify-center items-center"><Spin /></div>
         ) : chartData.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
                 <BarChart 
                    data={chartData} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    barCategoryGap="20%"
                 >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    
                    <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 11, fill: '#555' }}
                        axisLine={{ stroke: '#eee' }}
                        tickLine={false}
                        interval={0}
                        // Cắt tên nếu quá dài
                        tickFormatter={(val) => val.length > 10 ? `${val.substring(0, 10)}...` : val}
                    />
                    
                    <YAxis 
                        tick={{ fontSize: 11, fill: '#555' }}
                        axisLine={false}
                        tickLine={false}
                        width={60}
                        // Format số tiền trục Y (ví dụ: 25M, 100K)
                        tickFormatter={(value) => new Intl.NumberFormat('en', { notation: "compact" }).format(value)}
                    />
                    
                    <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                    
                    {/* Cột hiển thị */}
                    <Bar dataKey="total" radius={[4, 4, 0, 0]} animationDuration={1500}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                        ))}
                    </Bar>

                 </BarChart>
             </ResponsiveContainer>
         ) : (
             <div className="h-full flex flex-col justify-center items-center">
                 <Empty description="Chưa có dữ liệu khách hàng" />
             </div>
         )}
      </div>
    </div>
  );
}