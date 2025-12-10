// src/components/common/modal/ProductModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, Select, Upload, Button, Row, Col, Divider } from "antd";
import { UploadOutlined, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

const ProductModal = ({ 
    open, 
    onCancel, 
    onCreate,       // Hàm xử lý tạo mới (Gửi cục bộ Info + Variants + Images)
    onUpdateInfo,   // Hàm xử lý sửa (Chỉ gửi Info)
    loading, 
    initialValues,  // Nếu có giá trị này -> Chế độ Edit
    brands = [], 
    categories = [] 
}) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);

    // Kiểm tra chế độ: Có initialValues là Edit, không có là Create
    const isEditMode = !!initialValues;

    // --- RESET VÀ FILL DỮ LIỆU ---
    useEffect(() => {
        if (open) {
            form.resetFields();
            setFileList([]);

            if (isEditMode) {
                // Chế độ Edit: Chỉ fill thông tin cơ bản
                form.setFieldsValue(initialValues);
            } else {
                // Chế độ Create: Khởi tạo sẵn 1 dòng biến thể rỗng cho tiện
                form.setFieldsValue({
                    variants: [{ color: '', size: '', price: '' }]
                });
            }
        }
    }, [open, initialValues, form, isEditMode]);

    // --- XỬ LÝ SUBMIT ---
    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            if (isEditMode) {
                // 1. EDIT MODE: Chỉ trả về thông tin cơ bản (Info)
                onUpdateInfo(values);
            } else {
                // 2. CREATE MODE: Trả về Info + Variants + Images
                // Lấy file gốc từ component Upload
                const originFiles = fileList.map(f => f.originFileObj).filter(Boolean);
                // Gộp dữ liệu gọi API
                onCreate({ ...values, images: originFiles });
            }
        } catch (error) {
            console.log("Validate Failed:", error);
        }
    };

    // --- XỬ LÝ ẢNH (Chỉ dùng cho Create Mode) ---
    const handleFileChange = ({ fileList: newFileList }) => setFileList(newFileList);

    // --- PHẦN GIAO DIỆN: THÔNG TIN CƠ BẢN (Dùng chung) ---
    const renderBasicInfo = () => (
        <>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                        <Input placeholder="Nhập tên sản phẩm" />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name="price" label="Giá bán" rules={[{ required: true, message: 'Vui lòng nhập giá' }]}>
                        <InputNumber 
                            style={{ width: '100%' }} 
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                            placeholder="VD: 100,000"
                        />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name="old_price" label="Giá cũ">
                        <InputNumber 
                            style={{ width: '100%' }} 
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                            placeholder="VD: 250,000"
                        />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="category_id" label="Danh mục" rules={[{ required: true, message: 'Chọn danh mục' }]}>
                        <Select placeholder="Chọn danh mục">
                            {categories.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="brand_id" label="Thương hiệu" rules={[{ required: true, message: 'Chọn thương hiệu' }]}>
                        <Select placeholder="Chọn thương hiệu">
                            {brands.map(b => <Select.Option key={b.id} value={b.id}>{b.name}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}><Form.Item name="material" label="Chất liệu"><Input /></Form.Item></Col>
                <Col span={12}><Form.Item name="style" label="Phong cách"><Input /></Form.Item></Col>
            </Row>
            <Form.Item name="description" label="Mô tả"><Input.TextArea rows={3} /></Form.Item>
        </>
    );

    // --- PHẦN GIAO DIỆN: BIẾN THỂ & ẢNH (Chỉ hiện khi Create) ---
    const renderCreateExtensions = () => (
        <>
            <Divider orientation="left" style={{ borderColor: '#d9d9d9' }}>Biến thể sản phẩm (Màu/Size)</Divider>
            
            <Form.List name="variants">
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name, ...restField }) => (
                            <Row key={key} gutter={8} align="middle" style={{ marginBottom: 10 }}>
                                <Col span={7}>
                                    <Form.Item {...restField} name={[name, 'color']} rules={[{ required: true, message: 'Nhập màu' }]} style={{ marginBottom: 0 }}>
                                        <Input placeholder="Màu (Đỏ)" />
                                    </Form.Item>
                                </Col>
                                <Col span={7}>
                                    <Form.Item {...restField} name={[name, 'size']} rules={[{ required: true, message: 'Nhập size' }]} style={{ marginBottom: 0 }}>
                                        <Input placeholder="Size (40)" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item {...restField} name={[name, 'price']} rules={[{ required: true, message: 'Nhập giá' }]} style={{ marginBottom: 0 }}>
                                        <InputNumber 
                                            placeholder="Giá riêng" 
                                            style={{ width: '100%' }} 
                                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={2}>
                                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red', fontSize: '18px', cursor: 'pointer' }} />
                                </Col>
                            </Row>
                        ))}
                        <Form.Item>
                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                Thêm dòng biến thể
                            </Button>
                        </Form.Item>
                    </>
                )}
            </Form.List>

            <Divider orientation="left" style={{ borderColor: '#d9d9d9' }}>Hình ảnh sản phẩm</Divider>
            <Form.Item>
                <Upload 
                    beforeUpload={() => false} // Không upload ngay, chờ bấm Save
                    listType="picture-card" 
                    fileList={fileList} 
                    onChange={handleFileChange} 
                    multiple 
                    accept="image/*"
                >
                    {fileList.length >= 8 ? null : (
                        <div><PlusOutlined /><div style={{ marginTop: 8 }}>Chọn ảnh</div></div>
                    )}
                </Upload>
            </Form.Item>
        </>
    );

    return (
        <Modal
            title={isEditMode ? `Cập nhật thông tin: ${initialValues.name}` : "Thêm sản phẩm mới"}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            width={800}
            okText={isEditMode ? "Lưu thay đổi" : "Tạo sản phẩm"}
            cancelText="Đóng"
        >
            <Form form={form} layout="vertical">
                {/* 1. Luôn hiện thông tin cơ bản */}
                {renderBasicInfo()}

                {/* 2. Chỉ hiện Biến thể và Ảnh khi đang ở chế độ THÊM MỚI */}
                {!isEditMode && renderCreateExtensions()}
            </Form>
        </Modal>
    );
};

export default ProductModal;