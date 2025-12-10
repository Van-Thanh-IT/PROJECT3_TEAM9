// src/components/common/modal/CategoryModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Upload, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const CategoryModal = ({ 
    open, 
    onCancel, 
    onSubmit, 
    loading, 
    initialValues, 
    validationErrors,
    categories = []
}) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    console.log(categories);

    useEffect(() => {
        if (open) {
            if (initialValues) {
                // 1. Xử lý ảnh cũ
                let fileData = [];
                if (initialValues.image) {
                    fileData = [{
                        uid: '-1',
                        name: 'anh-hien-tai.png',
                        status: 'done',
                        url: initialValues.image, 
                    }];
                }

                // 2. Fill dữ liệu
                form.setFieldsValue({
                    name: initialValues.name,
                    parent_id: initialValues.parent_id || null, 
                    description: initialValues.description,
                    image: fileData 
                });

                setFileList(fileData);
            } else {
                // --- CHẾ ĐỘ TẠO MỚI ---
                form.resetFields();
                setFileList([]);
            }
        }
    }, [open, initialValues, form]);

    const handleFileChange = ({ fileList: newFileList }) => setFileList(newFileList);

    // Helper để validate ảnh
    const normFile = (e) => {
        if (Array.isArray(e)) return e;
        return e?.fileList;
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            
            const fileOrigin = fileList.length > 0 && fileList[0].originFileObj 
                ? fileList[0].originFileObj 
                : null;

            onSubmit({ ...values, image: fileOrigin }); 
        } catch (error) {
            console.log("Validate Failed:", error);
        }
    };

    return (
        <Modal
            title={initialValues ? "Cập nhật danh mục" : "Thêm danh mục mới"}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            okText="Lưu lại"
            cancelText="Hủy bỏ"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label="Tên danh mục"
                    validateStatus={validationErrors?.name ? "error" : ""}
                    help={validationErrors?.name?.[0]}
                    rules={[{ required: true, message: "Vui lòng nhập tên danh mục!" }]}
                >
                    <Input placeholder="Tên danh mục...." />
                </Form.Item>

                {/* --- Danh Mục Cha (Parent ID) --- */}
                <Form.Item
                    name="parent_id"
                    label="Danh mục cha"
                    validateStatus={validationErrors?.parent_id ? "error" : ""}
                    help={validationErrors?.parent_id?.[0]}
                >
                    <Select
                        placeholder="Chọn danh mục cha (nếu có)"
                        allowClear
                    >
                        <Select.Option value={null}>-- Không có (Danh mục gốc) --</Select.Option>
                        {categories.map(cat => (
                            
                            // Không cho phép chọn chính nó làm cha của nó
                            initialValues?.id !== cat.id && (
                                <Select.Option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </Select.Option>
                            )
                        ))}
                    </Select>
                </Form.Item>

                {/* --- Mô tả --- */}
                <Form.Item
                    name="description"
                    label="Mô tả"
                    validateStatus={validationErrors?.description ? "error" : ""}
                    help={validationErrors?.description?.[0]}
                >
                    <Input.TextArea rows={3} placeholder="Mô tả danh mục..." />
                </Form.Item>

                {/* --- Ảnh (Image) --- */}
                <Form.Item
                    name="image"
                    label="Ảnh danh mục"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                    validateStatus={validationErrors?.image ? "error" : ""}
                    help={validationErrors?.image?.[0]}
                    rules={[{ required: !initialValues, message: "Vui lòng chọn ảnh!" }]}
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
                            <div><UploadOutlined /> <div style={{marginTop: 8}}>Upload</div></div>
                        )}
                    </Upload>
                </Form.Item>

            </Form>
        </Modal>
    );
};

export default CategoryModal;