import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearInventoryState } from "../../../features/inventory/inventorySlice";
import { getAllInventories, importStock, exportStock, adjustStock } from "../../../features/inventory/inventoryThunks";

// Import Utility Excel
import { exportExcel } from "../../../utils/exportExcel"; 

// Import Modals
import InventoryImportModal from "../../../components/common/modal/InventoryImportModal";
import InventoryExportModal from "../../../components/common/modal/InventoryExportModal";
import InventoryAdjustModal from "../../../components/common/modal/InventoryAdjustModal";

import CustomTable from "../../../components/common/table/CustomTable";
import { 
  ReloadOutlined, 
  SearchOutlined, 
  WarningOutlined,
  HistoryOutlined,
  EyeOutlined,
  ImportOutlined,
  ExportOutlined,
  FormOutlined,
  FileExcelOutlined,
  ShopOutlined,
  AppstoreOutlined,
  DollarCircleOutlined
} from "@ant-design/icons";
import { 
  Button, 
  Input, 
  Tag, 
  Tooltip, 
  Image,
  Space,
  Card,
  message,
  Statistic,
  Row,
  Col
} from "antd";

const InventoryList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { inventoryNotes, status, error } = useSelector((state) => state.inventory);
  const [searchText, setSearchText] = useState("");
  
  // State quản lý Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustVariant, setAdjustVariant] = useState(null); 
  
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    dispatch(getAllInventories());
    return () => dispatch(clearInventoryState());
  }, [dispatch]);

  useEffect(() => {
      if (status === 'failed' && error) {
          message.error(error);
      }
  }, [status, error]);

  // --- LOGIC LỌC DỮ LIỆU ---
  const filteredData = useMemo(() => {
    let data = Array.isArray(inventoryNotes) ? [...inventoryNotes] : [];

    if (searchText) {
      const lower = searchText.toLowerCase();
      data = data.filter(item => {
          const productName = item.variant?.product?.name?.toLowerCase() || "";
          const sku = item.variant?.sku?.toLowerCase() || "";
          return productName.includes(lower) || sku.includes(lower);
      });
    }

    return data.sort((a, b) => a.quantity - b.quantity);
  }, [inventoryNotes, searchText]);

  // --- TÍNH TOÁN SUMMARY (TỔNG QUAN) ---
  const summaryData = useMemo(() => {
    const totalItems = inventoryNotes.length;
    const totalStock = inventoryNotes.reduce((acc, item) => acc + (item.quantity || 0), 0);
    // Giả sử giá trị kho tính theo giá bán (hoặc giá nhập nếu có field cost_price)
    const totalValue = inventoryNotes.reduce((acc, item) => acc + ((item.quantity || 0) * (item.variant?.price || 0)), 0);
    const lowStockCount = inventoryNotes.filter(item => (item.quantity || 0) < 10).length;

    return { totalItems, totalStock, totalValue, lowStockCount };
  }, [inventoryNotes]);

  // --- HANDLER XUẤT EXCEL ---
  const handleExportToExcel = () => {
    if (filteredData.length === 0) {
        message.warning("Không có dữ liệu để xuất!");
        return;
    }

    // Map dữ liệu phẳng để xuất Excel đẹp hơn
    const dataToExport = filteredData.map(item => ({
        "Mã SKU": item.variant?.sku,
        "Tên sản phẩm": item.variant?.product?.name,
        "Màu sắc": item.variant?.color,
        "Kích thước": item.variant?.size,
        "Giá bán": item.variant?.price,
        "Số lượng tồn": item.quantity,
        "Cập nhật cuối": item.last_note_id ? `Phiếu #${item.last_note_id}` : "N/A"
    }));

    exportExcel(dataToExport, `Bao_cao_ton_kho_${new Date().toISOString().split('T')[0]}.xlsx`);
    message.success("Đang tải xuống file Excel...");
  };

  // --- HANDLERS MODAL ---
  const handleCreateImport = async (values) => {
    setActionLoading(true);
    try {
        const action = await dispatch(importStock(values));
        if (importStock.fulfilled.match(action)) {
            setIsImportModalOpen(false);
            dispatch(getAllInventories());
        }
    } finally {
        setActionLoading(false);
    }
  };

  const handleCreateExport = async (values) => {
    setActionLoading(true);
    try {
        const action = await dispatch(exportStock(values));
        if (exportStock.fulfilled.match(action)) {
            setIsExportModalOpen(false);
            dispatch(getAllInventories());
        }
    } finally {
        setActionLoading(false);
    }
  };

  const handleAdjustStock = async (values) => {
    setActionLoading(true);
    try {
        const action = await dispatch(adjustStock(values));
        if (adjustStock.fulfilled.match(action)) {
            setIsAdjustModalOpen(false);
            dispatch(getAllInventories()); 
        } 
    } finally {
        setActionLoading(false);
    }
  };
    
  const openAdjustModal = (record) => {
    setAdjustVariant(record); 
    setIsAdjustModalOpen(true);
  };

  // --- CẤU HÌNH CỘT BẢNG ---
  const columns = [
    {
      title: "Ảnh",
      key: "image",
      width: 70,
      align: "center",
      render: (_, record) => (
        <Image 
            src={record.variant?.image || "https://via.placeholder.com/50"} 
            width={40} height={40} 
            className="rounded border object-cover"
            preview={{ mask: <EyeOutlined /> }}
        />
      ),
    },
    {
      title: "Sản phẩm & SKU",
      key: "product",
      width: 250,
      render: (_, record) => (
        <div className="flex flex-col">
            <span className="font-semibold text-gray-800 line-clamp-2" title={record.variant?.product?.name}>
                {record.variant?.product?.name}
            </span>
            <Tag className="w-fit mt-1 text-[10px] bg-gray-100 border-gray-200 text-gray-500">
                {record.variant?.sku}
            </Tag>
        </div>
      ),
    },
    {
      title: "Phân loại",
      key: "variant",
      width: 140,
      render: (_, record) => (
        <div className="text-xs text-gray-600">
            <div>Màu: <span className="font-medium text-gray-800">{record.variant?.color}</span></div>
            <div>Size: <span className="font-medium text-gray-800">{record.variant?.size}</span></div>
        </div>
      ),
    },
    {
      title: "Giá trị",
      key: "price",
      width: 120,
      align: "right",
      render: (_, record) => (
        <span className="font-medium text-gray-700">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.variant?.price || 0)}
        </span>
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "quantity",
      key: "quantity",
      width: 110,
      align: "center",
      render: (qty) => {
          let color = "green";
          let icon = null;
          if (qty === 0) {
              color = "red";
              icon = <WarningOutlined />;
          } else if (qty < 10) {
              color = "orange";
          }

          return (
              <Tag color={color} className="text-sm px-3 py-0.5 font-bold rounded-full min-w-[50px] text-center">
                  {icon} {qty}
              </Tag>
          );
      },
    },
    {
        title: "Cập nhật",
        key: "last_note",
        width: 140,
        render: (_, record) => (
            <span className="text-gray-400 text-xs italic">
                {record.last_note_id ? `#${record.last_note_id}` : "-"}
            </span>
        )
    },
    {
      title: "",
      key: "action",
      width: 130,
      align: "right",
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
            <Tooltip title="Kiểm kê">
                <Button 
                    size="small"
                    icon={<FormOutlined />} 
                    onClick={() => openAdjustModal(record)}
                    className="border-orange-200 text-orange-500 hover:bg-orange-50"
                />
            </Tooltip>
            
            <Tooltip title="Chi tiết phiếu">
                <Button 
                    size="small"
                    icon={<EyeOutlined />} 
                    onClick={() => navigate(`/admin/inventory/detail/${record.last_note_id}`)}
                    disabled={!record.last_note_id}
                    className="text-gray-500 border-gray-200 hover:text-blue-500 hover:border-blue-500"
                />
            </Tooltip>

            <Tooltip title="Lịch sử">
                <Button 
                    size="small"
                    icon={<HistoryOutlined />} 
                    onClick={() => navigate(`/admin/inventory/history/${record.variant_id}`)}
                    className="text-blue-600 border-blue-100 bg-blue-50 hover:bg-blue-100"
                />
            </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* --- SUMMARY SECTION (DASHBOARD STYLE) --- */}
      <div className="mb-2">
        <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                    <Statistic 
                        title={<span className="text-gray-500 font-medium">Tổng Mã Hàng</span>}
                        value={summaryData.totalItems} 
                        prefix={<AppstoreOutlined className="text-blue-500 mr-2" />} 
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                    <Statistic 
                        title={<span className="text-gray-500 font-medium">Tổng Sản Phẩm Tồn</span>}
                        value={summaryData.totalStock} 
                        prefix={<ShopOutlined className="text-green-500 mr-2" />} 
                        formatter={(value) => <span className="text-green-600 font-bold">{value}</span>}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                    <Statistic 
                        title={<span className="text-gray-500 font-medium">Giá Trị Tồn Kho (Ước tính)</span>}
                        value={summaryData.totalValue} 
                        precision={0}
                        prefix={<DollarCircleOutlined className="text-purple-500 mr-2" />}
                        suffix="₫"
                        valueStyle={{ fontSize: '1.2rem', fontWeight: 600 }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-red-400">
                    <Statistic 
                        title={<span className="text-red-500 font-medium">Sắp hết hàng (&lt;10)</span>}
                        value={summaryData.lowStockCount} 
                        prefix={<WarningOutlined className="text-red-500 mr-2" />} 
                        valueStyle={{ color: '#cf1322' }}
                    />
                </Card>
            </Col>
        </Row>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        
        {/* --- ACTIONS BAR --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            {/* Search */}
            <Input 
                placeholder="Tìm kiếm theo Tên SP hoặc Mã SKU..." 
                prefix={<SearchOutlined className="text-gray-400" />} 
                allowClear
                size="large"
                className="max-w-md w-full"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
            />
            
            {/* Buttons */}
            <Space wrap>
                <Button 
                    icon={<FileExcelOutlined />} 
                    onClick={handleExportToExcel}
                    className="border-green-600 text-green-600 hover:bg-green-50"
                >
                    Xuất Excel
                </Button>
                <Button 
                    icon={<ImportOutlined />} 
                    onClick={() => setIsImportModalOpen(true)}
                >
                    Nhập kho
                </Button>
                <Button 
                    icon={<ExportOutlined />} 
                    onClick={() => setIsExportModalOpen(true)}
                >
                    Xuất kho
                </Button>
                <Button 
                    type="text"
                    icon={<ReloadOutlined spin={status === 'loading'} />} 
                    onClick={() => dispatch(getAllInventories())}
                />
            </Space>
        </div>

        {/* --- TABLE --- */}
        <CustomTable 
            columns={columns} 
            data={filteredData} 
            loading={status === 'loading'} 
            pagination={{ pageSize: 10, showSizeChanger: true }} 
            scroll={{ x: 1000 }} 
            rowKey={(record) => record.variant_id}
        />

        {/* --- MODALS --- */}
        <InventoryImportModal 
            open={isImportModalOpen}
            onCancel={() => setIsImportModalOpen(false)}
            onCreate={handleCreateImport}
            loading={actionLoading}
        />

        <InventoryExportModal 
            open={isExportModalOpen}
            onCancel={() => setIsExportModalOpen(false)}
            onCreate={handleCreateExport}
            loading={actionLoading}
        />

        <InventoryAdjustModal 
            open={isAdjustModalOpen}
            onCancel={() => setIsAdjustModalOpen(false)}
            onCreate={handleAdjustStock}
            loading={actionLoading}
            variant={adjustVariant}
        />

      </div>
    </div>
  );
};
 
export default InventoryList;