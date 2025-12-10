import React, { useEffect, useState } from "react";
import { 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  DatePicker, 
  Button, 
  Radio, 
  Divider, 
  Alert,
  Row,
  Col,
  Typography
} from "antd";
import dayjs from "dayjs";
import { DollarOutlined, PercentageOutlined, CalendarOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { RangePicker } = DatePicker;

const VoucherModal = ({
  open,
  onCancel,
  onOk,
  loading,
  initialValues,
  validationErrors,
}) => {
  const [form] = Form.useForm();
  
  // State để theo dõi loại giảm giá đang chọn (để hiện/ẩn ô Giảm tối đa)
  const discountType = Form.useWatch('discount_type', form);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          // Xử lý RangePicker nếu muốn dùng (optional), ở đây mình giữ 2 ô riêng cho dễ map
          start_date: initialValues.start_date ? dayjs(initialValues.start_date) : null,
          end_date: initialValues.end_date ? dayjs(initialValues.end_date) : null,
        });
      } else {
        form.resetFields();
        form.setFieldValue("discount_type", "percent"); // Default value
      }
    }
  }, [open, initialValues, form]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const formattedValues = {
        ...values,
        start_date: values.start_date ? values.start_date.format("YYYY-MM-DD") : null,
        end_date: values.end_date ? values.end_date.format("YYYY-MM-DD") : null,
      };
      onOk(formattedValues);
    });
  };

  const getError = (field) => validationErrors?.[field]?.[0];

  return (
    <Modal
      title={
        <div className="text-lg font-bold text-gray-800">
          {initialValues ? "✏️ Cập nhật chương trình khuyến mãi" : "✨ Tạo chương trình khuyến mãi mới"}
        </div>
      }
      open={open}
      onCancel={onCancel}
      width={700} // Mở rộng modal một chút cho thoáng
      footer={[
        <Button key="back" onClick={onCancel} size="large">Hủy bỏ</Button>,
        <Button 
            key="submit" 
            type="primary" 
            loading={loading} 
            onClick={handleSubmit} 
            size="large"
            className="bg-gray-900 hover:bg-gray-800 border-none shadow-lg"
        >
          {initialValues ? "Lưu thay đổi" : "Hoàn tất & Tạo"}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" className="pt-4">
        
        {/* --- 1. Thông tin chung --- */}
        {!initialValues && (
             <Alert 
                message="Mã Voucher (Code) sẽ được hệ thống tự động tạo ngẫu nhiên sau khi lưu." 
                type="info" 
                showIcon 
                className="mb-5 bg-blue-50 border-blue-100 text-blue-800"
             />
        )}

        <Form.Item
          label={<span className="font-semibold text-gray-700">Tên chương trình</span>}
          name="name"
          validateStatus={getError("name") ? "error" : ""}
          help={getError("name")}
          rules={[{ required: true, message: "Vui lòng nhập tên chương trình" }]}
        >
          <Input placeholder="VD: Siêu sale 12/12 - Giảm 50%" size="large" />
        </Form.Item>

        <Divider orientation="left" className="!text-gray-500 !text-sm !font-normal">Thiết lập mức giảm</Divider>

        {/* --- 2. Loại giảm giá & Giá trị --- */}
        <Row gutter={16}>
            <Col span={24}>
                <Form.Item
                    name="discount_type"
                    initialValue="percent"
                    className="mb-4"
                >
                    <Radio.Group optionType="button" buttonStyle="solid" size="middle">
                        <Radio.Button value="percent">
                            <PercentageOutlined /> Theo phần trăm (%)
                        </Radio.Button>
                        <Radio.Button value="fixed">
                            <DollarOutlined /> Số tiền cố định (VND)
                        </Radio.Button>
                    </Radio.Group>
                </Form.Item>
            </Col>
        </Row>

        <Row gutter={16}>
            <Col span={12}>
                <Form.Item
                    label="Giá trị giảm"
                    name="discount_value"
                    validateStatus={getError("discount_value") ? "error" : ""}
                    help={getError("discount_value")}
                    rules={[{ required: true, message: "Nhập giá trị" }]}
                >
                    <InputNumber
                        className="w-full"
                        size="large"
                        placeholder="0"
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                        addonAfter={discountType === 'percent' ? "%" : "đ"}
                    />
                </Form.Item>
            </Col>

            {/* Chỉ hiện ô Giảm tối đa nếu chọn Phần trăm */}
            {discountType === 'percent' && (
                <Col span={12}>
                    <Form.Item
                        label="Giảm tối đa (Max)"
                        name="max_discount_amount"
                        tooltip="Số tiền tối đa được giảm khi áp dụng %"
                    >
                        <InputNumber
                            className="w-full"
                            size="large"
                            placeholder="Không giới hạn"
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            addonAfter="đ"
                        />
                    </Form.Item>
                </Col>
            )}
        </Row>

        <Divider orientation="left" className="!text-gray-500 !text-sm !font-normal">Điều kiện áp dụng</Divider>

        {/* --- 3. Điều kiện & Giới hạn --- */}
        <Row gutter={16}>
            <Col span={12}>
                <Form.Item
                    label="Đơn hàng tối thiểu"
                    name="min_order_value"
                    validateStatus={getError("min_order_value") ? "error" : ""}
                    help={getError("min_order_value")}
                >
                    <InputNumber
                        className="w-full"
                        size="large"
                        placeholder="0"
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        addonAfter="đ"
                    />
                </Form.Item>
            </Col>

            <Col span={12}>
                <Form.Item
                    label="Tổng lượt sử dụng"
                    name="usage_limit"
                    validateStatus={getError("usage_limit") ? "error" : ""}
                    help={getError("usage_limit")}
                >
                    <InputNumber 
                        className="w-full" 
                        size="large" 
                        placeholder="∞ (Không giới hạn)" 
                        min={1} 
                    />
                </Form.Item>
            </Col>
        </Row>

        {/* --- 4. Thời gian --- */}
        <Row gutter={16}>
            <Col span={12}>
                 <Form.Item
                    label="Ngày bắt đầu hiệu lực"
                    name="start_date"
                    validateStatus={getError("start_date") ? "error" : ""}
                    help={getError("start_date")}
                    rules={[{ required: true, message: "Chọn ngày bắt đầu" }]}
                >
                    <DatePicker 
                        className="w-full" 
                        size="large" 
                        format="DD/MM/YYYY" 
                        placeholder="Chọn ngày"
                    />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    label="Ngày kết thúc hiệu lực"
                    name="end_date"
                    validateStatus={getError("end_date") ? "error" : ""}
                    help={getError("end_date")}
                    rules={[{ required: true, message: "Chọn ngày kết thúc" }]}
                >
                    <DatePicker 
                        className="w-full" 
                        size="large" 
                        format="DD/MM/YYYY" 
                        placeholder="Chọn ngày"
                    />
                </Form.Item>
            </Col>
        </Row>

      </Form>
    </Modal>
  );
};

export default VoucherModal;