import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRevenue } from "../dashboardThunks";
import {
  BarChart,
  Bar,     
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";
import dayjs from "dayjs";
import { Spin, Alert } from "antd";

export default function RevenueChart() {
  const dispatch = useDispatch();
  const { revenue, loading, error } = useSelector((state) => state.dashboard);

  const [range, setRange] = useState("30days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  useEffect(() => {
    if (range !== "custom") {
      dispatch(fetchRevenue(range));
    }
  }, [range, dispatch]);

  const applyCustomRange = () => {
    if (!customStart || !customEnd) return alert("Chọn ngày bắt đầu và kết thúc");
    const customPayload = JSON.stringify({ start: customStart, end: customEnd });
    dispatch(fetchRevenue(customPayload));
  };

  // --- LOGIC XỬ LÝ DỮ LIỆU & GIỚI HẠN CỘT ---
  const chartData = useMemo(() => {
    if (!Array.isArray(revenue) || revenue.length === 0) return [];

    // 1. Chuyển đổi dữ liệu thô
    let data = revenue.map((item) => ({
        date: dayjs(item.date).format("DD/MM"),
        fullDate: item.date,
        total: item.total ? Number(item.total) : 0,
    }));

    // 2. Logic giới hạn số cột (Sampling)
    // - today, 7days: Giữ nguyên
    // - Các range khác (30, 90, custom): Giới hạn tối đa 12 cột
    if (range !== 'today' && range !== '7days' && data.length > 12) {
        const step = Math.ceil(data.length / 12);
        // Lọc: Lấy các điểm chia hết cho step HOẶC điểm cuối cùng (để luôn hiện ngày mới nhất)
        data = data.filter((_, index) => index % step === 0 || index === data.length - 1);
    }

    return data;
  }, [revenue, range]);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded z-50">
          <p className="text-sm font-bold text-gray-700">{payload[0].payload.fullDate}</p>
          <p className="text-sm text-blue-600 font-semibold">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white shadow p-4 rounded-lg h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h2 className="text-lg font-bold text-gray-700">Biểu đồ doanh thu</h2>
          
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="border border-gray-300 p-1.5 rounded text-sm bg-white"
            >
              <option value="today">Hôm nay</option>
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
              <option value="90days">3 tháng qua</option>
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

      <div style={{ width: '100%', height: 350, minHeight: 300 }}>
        {loading ? (
           <div className="h-full flex justify-center items-center"><Spin size="large" /></div>
        ) : error ? (
           <Alert message="Lỗi tải dữ liệu" description={error} type="error" showIcon />
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {/* Sử dụng BarChart */}
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fill: '#888' }} 
                tickLine={false}
                axisLine={{ stroke: '#eee' }}
                interval={0} // Hiển thị hết các label đã lọc
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#888' }} 
                tickFormatter={(val) => new Intl.NumberFormat('en', { notation: "compact" }).format(val)}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              
              <Bar 
                name="Doanh thu" 
                dataKey="total" 
                fill="#3b82f6" // Màu xanh
                radius={[4, 4, 0, 0]} 
                barSize={30} // Kích thước cột vừa phải
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
            <div className="h-full flex justify-center items-center text-gray-400 bg-gray-50 rounded">
                Chưa có dữ liệu doanh thu
            </div>
        )}
      </div>
    </div>
  );
}