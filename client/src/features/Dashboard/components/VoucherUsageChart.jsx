import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchVoucherUsage } from "../dashboardThunks";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Cell,
  Legend
} from "recharts";
import { Spin, Select, DatePicker, Empty, Typography } from "antd";
import { GiftOutlined, FireOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

export default function VoucherUsageChart() {
  const dispatch = useDispatch();
  const { voucherUsage, loading } = useSelector((state) => state.dashboard);

  const [range, setRange] = useState("30days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // 1. Fetch Data
  useEffect(() => {
    if (range !== "custom") {
        dispatch(fetchVoucherUsage(range));
    }
  }, [range, dispatch]);

  const applyCustomRange = () => {
      if (!customStart || !customEnd) return;
      const customPayload = JSON.stringify({ start: customStart, end: customEnd });
      dispatch(fetchVoucherUsage(customPayload));
  };

  const handleDateChange = (dates) => {
    if (dates) {
        setCustomStart(dates[0].format("YYYY-MM-DD"));
        setCustomEnd(dates[1].format("YYYY-MM-DD"));
    }
  };

  // 2. Xử lý dữ liệu (Quan trọng)
  const chartData = useMemo(() => {
    // Kiểm tra kỹ dữ liệu đầu vào
    if (!Array.isArray(voucherUsage) || voucherUsage.length === 0) return [];
    
    console.log("Voucher Data:", voucherUsage); // Bật F12 Console để xem có dữ liệu không

    // Sắp xếp và ép kiểu
    return [...voucherUsage]
        .map((item, index) => ({
            name: `Voucher #${item.voucher_id}`, // Label trục X
            // !!! ÉP KIỂU SỐ !!!
            used: Number(item.used) || 0,
            discount: Number(item.total_discount) || 0,
            rank: index + 1
        }))
        .sort((a, b) => b.used - a.used) // Sắp xếp giảm dần
        .slice(0, 10);
  }, [voucherUsage]);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-pink-100 shadow-xl rounded-lg z-50">
          <div className="font-bold text-gray-800 mb-1 flex items-center gap-2">
             <GiftOutlined className="text-pink-500" /> {label}
          </div>
          <div className="text-sm text-gray-600 mb-1">
             Đã dùng: <span className="font-bold">{data.used}</span> lần
          </div>
          <div className="text-sm font-semibold text-green-600 border-t pt-1 border-gray-100">
             Tiết kiệm: {formatPrice(data.discount)}
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
              <h2 className="text-lg font-bold text-gray-800 m-0 flex items-center gap-2">
                  Hiệu quả Voucher <FireOutlined className="text-red-500"/>
              </h2>
              <Text type="secondary" className="text-xs">Top mã giảm giá được dùng nhiều nhất</Text>
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
                 <Option value="custom">Tùy chọn</Option>
             </Select>

             {range === "custom" && (
                 <div className="flex gap-1">
                     <RangePicker size="small" style={{ width: 200 }} onChange={handleDateChange} />
                     <button onClick={applyCustomRange} className="bg-pink-600 text-white text-xs px-2 rounded hover:bg-pink-700">Lọc</button>
                 </div>
             )}
          </div>
      </div>

      {/* CHART CONTENT - FIX CỨNG CHIỀU CAO */}
      <div style={{ width: '100%', height: 350, minHeight: 300 }}>
         {loading ? (
             <div className="h-full flex justify-center items-center"><Spin /></div>
         ) : chartData.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
                 <BarChart 
                    data={chartData} 
                    margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                    barCategoryGap="30%"
                 >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    
                    <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 11, fill: '#555' }}
                        axisLine={{ stroke: '#eee' }}
                        tickLine={false}
                        interval={0} // Hiển thị hết label
                    />
                    
                    <YAxis 
                        tick={{ fontSize: 11, fill: '#555' }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                    />
                    
                    <Tooltip content={<CustomTooltip />} cursor={{fill: '#fff1f2'}} />
                    
                    <Bar 
                        name="Lượt dùng"
                        dataKey="used" 
                        radius={[4, 4, 0, 0]} 
                        animationDuration={1500}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index < 3 ? "#db2777" : "#f472b6"} /> 
                        ))}
                    </Bar>
                 </BarChart>
             </ResponsiveContainer>
         ) : (
             <div className="h-full flex flex-col justify-center items-center">
                 <Empty description="Chưa có dữ liệu voucher" />
             </div>
         )}
      </div>
    </div>
  );
}