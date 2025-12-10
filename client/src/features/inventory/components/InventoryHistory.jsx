import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { clearInventoryState } from "../../../features/inventory/inventorySlice"; 
import { getVariantHistory as fetchHistoryApi } from "../../../features/inventory/inventoryThunks"; 
import CustomTable from "../../../components/common/table/CustomTable";
import { 
  ArrowLeftOutlined, 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  FilterOutlined 
} from "@ant-design/icons";
import { 
  Button, 
  Tag, 
  Select, 
  DatePicker, 
  Card, 
  Typography,
  message
} from "antd";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const InventoryHistory = () => {
  const { variantId } = useParams(); 
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Lấy dữ liệu từ Redux
  const { variantHistory, status, error } = useSelector((state) => state.inventory);
  
  // State cho bộ lọc
  const [filterType, setFilterType] = useState("all");
  const [filterDateRange, setFilterDateRange] = useState(null); // State lưu khoảng thời gian

  // Fetch dữ liệu khi vào trang
  useEffect(() => {
    if (variantId) {
        dispatch(fetchHistoryApi(variantId));
    }
    // Cleanup khi rời trang
    return () => dispatch(clearInventoryState());
  }, [dispatch, variantId]);

  // Hiển thị lỗi nếu có
  useEffect(() => {
    if (status === 'failed' && error) {
        message.error(error);
    }
  }, [status, error]);

  // --- LOGIC LỌC DỮ LIỆU ---
  const filteredData = useMemo(() => {
    let data = Array.isArray(variantHistory) ? [...variantHistory] : [];

    // 1. Lọc theo Loại giao dịch
    if (filterType !== "all") {
        data = data.filter(item => item.reference_type === filterType);
    }

    // 2. Lọc theo Thời gian (Date Range)
    if (filterDateRange && filterDateRange.length === 2) {
        // startOf và endOf giúp so sánh chính xác trọn vẹn ngày
        const startDate = filterDateRange[0].startOf('day'); 
        const endDate = filterDateRange[1].endOf('day');     

        data = data.filter(item => {
            const itemDate = dayjs(item.created_at);
            // Kiểm tra itemDate có nằm trong khoảng [startDate, endDate]
            return (itemDate.isAfter(startDate) || itemDate.isSame(startDate)) && 
                   (itemDate.isBefore(endDate) || itemDate.isSame(endDate));
        });
    }

    // Sắp xếp mới nhất lên đầu (theo ID giảm dần)
    return data.sort((a, b) => b.id - a.id);
  }, [variantHistory, filterType, filterDateRange]);

  // --- HELPER RENDER LOẠI GIAO DỊCH ---
  const renderTypeTag = (type) => {
      let color = "default";
      let text = type;
      let icon = null;

      switch (type) {
          case "IMPORT":
              color = "green"; text = "Nhập Kho"; icon = <ArrowUpOutlined />;
              break;
          case "EXPORT":
              color = "orange"; text = "Xuất Kho"; icon = <ArrowDownOutlined />;
              break;
          case "ADJUST":
              color = "blue"; text = "Kiểm Kê";
              break;
          case "ORDER":
              color = "red"; text = "Bán Hàng"; icon = <ArrowDownOutlined />;
              break;
          case "RETURN":
              color = "cyan"; text = "Trả Hàng"; icon = <ArrowUpOutlined />;
              break;
          case "CANCEL":
              color = "purple"; text = "Hủy Đơn"; icon = <ArrowUpOutlined />;
              break;
          default:
              break;
      }

      return <Tag color={color} icon={icon}>{text}</Tag>;
  };

  // --- CẤU HÌNH CỘT ---
  const columns = [
    {
      title: "Thời gian",
      dataIndex: "created_at",
      key: "time",
      width: 160,
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Loại giao dịch",
      dataIndex: "reference_type",
      key: "type",
      width: 140,
      align: "center",
      render: (type) => renderTypeTag(type),
    },
    {
      title: "Mã Phiếu / Đơn",
      key: "ref_id",
      width: 150,
      render: (_, record) => (
          <span className="font-mono text-gray-600">
              #{record.reference_id}
          </span>
      )
    },
    {
        title: "Thay đổi",
        dataIndex: "change_amount",
        key: "change",
        align: "right",
        width: 120,
        render: (amount) => (
            <span className={`font-bold ${amount > 0 ? "text-green-600" : "text-red-600"}`}>
                {amount > 0 ? `+${amount}` : amount}
            </span>
        )
    },
    {
      title: "Tồn trước",
      dataIndex: "previous_quantity",
      key: "prev",
      align: "center",
      width: 100,
      render: (val) => <span className="text-gray-500">{val}</span>
    },
    {
      title: "Tồn sau",
      dataIndex: "new_quantity",
      key: "new",
      align: "center",
      width: 100,
      render: (val) => <span className="font-bold text-blue-700">{val}</span>
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      render: (text) => <span className="italic text-gray-500">{text || "---"}</span>
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-6">
            <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate("/admin/inventory")} 
            />
            <div>
                <Title level={4} style={{ margin: 0 }}>Lịch sử biến động kho</Title>
                <div className="text-gray-500 text-sm mt-1">
                    Mã biến thể: <span className="font-bold text-black">#{variantId}</span>
                </div>
            </div>
        </div>

        {/* FILTER BAR */}
        <Card className="mb-6 bg-gray-50 border-gray-200" bodyStyle={{ padding: '16px' }}>
            <div className="flex flex-wrap gap-4">
                <Select 
                    defaultValue="all" 
                    style={{ width: 200 }} 
                    onChange={setFilterType}
                    suffixIcon={<FilterOutlined />}
                >
                    <Option value="all">Tất cả giao dịch</Option>
                    <Option value="IMPORT">Nhập kho</Option>
                    <Option value="EXPORT">Xuất kho</Option>
                    <Option value="ADJUST">Kiểm kê / Điều chỉnh</Option>
                    <Option value="ORDER">Bán hàng</Option>
                    <Option value="RETURN">Trả hàng</Option>
                    <Option value="CANCEL">Hủy đơn</Option>
                </Select>

                <RangePicker 
                    style={{ width: 280 }} 
                    format="DD/MM/YYYY" 
                    placeholder={['Từ ngày', 'Đến ngày']}
                    onChange={(dates) => setFilterDateRange(dates)} 
                />
            </div>
        </Card>

        {/* TABLE */}
        <CustomTable 
            columns={columns}
            data={filteredData}
            loading={status === 'loading'}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: 800 }}
        />

      </div>
    </div>
  );
};

export default InventoryHistory;