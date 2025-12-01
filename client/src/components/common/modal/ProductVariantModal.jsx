// src/components/common/modal/ProductVariantModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Button, Table, Popconfirm, Space } from "antd";
import { PlusOutlined, DeleteOutlined, SaveOutlined, CloseOutlined, EditOutlined } from "@ant-design/icons";

const ProductVariantModal = ({ 
    open, 
    onCancel, 
    product,
    loading, 
    onCreate,
    onUpdate,
    onDelete
}) => {
    const [formAdd] = Form.useForm();
    const [formEdit] = Form.useForm();
    const [editingKey, setEditingKey] = useState('');

    const variants = Array.isArray(product?.variants) ? product.variants : [];

    // Reset form khi đóng/mở modal
    useEffect(() => {
        if (!open) {
            setEditingKey('');
            formAdd.resetFields();
            formEdit.resetFields();
        }
    }, [open, formAdd, formEdit]);

    // --- LOGIC XỬ LÝ ---
    const handleAdd = async (values) => {
        if (!product?.id) return;
        await onCreate(product.id, values);
        formAdd.resetFields();
    };

    const isEditing = (record) => record.id === editingKey;

    const edit = (record) => {
        formEdit.setFieldsValue({ ...record });
        setEditingKey(record.id);
    };

    const cancelEdit = () => {
        setEditingKey('');
    };

    const saveEdit = async (id) => {
        try {
            const row = await formEdit.validateFields();
            await onUpdate(id, row);
            setEditingKey('');
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    };

    // --- CẤU HÌNH CỘT ---
    const columns = [
        {
            title: 'Màu sắc',
            dataIndex: 'color',
            width: '25%',
            render: (text, record) => {
                if (isEditing(record)) {
                    return (
                        <Form.Item
                            name="color"
                            style={{ margin: 0 }}
                            rules={[{ required: true, message: "Nhập màu" }]}
                        >
                            <Input />
                        </Form.Item>
                    );
                }
                // CHUẨN: Nếu text là object/null/undefined -> trả về chuỗi rỗng để tránh crash
                if (typeof text === 'object' || text === null || text === undefined) return "";
                return text;
            }
        },
        {
            title: 'Kích cỡ',
            dataIndex: 'size',
            width: '20%',
            render: (text, record) => {
                if (isEditing(record)) {
                    return (
                        <Form.Item
                            name="size"
                            style={{ margin: 0 }}
                            rules={[{ required: true, message: "Nhập size" }]}
                        >
                            <Input />
                        </Form.Item>
                    );
                }
                if (typeof text === 'object' || text === null || text === undefined) return "";
                return text;
            }
        },
        {
            title: 'Giá riêng (VNĐ)',
            dataIndex: 'price',
            width: '30%',
            render: (text, record) => {
                if (isEditing(record)) {
                    return (
                        <Form.Item
                            name="price"
                            style={{ margin: 0 }}
                            rules={[{ required: true, message: "Nhập giá" }]}
                        >
                            <InputNumber 
                                style={{ width: '100%' }} 
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            />
                        </Form.Item>
                    );
                }
                // CHUẨN: Format số an toàn
                return text ? Number(text).toLocaleString('vi-VN') : '0';
            }
        },
        {
            title: 'Hành động',
            key: 'operation',
            width: '25%',
            align: 'center',
            render: (_, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <Space>
                        <Button type="primary" size="small" icon={<SaveOutlined />} onClick={() => saveEdit(record.id)} />
                        <Button size="small" icon={<CloseOutlined />} onClick={cancelEdit} />
                    </Space>
                ) : (
                    <Space>
                        <Button size="small" icon={<EditOutlined />} disabled={editingKey !== ''} onClick={() => edit(record)} />
                        <Popconfirm title="Xóa biến thể này?" onConfirm={() => onDelete(record.id)}>
                            <Button danger size="small" icon={<DeleteOutlined />} disabled={editingKey !== ''} />
                        </Popconfirm>
                    </Space>
                );
            },
        },
    ];

    return (
        <Modal
            title={`Quản lý biến thể: ${product?.name || 'Sản phẩm'}`}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={850}
        >
            {/* 1. FORM THÊM NHANH */}
            <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ marginBottom: 12, fontWeight: 600 }}>Thêm biến thể mới:</div>
                <Form form={formAdd} layout="inline" onFinish={handleAdd}>
                    <Form.Item name="color" rules={[{ required: true, message: 'Nhập màu' }]}>
                        <Input placeholder="Màu (VD: Đỏ)" />
                    </Form.Item>
                    <Form.Item name="size" rules={[{ required: true, message: 'Nhập size' }]}>
                        <Input placeholder="Size (VD: XL)" style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item name="price" rules={[{ required: true, message: 'Nhập giá' }]}>
                        <InputNumber 
                            placeholder="Giá" 
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            style={{ width: 150 }} 
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} icon={<PlusOutlined />}>Thêm</Button>
                    </Form.Item>
                </Form>
            </div>

            {/* 2. TABLE DANH SÁCH & EDIT */}
            {/* Form này bọc Table để xử lý context cho các Input trong dòng edit */}
            <Form form={formEdit} component={false}>
                <Table
                    bordered
                    dataSource={variants}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                    size="small"
                />
            </Form>
        </Modal>
    );
};

export default ProductVariantModal;