import React from "react";
import { Modal, Steps, Card, Tag, Divider, Spin, Image, Row, Col, Typography, Avatar, Alert } from "antd";
import { 
  CarOutlined, 
  UserOutlined, 
  EnvironmentOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  InboxOutlined,
  ShoppingOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Step } = Steps;

const OrderDetailModal = ({ open, onCancel, order, loading }) => {
  
  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const data = order?.data || order;

  // Logic xác định bước tiến trình
  const getCurrentStep = (status) => {
      const s = String(status);
      if (["914", "906", "1000", "915", "917"].includes(s)) return 1; 
      if (s === "900") return 0; 
      if (["901", "902", "903", "918"].includes(s)) return 1; 
      if (["904", "919"].includes(s)) return 2; 
      if (["905", "909", "910", "913"].includes(s)) return 3; 
      return 0;
  };

  const currentStep = data ? getCurrentStep(data.shipping_status) : 0;
  const isCancelled = data && ["914", "906", "1000"].includes(String(data.shipping_status));

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1000}
      centered
      bodyStyle={{ padding: 0, backgroundColor: '#f8f9fa' }}
      title={
        <div className="flex items-center gap-3 py-1">
            <ShoppingOutlined className="text-blue-600 text-xl" />
            <span className="text-lg font-bold text-gray-800">Chi tiết đơn hàng</span>
            <Tag color="blue">#{data?.code}</Tag>
        </div>
      }
    >
      {loading ? (
        <div className="flex justify-center items-center py-20"><Spin size="large" /></div>
      ) : !data ? (
        <div className="p-10 text-center text-gray-500">Không tìm thấy dữ liệu đơn hàng.</div>
      ) : (
        <div className="p-6">
            
            {/* 1. STATUS STEPS */}
            <Card className="mb-6 shadow-sm border-0 rounded-xl">
                {isCancelled ? (
                    <Alert
                        message={<span className="font-bold text-base">Đơn hàng đã bị hủy</span>}
                        description={
                            <div className="mt-1">
                                <div>Lý do: <span className="font-semibold">{data.cancel_reason}</span></div>
                                <div className="text-xs text-gray-500 mt-1">{dayjs(data.updated_at).format("DD/MM/YYYY HH:mm")}</div>
                            </div>
                        }
                        type="error"
                        showIcon
                        icon={<CloseCircleOutlined className="text-2xl" />}
                        className="border-red-100 bg-red-50"
                    />
                ) : (
                    <Steps current={currentStep} size="small" className="pt-2">
                        <Step title="Đặt hàng" icon={<UserOutlined />} description={dayjs(data.created_at).format("HH:mm DD/MM")} />
                        <Step title="Vận chuyển" icon={<InboxOutlined />} />
                        <Step title="Đang giao" icon={<CarOutlined />} />
                        <Step title="Hoàn thành" icon={<CheckCircleOutlined />} />
                    </Steps>
                )}
            </Card>

            <Row gutter={[24, 24]}>
                
                {/* 2. DANH SÁCH SẢN PHẨM */}
                <Col xs={24} lg={15}>
                    <Card title="Sản phẩm" className="shadow-sm border-0 rounded-xl h-full" headStyle={{ borderBottom: '1px solid #f0f0f0' }}>
                        <div className="flex flex-col gap-4">
                            {data.order_items?.map((item, index) => (
                                <div key={item.id || index} className="flex gap-4 p-3 border border-gray-100 rounded-lg hover:border-blue-200 transition-colors bg-white">
                                    <div className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-md overflow-hidden border border-gray-100">
                                        {/* --- SỬA Ở ĐÂY: item.image_url --- */}
                                        <Image 
                                            src={item.image || "https://via.placeholder.com/150?text=No+Image"} 
                                            alt={item.product_name}
                                            width="100%" height="100%"
                                            style={{ objectFit: 'cover' }}
                                            preview={false}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1" title={item.product_name}>
                                            {item.product_name}
                                        </h4>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            <Tag bordered={false} className="bg-gray-100 text-gray-600 text-xs m-0">Màu: {item.color}</Tag>
                                            <Tag bordered={false} className="bg-gray-100 text-gray-600 text-xs m-0">Size: {item.size}</Tag>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-gray-500 text-xs">x{item.quantity}</span>
                                            <span className="font-bold text-blue-600">{formatPrice(item.price)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100 text-yellow-800 text-sm">
                            <span className="font-bold mr-1">Ghi chú của bạn:</span> 
                            {data.note || "Không có ghi chú"}
                        </div>
                    </Card>
                </Col>

                {/* 3. THÔNG TIN & THANH TOÁN */}
                <Col xs={24} lg={9}>
                    <div className="flex flex-col gap-6">
                        
                        <Card className="shadow-sm border-0 rounded-xl" bodyStyle={{ padding: '20px' }}>
                            <div className="flex items-center gap-3 mb-4">
                                <Avatar icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
                                <div>
                                    <div className="font-bold text-gray-800 text-sm">Thông tin nhận hàng</div>
                                    <div className="text-xs text-gray-500">Người nhận & Địa chỉ</div>
                                </div>
                            </div>
                            <div className="text-sm space-y-3 pl-2 border-l-2 border-gray-100 ml-4">
                                <div>
                                    <div className="text-gray-500 text-xs">Họ tên</div>
                                    <div className="font-medium">{data.address?.full_name}</div>
                                </div>
                                <div>
                                    <div className="text-gray-500 text-xs">Số điện thoại</div>
                                    <div className="font-medium">{data.address?.phone}</div>
                                </div>
                                <div>
                                    <div className="text-gray-500 text-xs flex items-center gap-1"><EnvironmentOutlined /> Địa chỉ</div>
                                    <div className="font-medium text-gray-700 leading-snug mt-1">
                                        {data.address?.address_detail}, {data.address?.ward}, {data.address?.district}, {data.address?.city}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="shadow-sm border-0 rounded-xl" bodyStyle={{ padding: '20px' }}>
                            <div className="flex items-center gap-3 mb-4">
                                <Avatar icon={<CarOutlined />} className="bg-green-100 text-green-600" />
                                <div>
                                    <div className="font-bold text-gray-800 text-sm">Vận chuyển</div>
                                    <div className="text-xs text-gray-500">Đơn vị & Mã vận đơn</div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-sm mb-2">
                                <span className="text-gray-500">Đơn vị:</span>
                                <span className="font-semibold">{data.shipping_carrier || "---"}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Mã vận đơn:</span>
                                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">{data.tracking_number || "Chưa có"}</span>
                            </div>
                        </Card>

                        <Card className="shadow-sm border-0 rounded-xl bg-blue-50/50">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Tạm tính</span>
                                    <span>{formatPrice(data.total_amount)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Phí vận chuyển</span>
                                    <span>{formatPrice(data.shipping_fee)}</span>
                                </div>
                                {Number(data.discount_amount) > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Voucher giảm</span>
                                        <span>- {formatPrice(data.discount_amount)}</span>
                                    </div>
                                )}
                                <Divider className="my-2 border-gray-200" />
                                <div className="flex justify-between items-end">
                                    <span className="font-bold text-gray-800">Tổng cộng</span>
                                    <span className="text-xl font-bold text-red-600">
                                        {formatPrice(data.final_amount)}
                                    </span>
                                </div>
                                <div className="text-right text-xs text-gray-500 mt-1">
                                    {/* Lấy thông tin thanh toán nếu có */}
                                    Thanh toán bằng {data.payment?.method || "Tiền mặt (COD)"}
                                </div>
                            </div>
                        </Card>

                    </div>
                </Col>
            </Row>
        </div>
      )}
    </Modal>
  );
};

export default OrderDetailModal;