import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderStatus } from "../dashboardThunks"; 

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { Spin, Alert } from "antd";


const STATUS_COLORS = {
    '900': '#3b82f6', 
    '905': '#22c55e', 
    '914': '#ef4444', 
    'default': '#f59e0b' 
};

export default function OrderStatusChart() {
  const dispatch = useDispatch();
  const { orderStatus, loading, error } = useSelector((state) => state.dashboard);

  const [range, setRange] = useState("30days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // 1. Fetch data
  useEffect(() => {
    if (range !== "custom") {
      dispatch(fetchOrderStatus(range)); 
    }
  }, [range, dispatch]);

  // 2. Custom Filter
  const applyCustomRange = () => {
    if (!customStart || !customEnd) return alert("Chọn ngày bắt đầu và kết thúc");
    const customPayload = JSON.stringify({ start: customStart, end: customEnd });
    dispatch(fetchOrderStatus(customPayload));
  };

  // 3. Xử lý dữ liệu (Fix lỗi không hiện)
  const chartData = useMemo(() => {
      if (!Array.isArray(orderStatus) || orderStatus.length === 0) return [];
      
      console.log("Order Status Data:", orderStatus); // Debug xem có data không

      return orderStatus
        .map((item) => ({
            name: getShortStatusName(item.shipping_status), 
            fullName: getShortStatusName(item.shipping_status),  
            status: String(item.shipping_status), // Chuyển về string để so sánh màu
            // !!! QUAN TRỌNG: Ép kiểu sang Number !!!
            total: Number(item.total) || 0,
        }))
        // Lọc bỏ các trạng thái có total = 0 (nếu muốn gọn)
        .filter(item => item.total > 0)
        .sort((a, b) => b.total - a.total);
  }, [orderStatus]);

  // Helper lấy màu
  const getBarColor = (statusCode) => {
      if (['900'].includes(statusCode)) return STATUS_COLORS['900'];
      if (['905', '913'].includes(statusCode)) return STATUS_COLORS['905'];
      if (['914', '906', '1000'].includes(statusCode)) return STATUS_COLORS['914'];
      return STATUS_COLORS['default'];
  }

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded z-50">
          <p className="text-sm font-bold text-gray-700">{data.fullName}</p>
          <p className="text-sm text-blue-600 font-semibold">
            Số lượng: {data.total} đơn
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-4 shadow rounded-lg h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h2 className="text-lg font-bold text-gray-700">Trạng thái đơn hàng</h2>

          {/* Filter */}
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="border border-gray-300 p-1.5 rounded text-sm bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="today">Hôm nay</option>
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
              <option value="custom">Tùy chọn...</option>
            </select>

            {range === "custom" && (
              <div className="flex gap-2">
                <input type="date" className="border p-1 rounded text-xs" onChange={(e) => setCustomStart(e.target.value)} />
                <input type="date" className="border p-1 rounded text-xs" onChange={(e) => setCustomEnd(e.target.value)} />
                <button onClick={applyCustomRange} className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Lọc</button>
              </div>
            )}
          </div>
      </div>

      {/* Set height cứng để đảm bảo hiển thị */}
      <div style={{ width: '100%', height: 350, minHeight: 300 }}>
        {loading ? (
           <div className="h-full flex justify-center items-center"><Spin size="large" /></div>
        ) : error ? (
            <Alert message="Lỗi" description={error} type="error" showIcon />
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
                data={chartData} 
                layout="vertical" 
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={100} 
                tick={{ fontSize: 11, fill: '#555', fontWeight: 600 }} 
                interval={0} // Hiển thị hết tên
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
              <Bar dataKey="total" barSize={20} radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
            <div className="h-full flex justify-center items-center text-gray-400 italic bg-gray-50 rounded">
                Chưa có dữ liệu đơn hàng
            </div>
        )}
      </div>
    </div>
  );
}

function getShortStatusName(code) {
    const map = {
        900: "Đơn mới",
        901: "Chờ lấy hàng",
        902: "Lấy hàng",
        903: "Đã lấy hàng",
        904: "Giao hàng",
        905: "Giao thành công",
        906: "Giao thất bại",
        907: "Đang chuyển hoàn",
        908: "Chuyển hoàn",
        909: "Đã đối soát",
        910: "Đã đối soát KH",
        911: "Đã trả COD cho KH",
        912: "Chờ thanh toán COD",
        913: "Hoàn thành",
        914: "Đơn hủy",
        915: "Chậm lấy/giao",
        916: "Giao hàng một phần",
        917: "Thất lạc hàng",
        918: "Đang lưu kho",
        919: "Đang vận chuyển",
        1000: "Đơn lỗi"
    };
    return map[code] || code;
}
