import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { clearInventoryState } from "../../../features/inventory/inventorySlice"; 
import { getInventoryNoteDetail as fetchDetailApi } from "../../../features/inventory/inventoryThunks"; 
import { 
  ArrowLeftOutlined, 
  PrinterOutlined,
  BarcodeOutlined,
  CalendarOutlined,
  UserOutlined,
  ContainerOutlined
} from "@ant-design/icons";
import { 
  Button, 
  Table, 
  Tag, 
  Typography, 
  Space,
  Divider,
  Spin,
  message,
  Row,
  Col
} from "antd";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const InventoryDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentNote, status, error } = useSelector((state) => state.inventory);

  useEffect(() => {
    if (id) {
        dispatch(fetchDetailApi(id));
    }
    return () => dispatch(clearInventoryState());
  }, [dispatch, id]);

  useEffect(() => {
    if (status === 'failed' && error) {
        message.error(error);
    }
  }, [status, error]);

  const renderTypeTag = (type) => {
    let color = "default";
    let text = type;
    let bgColor = "#f0f0f0";
    switch (type) {
        case "IMPORT": color = "green"; text = "PHIẾU NHẬP KHO"; bgColor = "#f6ffed"; break;
        case "EXPORT": color = "orange"; text = "PHIẾU XUẤT KHO"; bgColor = "#fff7e6"; break;
        case "ADJUST": color = "blue"; text = "PHIẾU KIỂM KÊ"; bgColor = "#e6f7ff"; break;
        default: break;
    }
    return { color, text, bgColor };
  };

  const columns = [
    {
      title: "#",
      key: "index",
      width: 50,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Sản phẩm",
      key: "product",
      render: (_, record) => (
        <div>
            <div className="font-bold text-gray-800 text-base">{record.variant?.product?.name}</div>
            <div className="text-gray-500 text-xs">Mã: {record.variant?.sku}</div>
        </div>
      ),
    },
    {
      title: "Quy cách",
      key: "variant",
      width: 150,
      render: (_, record) => (
          <Space split={<Divider type="vertical" />}>
              <span className="text-gray-600">{record.variant?.color}</span>
              <span className="font-semibold">Size {record.variant?.size}</span>
          </Space>
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      align: "right",
      width: 150,
      render: (val) => <span className="text-gray-600">{new Intl.NumberFormat('vi-VN').format(val)}</span>,
    },
    {
      title: "SL",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      width: 100,
      render: (val) => <span className="font-bold text-lg">{val}</span>,
    },
    {
        title: "Thành tiền",
        key: "total",
        align: "right",
        width: 180,
        render: (_, record) => {
            const total = Number(record.price) * Number(record.quantity);
            return <span className="font-bold text-gray-900">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
            </span>
        }
    },
  ];

  if (status === 'loading') return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
  if (!currentNote) return <div className="p-6 text-center text-gray-500">Không tìm thấy dữ liệu phiếu kho.</div>;

  const noteData = currentNote.data || currentNote;
  const { color, text, bgColor } = renderTypeTag(noteData.type);

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      
      {/* --- ACTION BAR --- */}
      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center print:hidden">
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin/inventory")} className="hover:bg-white">
              Quay lại
          </Button>
          <Button type="primary" icon={<PrinterOutlined />} onClick={() => window.print()}>
              In phiếu
          </Button>
      </div>

      {/* --- INVOICE PAPER --- */}
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-none md:rounded-lg overflow-hidden relative print:shadow-none">
        
        {/* Color Strip */}
        <div className={`h-2 w-full bg-${color}-500`} style={{ backgroundColor: color === 'green' ? '#52c41a' : color === 'orange' ? '#fa8c16' : '#1890ff' }}></div>

        <div className="p-8 md:p-12">
            
            {/* 1. HEADER: Logo & Title */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-dashed pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gray-800 text-white flex items-center justify-center font-bold text-xl rounded">
                            M
                        </div>
                        <span className="font-bold text-2xl tracking-tight text-gray-800">MYSHOP KHO</span>
                    </div>
                    <div className="text-gray-500 text-sm">
                        <p className="m-0">Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</p>
                        <p className="m-0">Hotline: 1900 1234</p>
                    </div>
                </div>
                <div className="text-right mt-6 md:mt-0">
                    <Tag color={color} className="text-base py-1 px-4 mb-2 font-bold border-0" style={{ backgroundColor: bgColor }}>
                        {text}
                    </Tag>
                    <div className="text-3xl font-mono font-bold text-gray-700 tracking-wider">
                        #{noteData.code}
                    </div>
                    <div className="text-gray-500 text-sm mt-1 flex items-center justify-end gap-2">
                        <CalendarOutlined /> {dayjs(noteData.created_at).format("DD/MM/YYYY - HH:mm")}
                    </div>
                </div>
            </div>

            {/* 2. INFO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 bg-gray-50 p-6 rounded-lg border border-gray-100">
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Thông tin chung</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex justify-between">
                            <span className="text-gray-500"><UserOutlined /> Người tạo:</span>
                            <span className="font-medium">User #{noteData.user_id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500"><ContainerOutlined /> Lý do:</span>
                            <span className="font-medium">{noteData.reason}</span>
                        </div>
                        {noteData.supplier_name && (
                             <div className="flex justify-between">
                                <span className="text-gray-500">Nhà cung cấp:</span>
                                <span className="font-medium text-blue-600">{noteData.supplier_name}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Ghi chú</h4>
                    <div className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200 h-full italic">
                        {noteData.note || "Không có ghi chú thêm."}
                    </div>
                </div>
            </div>

            {/* 3. TABLE */}
            <Table 
                columns={columns} 
                dataSource={noteData.details} 
                rowKey="id" 
                pagination={false} 
                size="middle"
                className="mb-8 border border-gray-200 rounded-t-lg overflow-hidden"
                rowClassName="hover:bg-gray-50"
            />

            {/* 4. FOOTER: SUMMARY & SIGNATURE */}
            <Row gutter={24}>
                <Col span={12} className="hidden md:block">
                    <div className="mt-8 text-center">
                        <p className="font-bold text-sm text-gray-600 mb-16">Người lập phiếu</p>
                        <p className="text-xs text-gray-400">(Ký và ghi rõ họ tên)</p>
                    </div>
                </Col>
                <Col span={24} md={12}>
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-gray-600">Tổng số lượng:</span>
                            <span className="font-bold text-lg">
                                {noteData.details?.reduce((sum, item) => sum + Number(item.quantity), 0)}
                            </span>
                        </div>
                        <Divider style={{ margin: '12px 0' }} />
                        <div className="flex justify-between items-center">
                            <span className="text-gray-800 font-bold text-lg">TỔNG GIÁ TRỊ:</span>
                            <span className="text-2xl font-bold text-red-600">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(noteData.total_amount)}
                            </span>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Print Footer */}
            <div className="mt-12 text-center text-xs text-gray-400 print:block hidden">
                <p>Cảm ơn quý khách đã sử dụng dịch vụ của MyShop.</p>
                <p>Phiếu được in vào lúc {dayjs().format("DD/MM/YYYY HH:mm")}</p>
            </div>

        </div>
      </div>
    </div>
  );
};

export default InventoryDetail;