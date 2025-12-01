import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Space, message, Tag, Tooltip, Switch, Input } from "antd"; // Import thêm Input
import { PlusOutlined, EditOutlined, SearchOutlined } from "@ant-design/icons";

// Import actions
import { 
    fetchCategories, 
    createCategory, 
    updateCategory, 
    toggleCategoryStatus
} from "../../features/category/categoryThunks"; 
import { clearErrors } from "../../features/category/categorySlice";

import CustomTable from "../../components/common/table/CustomTable"; 
import CategoryModal from "../../components/common/modal/CategoryModal"; 

const CategoryManagement = () => {
    const dispatch = useDispatch();

    // Lấy state từ Redux Store
    const { categories, status, validationErrors } = useSelector((state) => state.category);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchText, setSearchText] = useState(""); // 1. State tìm kiếm

    // 1. Load Data
    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    const filteredCategories = categories.filter((item) => {
        const value = searchText.toLowerCase();
        return (
            item.id?.toString().includes(value) || 
            item.name?.toLowerCase().includes(value) || 
            item.slug?.toLowerCase().includes(value) 
        );
    });

    const activeCategoriesForModal = categories.filter(cat => 
        cat.status === 1 || cat.status === true
    );

    // 2. Mở Modal
    const handleOpenModal = (record = null) => {
        dispatch(clearErrors());
        setSelectedCategory(record);
        setIsModalOpen(true);
    };

    // 3. Xử lý Submit
    const handleSubmit = async (values) => {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('description', values.description || '');
        
        if (values.parent_id) {
            formData.append('parent_id', values.parent_id);
        }
        if (values.image) {
            formData.append('image', values.image);
        }

        let action;
        if (selectedCategory) {
            formData.append('_method', 'PUT'); 
            action = updateCategory({ id: selectedCategory.id, data: formData });
        } else {
            action = createCategory(formData);
        }

        const resultAction = await dispatch(action);

        if (createCategory.fulfilled.match(resultAction) || updateCategory.fulfilled.match(resultAction)) {
            message.success(selectedCategory ? "Cập nhật thành công!" : "Thêm mới thành công!");
            setIsModalOpen(false);
            setSelectedCategory(null);
            dispatch(fetchCategories()); 
        } else {
            if (!resultAction.payload?.errors) {
                message.error(resultAction.payload?.message || "Có lỗi xảy ra!");
            }
        }
    };

    // 4. Xử lý Ẩn/Hiện
    const handleToggleStatus = async (id) => {
        const resultAction = await dispatch(toggleCategoryStatus(id));
        if (toggleCategoryStatus.fulfilled.match(resultAction)) {
            message.success("Đã thay đổi trạng thái!");
            dispatch(fetchCategories());
        } else {
            message.error("Lỗi khi cập nhật trạng thái");
        }
    };

    // 5. Cấu hình bảng
    const columns = [
        { title: "ID", dataIndex: "id", width: 60, sorter: (a, b) => a.id - b.id }, // Thêm sorter cho ID
        {
            title: "Ảnh",
            dataIndex: "image",
            width: 80,
            render: (url) => (
                url 
                ? <img src={url} alt="img" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} /> 
                : <Tag>No Img</Tag>
            )
        },
        { 
            title: "Tên danh mục", 
            dataIndex: "name", 
            width: 180, 
            render: (text) => <strong>{text}</strong>,
            sorter: (a, b) => a.name.localeCompare(b.name) // Thêm sorter cho Tên
        },
        { title: "Slug", dataIndex: "slug", width: 150 }, 
        
        { 
            title: "Danh mục cha", 
            dataIndex: "parent_id",
            width: 150,
            render: (parentId) => {
                if (!parentId) return <Tag color="green">Gốc</Tag>;
                const parent = categories.find(c => c.id === parentId);
                return parent ? <Tag color="blue">{parent.name}</Tag> : <Tag>ID: {parentId}</Tag>;
            }
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            width: 100,
            render: (status, record) => (
                <Switch 
                    checked={status} 
                    onChange={() => handleToggleStatus(record.id)}
                    checkedChildren="Hiện"
                    unCheckedChildren="Ẩn"
                    loading={status === 'loading' && selectedCategory?.id === record.id}
                />
            )
        },
        { title: "Mô tả", dataIndex: "description", ellipsis: true },
        {
            title: "Hành động",
            key: "action",
            fixed: "right",
            width: 80,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Sửa">
                        <Button type="default" icon={<EditOutlined />} size="small" onClick={() => handleOpenModal(record)} />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 20 }}>
            {/* Header: Title + Search + Add Button */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h1>Quản lý Danh mục</h1>
                
                <Space>
                    {/* --- THANH TÌM KIẾM --- */}
                    <Input.Search
                        placeholder="Tìm theo ID, Tên, Slug..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        size="middle"
                        onChange={(e) => setSearchText(e.target.value)} 
                        onSearch={(value) => setSearchText(value)}
                        style={{ width: 300 }}
                    />

                    <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
                        Thêm mới
                    </Button>
                </Space>
            </div>

            <CustomTable
                columns={columns}
                data={filteredCategories}
                loading={status === 'loading'}
                bordered={true}
                pagination={{ 
                    pageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: [5, 10, 20, 50]
                }}
            />

            <CategoryModal 
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                loading={status === 'loading'}
                initialValues={selectedCategory}
                validationErrors={validationErrors}
                categories={activeCategoriesForModal} 
            />
        </div>
    );
};

export default CategoryManagement;