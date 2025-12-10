import React, { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, Select, Radio, Typography, message } from "antd";
import { ReconciliationOutlined, ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Text } = Typography;

const InventoryAdjustModal = ({ open, onCancel, onCreate, loading, variant }) => {
  const [form] = Form.useForm();
  
  const [adjustType, setAdjustType] = useState("increase"); 
  const [adjustQty, setAdjustQty] = useState(0);

  // Reset form khi mở modal hoặc đổi sản phẩm
  useEffect(() => {
    if (open && variant) {
      form.resetFields();
      setAdjustType("increase");
      setAdjustQty(0);
      form.setFieldsValue({
          reason: "Kiểm kê định kỳ",
          type: "increase",
          quantity: 0
      });
    }
  }, [open, variant, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (!values.quantity || values.quantity <= 0) {
          message.error("Số lượng điều chỉnh phải lớn hơn 0");
          return;
      }

      // Tính toán số lượng chênh lệch thực tế (Dương là tăng, Âm là giảm)
      const finalQuantity = values.type === "increase" ? values.quantity : -values.quantity;

      // Payload gửi đi
      const payload = {
          variant_id: variant.variant_id, 
          adjust_quantity: finalQuantity, 
          reason: values.reason,
          note: values.note
      };

      onCreate(payload);
    } catch (error) {
      console.error("Validate Failed:", error);
    }
  };

  const currentStock = variant?.quantity || 0; 
  
  const newStock = adjustType === "increase" 
      ? Number(currentStock) + Number(adjustQty) 
      : Number(currentStock) - Number(adjustQty);

  return (
    <Modal
      title={<div className="flex items-center gap-2 text-blue-600"><ReconciliationOutlined /> Điều chỉnh tồn kho</div>}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="Xác nhận điều chỉnh"
      cancelText="Hủy bỏ"
      destroyOnClose
    >
      {variant && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="font-bold text-base mb-1">
                  {variant.variant?.product?.name || "Sản phẩm"}
              </div>
              <div className="text-gray-500 text-xs mb-2">
                  SKU: {variant.variant?.sku} | {variant.variant?.color} - Size {variant.variant?.size}
              </div>
              <div className="flex items-center gap-2 text-sm">
                  <span>Tồn hiện tại:</span>
                  <span className="font-bold text-gray-800">{currentStock}</span>
                  <span>→</span>
                  <span>Sau điều chỉnh:</span>
                  <span className={`font-bold ${newStock < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                      {newStock}
                  </span>
                  {newStock < 0 && <span className="text-xs text-red-500">Cảnh báo: Tồn âm</span>}
              </div>
          </div>
      )}

      <Form form={form} layout="vertical" initialValues={{ type: "increase", reason: "Kiểm kê định kỳ" }}>
        
        <div className="grid grid-cols-2 gap-4">
            <Form.Item name="type" label="Loại điều chỉnh">
                <Radio.Group 
                    buttonStyle="solid" 
                    onChange={(e) => setAdjustType(e.target.value)}
                    className="w-full flex"
                >
                    <Radio.Button value="increase" className="w-1/2 text-center !text-green-600">
                        <ArrowUpOutlined /> Tăng kho
                    </Radio.Button>
                    <Radio.Button value="decrease" className="w-1/2 text-center !text-red-600">
                        <ArrowDownOutlined /> Giảm kho
                    </Radio.Button>
                </Radio.Group>
            </Form.Item>

            <Form.Item 
                name="quantity" 
                label="Số lượng chênh lệch" 
                rules={[
                    { required: true, message: "Nhập số lượng" },
                    { type: 'number', min: 1, message: "Số lượng phải lớn hơn 0" } 
                ]}
            >
                <InputNumber 
                    min={1} // Chặn nhập số < 1
                    className="w-full" 
                    placeholder="VD: 5" 
                    // Chặn nhập ký tự '-' (số âm) từ bàn phím
                    onKeyPress={(event) => {
                        if (!/[0-9]/.test(event.key)) {
                            event.preventDefault();
                        }
                    }}
                    onChange={(val) => setAdjustQty(val || 0)}
                />
            </Form.Item>
        </div>

        <Form.Item 
            name="reason" 
            label="Lý do điều chỉnh"
            rules={[{ required: true, message: "Vui lòng chọn hoặc nhập lý do" }]}
        >
            {/* Dùng Select có mode tags để vừa chọn vừa nhập tay được (nếu muốn) hoặc chỉ chọn */}
            <Select 
                placeholder="Chọn lý do..." 
                allowClear
            >
                <Option value="Kiểm kê định kỳ">Kiểm kê định kỳ</Option>
                <Option value="Hàng hư hỏng">Hàng hư hỏng / Lỗi</Option>
                <Option value="Mất mát / Thất lạc">Mất mát / Thất lạc</Option>
                <Option value="Nhập sai số liệu cũ">Nhập sai số liệu cũ</Option>
                <Option value="Khác">Khác</Option>
            </Select>
        </Form.Item>

        <Form.Item name="note" label="Ghi chú chi tiết">
            <Input.TextArea rows={2} placeholder="Mô tả chi tiết (nếu cần)..." />
        </Form.Item>

      </Form>
    </Modal>
  );
};

export default InventoryAdjustModal;