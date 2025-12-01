import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const BrandModal = ({ 
    open, 
    onCancel, 
    onSubmit, 
    loading, 
    initialValues, 
    validationErrors 
}) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);

    // Reset form hoặc điền dữ liệu khi mở Modal
    useEffect(() => {
        if (open) {
            if (initialValues) {
                // --- CHẾ ĐỘ SỬA (EDIT) ---
                
                // 1. Chuẩn bị dữ liệu ảnh cũ
                let fileData = [];
                if (initialValues.logo) {
                    fileData = [{
                        uid: '-1',
                        name: 'anh-hien-tai.png',
                        status: 'done',
                        url: initialValues.logo, 
                    }];
                }

                // 2. Set dữ liệu vào Form (QUAN TRỌNG: Phải set cả 'logo' để Form biết đã có ảnh)
                form.setFieldsValue({
                    name: initialValues.name,
                    description: initialValues.description,
                    logo: fileData // <--- Thêm dòng này để validate biết là có ảnh rồi
                });

                // 3. Set dữ liệu hiển thị Preview
                setFileList(fileData);

            } else {
                // --- CHẾ ĐỘ THÊM MỚI (CREATE) ---
                form.resetFields();
                setFileList([]);
            }
        }
    }, [open, initialValues, form]);

    // Xử lý khi chọn file ảnh (Sync giữa State hiển thị và Form)
    const handleFileChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    // Helper để Form lấy được danh sách file từ sự kiện Upload
    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    // Xử lý khi bấm nút Lưu
    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            
            // Lấy file thực tế từ fileList
            const fileOrigin = fileList.length > 0 && fileList[0].originFileObj 
                ? fileList[0].originFileObj 
                : null;

            onSubmit({ ...values, logo: fileOrigin }); 

        } catch (error) {
            console.log("Validate Failed:", error);
        }
    };

    return (
        <Modal
            title={initialValues ? "Cập nhật thương hiệu" : "Thêm thương hiệu mới"}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            okText="Lưu lại"
            cancelText="Hủy bỏ"
        >
            <Form form={form} layout="vertical" name="brand_form">
                
                <Form.Item
                    name="name"
                    label="Tên thương hiệu"
                    validateStatus={validationErrors?.name ? "error" : ""}
                    help={validationErrors?.name?.[0]}
                    rules={[{ required: true, message: "Vui lòng nhập tên thương hiệu!" }]}
                >
                    <Input placeholder="Nhập tên thương hiệu" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Mô tả"
                    validateStatus={validationErrors?.description ? "error" : ""}
                    help={validationErrors?.description?.[0]}
                >
                    <Input.TextArea rows={3} placeholder="Mô tả ngắn về thương hiệu..." />
                </Form.Item>

                {/* --- SỬA PHẦN NÀY ĐỂ VALIDATE ẢNH --- */}
                <Form.Item
                    name="logo"
                    label="Logo thương hiệu"
                    validateStatus={validationErrors?.logo ? "error" : ""}
                    help={validationErrors?.logo?.[0]}
                    // 1. Để Form hiểu dữ liệu file
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                    // 2. Rule validate: Chỉ bắt buộc khi THÊM MỚI (!initialValues)
                    rules={[
                        { 
                            required: !initialValues, 
                            message: "Vui lòng chọn ảnh thương hiệu!" 
                        }
                    ]}
                >
                    <Upload
                        beforeUpload={() => false}
                        listType="picture-card"
                        fileList={fileList}
                        onChange={handleFileChange}
                        maxCount={1}
                        accept="image/*"
                    >
                        {fileList.length < 1 && (
                            <div>
                                <UploadOutlined />
                                <div style={{ marginTop: 8 }}>Tải ảnh</div>
                            </div>
                        )}
                    </Upload>
                </Form.Item>

            </Form>
        </Modal>
    );
};

export default BrandModal;