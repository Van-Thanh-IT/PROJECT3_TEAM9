import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Space, message, Popconfirm, Tag, Tooltip } from "antd";
import { 
    PlusOutlined, 
    DeleteOutlined, 
    EditOutlined, 
    ReloadOutlined, 
    RestOutlined, 
    RollbackOutlined 
} from "@ant-design/icons";

import { 
    fetchBrands, 
    fetchTrashedBrands, 
    createBrand, 
    updateBrand, 
    softDeleteBrand, 
    restoreBrand,
} from "../../features/brand/brandThunks"; 
import { clearErrors } from "../../features/brand/brandSlice";
import CustomTable from "../../components/common/table/CustomTable"; 
import BrandModal from "../../components/common/modal/BrandModal"; 

const BrandManagement = () => {
    const dispatch = useDispatch();

    // Redux State
    const { brands, trash, loading, validationErrors } = useSelector((state) => state.brand);
    
    // Local State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState(null); // Thay thế cho isEditMode & currentId
    const [viewTrash, setViewTrash] = useState(false);

    // 1. Load Data
    useEffect(() => {
        if (viewTrash) {
            dispatch(fetchTrashedBrands());
        } else {
            dispatch(fetchBrands());
        }
    }, [dispatch, viewTrash]);

    // 2. Mở Modal
    const handleOpenModal = (record = null) => {
        dispatch(clearErrors()); // Reset lỗi cũ
        setSelectedBrand(record);
        setIsModalOpen(true);
    };

    const handleSubmit = async (values) => {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('description', values.description || '');
        
        // Nếu có file ảnh mới thì append vào
        if (values.logo) {
            formData.append('logo', values.logo);
        }

        let action;
        if (selectedBrand) {
            formData.append('_method', 'PUT'); 
            action = updateBrand({ id: selectedBrand.id, data: formData });
        } else {
            // --- Logic Create (Thêm) ---
            action = createBrand(formData);
        }

        const resultAction = await dispatch(action);

        // Kiểm tra kết quả
        if (createBrand.fulfilled.match(resultAction) || updateBrand.fulfilled.match(resultAction)) {
            message.success(selectedBrand ? "Cập nhật thành công!" : "Thêm mới thành công!");
            setIsModalOpen(false);
            setSelectedBrand(null);
            dispatch(fetchBrands());
        } else {
            // Nếu lỗi Server chung (không phải validate input)
            if (!resultAction.payload?.errors) {
                message.error(resultAction.payload?.message || "Có lỗi xảy ra!");
            }
        }
    };

    const handleDelete = async (id) => {
        await dispatch(softDeleteBrand(id));
        message.success("Đã chuyển vào thùng rác!");
    };

    const handleRestore = async (id) => {
        await dispatch(restoreBrand(id));
        message.success("Đã khôi phục thương hiệu!");
        dispatch(fetchTrashedBrands());
    };

    // 5. Cấu hình bảng
    const columns = [
        { title: "ID", dataIndex: "id", width: 80, sorter: (a, b) => a.id - b.id },
        {
            title: "Logo",
            dataIndex: "logo",
            width: 100,
            render: (url) => (
                url 
                ? <img src={url} alt="logo" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} /> 
                : <Tag>No Image</Tag>
            )
        },
        { title: "Tên thương hiệu", dataIndex: "name", width: 200, render: (text) => <strong>{text}</strong> },
        { title: "Slug", dataIndex: "slug" },
        { title: "Mô tả", dataIndex: "description", ellipsis: true },
        {
            title: "Hành động",
            key: "action",
            fixed: "right",
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    {viewTrash ? (
                        <Tooltip title="Khôi phục">
                            <Button type="primary" icon={<RollbackOutlined />} size="small" onClick={() => handleRestore(record.id)} />
                        </Tooltip>
                    ) : (
                        <>
                            <Tooltip title="Sửa">
                                <Button type="default" icon={<EditOutlined />} size="small" onClick={() => handleOpenModal(record)} />
                            </Tooltip>
                            <Popconfirm title="Xóa thương hiệu?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
                                <Button danger icon={<DeleteOutlined />} size="small" />
                            </Popconfirm>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 20 }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <h1>{viewTrash ? "Thùng rác thương hiệu" : "Quản lý thương hiệu"}</h1>
                <Space>
                    <Button icon={viewTrash ? <ReloadOutlined /> : <RestOutlined />} onClick={() => setViewTrash(!viewTrash)}>
                        {viewTrash ? "Quay lại danh sách" : "Thùng rác"}
                    </Button>
                    {!viewTrash && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
                            Thêm mới
                        </Button>
                    )}
                </Space>
            </div>

            {/* Table */}
            <CustomTable
                columns={columns}
                data={viewTrash ? trash : brands}
                loading={loading}
                bordered={true}
                pagination={{ pageSize: 5 }}
            />

            {/* Modal - Đã tách riêng */}
            <BrandModal 
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                loading={loading}
                initialValues={selectedBrand}
                validationErrors={validationErrors}
            />
        </div>
    );
};

export default BrandManagement;