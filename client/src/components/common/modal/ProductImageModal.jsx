// src/components/common/modal/ProductImageModal.jsx
import React, { useState } from "react";
import { Modal, Upload, Button, Image, Card, Radio, Space, Popconfirm, Typography } from "antd";
import { UploadOutlined, DeleteOutlined, StarFilled, StarOutlined } from "@ant-design/icons";

const { Text } = Typography;

const ProductImageModal = ({ 
    open, 
    onCancel, 
    product, 
    loading, 
    onCreate,      // Hàm upload ảnh
    onDelete,      // Hàm xóa ảnh
    onSetPrimary   // Hàm set ảnh chính
}) => {
    const images = product?.images || [];
    
    // Tìm id của ảnh đang là primary
    const primaryImageId = images.find(img => img.is_primary)?.id;

    // --- XỬ LÝ UPLOAD ---
    const handleCustomRequest = async ({ file, onSuccess, onError }) => {
        try {
            const formData = new FormData();
            formData.append('url', file);
            // Gọi API upload
            await onCreate(product.id, formData);
            onSuccess("Ok");
        } catch (err) {
            onError({ err });
        }
    };

    // --- XỬ LÝ CHỌN ẢNH CHÍNH ---
    const handleRadioChange = (e) => {
        const imageId = e.target.value;
        if (imageId && product?.id) {
            onSetPrimary(product.id, imageId);
        }
    };

    return (
        <Modal
            title={`Quản lý hình ảnh: ${product?.name || 'Sản phẩm'}`}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={800}
        >
            {/* 1. KHU VỰC UPLOAD */}
            <div style={{ marginBottom: 20, textAlign: 'center', background: '#fafafa', padding: 20, borderRadius: 8, border: '1px dashed #d9d9d9' }}>
                <Upload
                    customRequest={handleCustomRequest}
                    showUploadList={false} // Không hiện list mặc định của Antd, tự render bên dưới
                    accept="image/*"
                >
                    <Button icon={<UploadOutlined />} size="large" type="primary" loading={loading}>
                        Tải ảnh mới lên
                    </Button>
                </Upload>
                <div style={{ marginTop: 8, color: '#888' }}>Hỗ trợ: JPG, PNG, JPEG</div>
            </div>

            {/* 2. DANH SÁCH ẢNH */}
            <Radio.Group 
                onChange={handleRadioChange} 
                value={primaryImageId} 
                style={{ width: '100%' }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
                    {images.map((img) => (
                        <Card
                            key={img.id}
                            hoverable
                            bodyStyle={{ padding: 10 }}
                            style={{ 
                                borderColor: img.id === primaryImageId ? '#1890ff' : '#f0f0f0',
                                borderWidth: img.id === primaryImageId ? 2 : 1
                            }}
                            actions={[
                                // Nút xóa
                                <Popconfirm
                                    title="Xóa ảnh này?"
                                    description="Hành động này không thể hoàn tác"
                                    onConfirm={() => onDelete(img.id)}
                                    okText="Xóa"
                                    cancelText="Hủy"
                                >
                                    <Button type="text" danger icon={<DeleteOutlined />} size="small">Xóa</Button>
                                </Popconfirm>
                            ]}
                        >
                            <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, overflow: 'hidden' }}>
                                <Image
                                    src={img.url}
                                    height={120}
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                            
                            <div style={{ textAlign: 'center' }}>
                                <Radio value={img.id} style={{ fontWeight: 500 }}>
                                    {img.id === primaryImageId ? <span style={{color: '#1890ff'}}>Ảnh chính</span> : "Chọn làm chính"}
                                </Radio>
                            </div>
                        </Card>
                    ))}
                </div>
            </Radio.Group>
            
            {images.length === 0 && <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>Chưa có hình ảnh nào</div>}
        </Modal>
    );
};

export default ProductImageModal;