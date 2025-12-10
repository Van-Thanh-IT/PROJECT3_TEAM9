import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNewUsers } from "../dashboardThunks";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  // Bỏ Defs, LinearGradient, Stop ở đây vì chúng là thẻ SVG native, không phải của Recharts
} from "recharts";
import { Spin, Select, DatePicker, Empty, Typography } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function NewUsersChart() {
  const dispatch = useDispatch();
  const { newUsers, loading } = useSelector((state) => state.dashboard);

  const [range, setRange] = useState("30days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  useEffect(() => {
    if (range !== "custom") {
      dispatch(fetchNewUsers(range));
    }
  }, [range, dispatch]);

  const handleDateChange = (dates) => {
    if (dates) {
        setCustomStart(dates[0].format("YYYY-MM-DD"));
        setCustomEnd(dates[1].format("YYYY-MM-DD"));
    }
  };

  const applyCustomRange = () => {
    if (!customStart || !customEnd) return;
    const customPayload = JSON.stringify({ start: customStart, end: customEnd });
    dispatch(fetchNewUsers(customPayload));
  };

  const chartData = useMemo(() => {
    if (!Array.isArray(newUsers)) return [];
    return newUsers.map((item) => ({
      date: dayjs(item.date).format("DD/MM"),
      fullDate: item.date,
      total: Number(item.total) || 0,
    }));
  }, [newUsers]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-purple-100 shadow-xl rounded-lg z-50">
          <p className="text-sm font-bold text-gray-700 mb-1">{payload[0].payload.fullDate}</p>
          <div className="text-purple-600 font-semibold text-sm">
             <UserAddOutlined className="mr-1" />
             Thêm mới: {payload[0].value} người
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
          <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-800 m-0">Khách hàng mới</h2>
              <div className="bg-purple-100 p-1.5 rounded-md text-purple-600">
                <UserAddOutlined />
              </div>
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
                        className="bg-purple-600 text-white text-xs px-2 rounded hover:bg-purple-700 transition"
                     >
                        Lọc
                     </button>
                 </div>
             )}
          </div>
      </div>

      {/* CHART CONTENT */}
      <div style={{ width: '100%', height: 350 }}>
         {loading ? (
             <div className="h-full flex justify-center items-center"><Spin /></div>
         ) : chartData.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
                 <AreaChart 
                    data={chartData} 
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                 >
                    {/* Dùng thẻ SVG thường (chữ thường) */}
                    <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    
                    <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 11, fill: '#555' }}
                        axisLine={{ stroke: '#eee' }}
                        tickLine={false}
                        interval="preserveStartEnd"
                    />
                    <YAxis 
                        tick={{ fontSize: 11, fill: '#555' }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false} 
                        width={30}
                    />
                    
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#8b5cf6', strokeWidth: 1 }} />
                    
                    <Area 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorUsers)" 
                        animationDuration={1500}
                    />
                 </AreaChart>
             </ResponsiveContainer>
         ) : (
             <div className="h-full flex flex-col justify-center items-center">
                 <Empty description="Chưa có người dùng mới" />
             </div>
         )}
      </div>
    </div>
  );
}