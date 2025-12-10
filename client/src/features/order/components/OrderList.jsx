import React, { useState, useMemo } from "react";
import dayjs from "dayjs";
import CustomTable from "../../../components/common/table/CustomTable";
import { exportExcel } from "../../../utils/exportExcel"; 

import { 
  EyeOutlined, 
  SearchOutlined, 
  FilterOutlined, 
  ReloadOutlined,
  FileExcelOutlined,
  ShoppingOutlined,
  DollarCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import { 
  Button, 
  Input, 
  Tag, 
  Tooltip, 
  Select, 
  DatePicker, 
  Card,
  Space,
  Row,
  Col,
  Statistic,
  message
} from "antd";

const { Option } = Select;
const { RangePicker } = DatePicker;

const OrderList = ({ orders, loading, onRefresh, onViewDetail }) => {
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState(null);

  // --- LOGIC LỌC DỮ LIỆU ---
  const filteredData = useMemo(() => {
    let data = Array.isArray(orders) ? [...orders] : [];

    // 1. Lọc theo mã đơn
    if (searchText) {
      const lowerText = searchText.toLowerCase();
      data = data.filter((item) => 
        item.code?.toLowerCase().includes(lowerText)
      );
    }

    // 2. Lọc theo trạng thái
    if (filterStatus !== "all") {
      data = data.filter((item) => String(item.shipping_status) === String(filterStatus));
    }

    // 3. Lọc theo ngày
    if (dateRange) {
      const start = dateRange[0].startOf('day');
      const end = dateRange[1].endOf('day');
      data = data.filter(item => {
        const itemDate = dayjs(item.created_at);
        return itemDate >= start && itemDate <= end;
      });
    }

    // Sắp xếp mới nhất lên đầu
    return data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [orders, searchText, filterStatus, dateRange]);

  // --- TÍNH TOÁN SUMMARY (TỔNG QUAN) ---
  const summaryData = useMemo(() => {
    const totalOrders = orders.length;
    // Tính tổng doanh thu (chỉ tính đơn thành công 905, 913)
    const totalRevenue = orders
        .filter(o => ['905', '913'].includes(String(o.shipping_status)))
        .reduce((acc, curr) => acc + (Number(curr.final_amount) || 0), 0);
    
    const newOrdersCount = orders.filter(o => String(o.shipping_status) === '900').length;
    const cancelledOrdersCount = orders.filter(o => String(o.shipping_status) === '914').length;

    return { totalOrders, totalRevenue, newOrdersCount, cancelledOrdersCount };
  }, [orders]);

  // --- XUẤT EXCEL ---
  const handleExportExcel = () => {
    if (filteredData.length === 0) {
        message.warning("Không có dữ liệu để xuất!");
        return;
    }

    const dataToExport = filteredData.map(item => ({
        "Mã đơn hàng": item.code,
        "Ngày đặt": dayjs(item.created_at).format("DD/MM/YYYY HH:mm"),
        "Khách hàng": item.address?.full_name || "N/A",
        "Số điện thoại": item.address?.phone || "N/A",
        "Tổng tiền": item.final_amount,
        "Trạng thái": item.shipment_status_txt || "Chưa cập nhật",
        "Đơn vị vận chuyển": item.shipping_carrier || "N/A"
    }));

    exportExcel(dataToExport, `Danh_sach_don_hang_${dayjs().format('DD-MM-YYYY')}.xlsx`);
    message.success("Đang tải xuống file Excel...");
  };

  // --- RENDER TAG TRẠNG THÁI ---
  const renderStatusTag = (statusTxt, statusCode) => {
    let color = "default";
    if (["900"].includes(String(statusCode))) color = "blue"; // Mới
    else if (["905", "913"].includes(String(statusCode))) color = "green"; // Thành công
    else if (["914", "906", "1000"].includes(String(statusCode))) color = "red"; // Hủy/Lỗi
    else if (["901", "902", "903", "904", "919"].includes(String(statusCode))) color = "orange"; // Đang xử lý

    return <Tag color={color} className="uppercase font-bold text-[10px]">{statusTxt || "Chưa cập nhật"}</Tag>;
  };

  // --- CẤU HÌNH CỘT ---
  const columns = [
    { title: "STT", key: "index", width: 50, align: "center", render: (_, __, index) => index + 1 },
    { 
        title: "Mã đơn hàng", 
        dataIndex: "code", 
        key: "code", 
        width: 150, 
        render: (text) => <span className="font-bold text-blue-600">#{text}</span> 
    },
    { 
        title: "Ngày đặt", 
        dataIndex: "created_at", 
        key: "created_at", 
        width: 140, 
        render: (date) => <span className="text-gray-600">{dayjs(date).format("DD/MM/YYYY HH:mm")}</span>
    },
    { 
        title: "Khách hàng", 
        key: "customer", 
        width: 180, 
        render: (_, record) => (
            <div className="flex flex-col">
                <span className="font-medium">{record.address?.full_name || "Khách vãng lai"}</span>
                <span className="text-xs text-gray-400">{record.address?.phone}</span>
            </div>
        )
    },
    { 
        title: "Tổng tiền", 
        dataIndex: "final_amount", 
        key: "final_amount", 
        align: "right", 
        width: 130, 
        render: (value) => <span className="font-bold text-red-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}</span>
    },
    { 
        title: "Trạng thái", 
        dataIndex: "shipment_status_txt", 
        key: "status", 
        align: "center", 
        width: 150, 
        render: (text, record) => renderStatusTag(text, record.shipping_status) 
    },
    {
      title: "Thao tác",
      key: "action",
      width: 80,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
           <Button 
                type="primary" 
                ghost 
                size="small" 
                icon={<EyeOutlined />} 
                onClick={() => onViewDetail(record.id)} 
            />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
        
        {/* --- 1. SUMMARY DASHBOARD --- */}
        <div className="mb-6">
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic 
                            title={<span className="text-gray-500 font-medium">Tổng Đơn Hàng</span>}
                            value={summaryData.totalOrders} 
                            prefix={<ShoppingOutlined className="text-blue-500 mr-2" />} 
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic 
                            title={<span className="text-gray-500 font-medium">Doanh Thu (Đã giao)</span>}
                            value={summaryData.totalRevenue} 
                            precision={0}
                            prefix={<DollarCircleOutlined className="text-green-500 mr-2" />}
                            suffix="₫"
                            valueStyle={{ fontSize: '1.5rem', fontWeight: 600, color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-orange-400">
                        <Statistic 
                            title={<span className="text-orange-500 font-medium">Đơn Mới Chờ Xử Lý</span>}
                            value={summaryData.newOrdersCount} 
                            prefix={<ClockCircleOutlined className="text-orange-500 mr-2" />} 
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic 
                            title={<span className="text-gray-500 font-medium">Đơn Đã Hủy</span>}
                            value={summaryData.cancelledOrdersCount} 
                            prefix={<CloseCircleOutlined className="text-red-500 mr-2" />} 
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            {/* --- 2. ACTIONS & FILTER BAR --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                    <Input 
                        placeholder="Tìm mã đơn hàng..." 
                        prefix={<SearchOutlined className="text-gray-400" />} 
                        allowClear
                        className="w-full md:w-56"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <Select 
                        defaultValue="all" 
                        className="w-full md:w-40"
                        onChange={setFilterStatus}
                        suffixIcon={<FilterOutlined />}
                    >
                        <Option value="all">Tất cả trạng thái</Option>
                        <Option value="900">Đơn mới</Option>
                        <Option value="903">Đã lấy hàng</Option>
                        <Option value="904">Đang giao hàng</Option>
                        <Option value="905">Giao thành công</Option>
                        <Option value="914">Đã hủy</Option>
                    </Select>
                    <RangePicker 
                        className="w-full md:w-60" 
                        placeholder={['Từ ngày', 'Đến ngày']} 
                        format="DD/MM/YYYY" 
                        onChange={(dates) => setDateRange(dates)}
                    />
                </div>
                
                <Space>
                    <Button 
                        icon={<FileExcelOutlined />} 
                        onClick={handleExportExcel}
                        className="border-green-600 text-green-600 hover:bg-green-50"
                    >
                        Xuất Excel
                    </Button>
                    <Button 
                        icon={<ReloadOutlined spin={loading} />} 
                        onClick={onRefresh} 
                        type="primary"
                    >
                        Làm mới
                    </Button>
                </Space>
            </div>

            {/* --- 3. TABLE --- */}
            <CustomTable 
                columns={columns}
                data={filteredData}
                loading={loading}
                pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Tổng ${total} đơn hàng` }}
                scroll={{ x: 1000 }} 
            />
        </div>
    </div>
  );
};

export default OrderList;