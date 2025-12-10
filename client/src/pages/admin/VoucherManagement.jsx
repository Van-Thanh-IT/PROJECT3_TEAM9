import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
// 1. Import CustomTable (kiểm tra lại đường dẫn thực tế của bạn)
import CustomTable from "../../components/common/table/CustomTable"; 
import VoucherModal from "../../components/common/modal/VoucherModal";
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  ReloadOutlined, 
  SearchOutlined 
} from "@ant-design/icons";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { 
  Button, 
  Popconfirm, 
  Tag, 
  message, 
  Tooltip, 
  Input, 
  Card
} from "antd";

// Import Actions & Thunks
import { 
  fetchVouchers, 
  createVoucher, 
  updateVoucher, 
  deleteVoucher 
} from "../../features/voucher/voucherThunks";
import { clearErrors } from "../../features/voucher/voucherSlice";

dayjs.extend(isBetween);

const VoucherManagement = () => {
  const dispatch = useDispatch();

  // Redux State
  const { vouchers, status,validationErrors } = useSelector((state) => state.voucher);
  
  // Local UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [searchText, setSearchText] = useState("");

  // Fetch Data
  useEffect(() => {
    dispatch(fetchVouchers());
  }, [dispatch]);

  // Computed Data
  const filteredData = useMemo(() => {
    let data = [...vouchers];
    data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (!searchText.trim()) return data;

    const lowerText = searchText.toLowerCase();
    return data.filter(
      (v) =>
        v.code.toLowerCase().includes(lowerText) ||
        v.name.toLowerCase().includes(lowerText)
    );
  }, [vouchers, searchText]);

  // Handlers
  const handleOpenModal = (voucher = null) => {
    dispatch(clearErrors());
    setEditingVoucher(voucher);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVoucher(null);
    dispatch(clearErrors());
  };

  const handleSubmit = async (values) => {
    try {
      if (editingVoucher) {
        await dispatch(updateVoucher({ id: editingVoucher.id, data: values })).unwrap();
        message.success("Cập nhật voucher thành công!");
      } else {
        await dispatch(createVoucher(values)).unwrap();
        message.success("Tạo voucher mới thành công!");
      }
      handleCloseModal();
    } catch (err) {
       console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteVoucher(id)).unwrap();
      message.success("Đã xóa voucher thành công");
    } catch (err) {
      message.error(err.message || "Xóa thất bại");
    }
  };

  const handleRefresh = () => {
    dispatch(fetchVouchers());
    message.info("Đã làm mới dữ liệu");
  };

  // Helper render status
  const checkStatus = (start, end) => {
    const now = dayjs();
    const startDate = dayjs(start);
    const endDate = dayjs(end);

    if (now.isBefore(startDate)) return <Tag color="orange">Chưa diễn ra</Tag>;
    if (now.isAfter(endDate)) return <Tag color="red">Đã kết thúc</Tag>;
    return <Tag color="green">Đang hoạt động</Tag>;
  };

  // Columns Definition
  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mã & Tên",
      key: "info",
      width: 250,
      render: (_, record) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-blue-600 border border-blue-200 bg-blue-50 px-2 py-0.5 rounded text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(record.code);
                    message.success("Đã copy mã: " + record.code);
                  }}>
              {record.code}
            </span>
            {checkStatus(record.start_date, record.end_date)}
          </div>
          <span className="text-gray-600 font-medium mt-1">{record.name}</span>
        </div>
      ),
    },
    {
      title: "Mức giảm",
      key: "discount",
      render: (_, record) => (
        <div className="flex flex-col">
           <span className="font-bold text-emerald-600 text-base">
            {record.discount_type === "percent" 
              ? `${record.discount_value}%` 
              : `${new Intl.NumberFormat('vi-VN').format(record.discount_value)}đ`}
          </span>
          <span className="text-xs text-gray-400">
            Giảm tối đa: {record.max_discount_amount ? `${new Intl.NumberFormat('vi-VN').format(record.max_discount_amount)}đ` : 'Không GH'}
          </span>
        </div>
      ),
    },
    {
      title: "Điều kiện",
      dataIndex: "min_order_value",
      key: "min_order_value",
      render: (val) => (
        <div className="text-sm">
            Đơn từ: <span className="font-medium">{val ? `${new Intl.NumberFormat('vi-VN').format(val)}đ` : "0đ"}</span>
        </div>
      ),
    },
    {
      title: "Thời gian áp dụng",
      key: "time",
      width: 200,
      render: (_, record) => (
        <div className="text-sm text-gray-500 flex flex-col gap-1">
          <div className="flex justify-between">
            <span>Bắt đầu:</span>
            <span className="text-gray-700">{dayjs(record.start_date).format("DD/MM/YYYY HH:mm")}</span>
          </div>
          <div className="flex justify-between">
            <span>Kết thúc:</span>
            <span className="text-gray-700">{dayjs(record.end_date).format("DD/MM/YYYY HH:mm")}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Lượt dùng",
      key: "usage",
      width: 100,
      align: "center",
      render: (_, record) => (
        <div className="flex flex-col items-center">
            <span className="font-semibold text-gray-700">{record.used_count || 0} / {record.usage_limit || "∞"}</span>
            {record.usage_limit && record.used_count >= record.usage_limit && (
                <Tag color="error" className="mt-1 text-[10px] leading-3">Hết lượt</Tag>
            )}
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <div className="flex gap-2 justify-end">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              className="text-blue-600 hover:bg-blue-50"
              icon={<EditOutlined />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa voucher này?"
            description={`Bạn có chắc chắn muốn xóa mã "${record.code}" không?`}
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa ngay"
            cancelText="Hủy"
            okButtonProps={{ danger: true, loading: status === 'loading' }}
          >
            <Button 
                type="text" 
                className="text-red-500 hover:bg-red-50" 
                icon={<DeleteOutlined />} 
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 m-0">Quản lý Voucher</h1>
                    <p className="text-gray-500 mt-1">
                        Tổng số: <strong className="text-blue-600">{filteredData.length}</strong> mã giảm giá
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button 
                        icon={<ReloadOutlined />} 
                        onClick={handleRefresh}
                        loading={status === 'loading'}
                    >
                        Làm mới
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => handleOpenModal(null)}
                        size="large"
                        className="bg-gray-900 hover:bg-gray-800 shadow-lg"
                    >
                        Tạo Voucher
                    </Button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <Card className="mb-4 shadow-sm border-gray-100" bodyStyle={{ padding: '16px' }}>
                <div className="flex w-full md:w-1/3">
                    <Input 
                        placeholder="Tìm kiếm theo mã hoặc tên voucher..." 
                        prefix={<SearchOutlined className="text-gray-400"/>}
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        size="large"
                    />
                </div>
            </Card>

            {/* Table Content - Đã thay thế bằng CustomTable */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <CustomTable
                    columns={columns}
                    data={filteredData} // Props của CustomTable là data, không phải dataSource
                    loading={status === 'loading'}
                    // CustomTable đã tự handle rowKey={record => record.id} nên không cần truyền
                    pagination={{ 
                        pageSize: 10,
                        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total}`,
                        showSizeChanger: true
                    }}
                    scroll={{ x: 920 }}
                />
            </div>

            <VoucherModal
                open={isModalOpen}
                onCancel={handleCloseModal}
                onOk={handleSubmit}
                loading={status === 'loading'}
                initialValues={editingVoucher}
                validationErrors={validationErrors}
            />
        </div>
    </div>
  );
};

export default VoucherManagement;