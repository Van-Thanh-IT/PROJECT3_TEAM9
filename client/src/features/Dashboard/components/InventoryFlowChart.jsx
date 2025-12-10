import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInventoryFlow } from "../dashboardThunks";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Spin, Select, DatePicker, Empty } from "antd";
import { SwapOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function InventoryFlowChart() {
  const dispatch = useDispatch();
  const { inventoryFlow, loading } = useSelector((state) => state.dashboard);

  const [range, setRange] = useState("30days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  useEffect(() => {
    if (range !== "custom") {
      dispatch(fetchInventoryFlow(range));
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
    dispatch(fetchInventoryFlow(customPayload));
  };

  // --- 3. XỬ LÝ DỮ LIỆU ---
  const chartData = useMemo(() => {
    if (!Array.isArray(inventoryFlow)) return [];

    console.log("Inventory Flow Data:", inventoryFlow); // Debug

    return inventoryFlow.map((item) => ({
      date: dayjs(item.date).format("DD/MM"),
      fullDate: item.date,
      // QUAN TRỌNG: Ép kiểu sang Number, nếu null/undefined thì về 0
      import: item.import_qty ? Number(item.import_qty) : 0,
      export: item.export_qty ? Number(item.export_qty) : 0,
    }));
  }, [inventoryFlow]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg z-50">
          <p className="text-sm font-bold text-gray-700 mb-2">{payload[0].payload.fullDate}</p>
          <div className="flex items-center gap-2 text-sm text-green-600">
             <span className="w-2 h-2 rounded-full bg-green-500"></span>
             Nhập: <span className="font-bold">{new Intl.NumberFormat('vi-VN').format(payload[0].value)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-orange-500">
             <span className="w-2 h-2 rounded-full bg-orange-500"></span>
             Xuất: <span className="font-bold">{new Intl.NumberFormat('vi-VN').format(payload[1].value)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-5 shadow rounded-xl h-full flex flex-col border border-gray-100">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-800 m-0">Biến động kho hàng</h2>
              <SwapOutlined className="text-blue-500" />
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
             <Select 
                defaultValue="30days" 
                value={range} 
                onChange={setRange}
                className="w-32"
                size="small"
             >
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

      {/* Fix chiều cao cứng ở đây */}
      <div style={{ width: "100%", height: 350 }}>
         {loading ? (
             <div className="h-full flex justify-center items-center"><Spin /></div>
         ) : chartData.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
                 <BarChart 
                    data={chartData} 
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    barGap={0} // Để 2 cột dính sát nhau hoặc tách ra tùy ý
                 >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    
                    <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 11, fill: '#555' }}
                        axisLine={{ stroke: '#eee' }}
                        tickLine={false}
                    />
                    <YAxis 
                        tick={{ fontSize: 11, fill: '#555' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => new Intl.NumberFormat('en', { notation: "compact" }).format(value)}
                        width={40}
                    />
                    
                    <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    
                    <Bar 
                        name="Nhập kho" 
                        dataKey="import" 
                        fill="#22c55e" 
                        radius={[4, 4, 0, 0]} 
                        barSize={20}
                        animationDuration={1000}
                    />
                    
                    <Bar 
                        name="Xuất kho" 
                        dataKey="export" 
                        fill="#f97316" 
                        radius={[4, 4, 0, 0]} 
                        barSize={20}
                        animationDuration={1000}
                    />
                 </BarChart>
             </ResponsiveContainer>
         ) : (
             <div className="h-full flex flex-col justify-center items-center">
                 <Empty description="Chưa có dữ liệu biến động" />
             </div>
         )}
      </div>
    </div>
  );
}