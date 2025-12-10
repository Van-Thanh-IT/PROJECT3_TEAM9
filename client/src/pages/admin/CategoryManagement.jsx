import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
    Button, 
    Space, 
    message, 
    Tag, 
    Tooltip, 
    Switch, 
    Input, 
    Card, 
    Row, 
    Col, 
    Statistic 
} from "antd";
import { 
    PlusOutlined, 
    EditOutlined, 
    SearchOutlined, 
    ReloadOutlined,
    FileExcelOutlined,
    AppstoreOutlined,
    CheckCircleOutlined,
    StopOutlined,
    BranchesOutlined
} from "@ant-design/icons";

// Import actions
import { 
    fetchCategories, 
    createCategory, 
    updateCategory, 
    toggleCategoryStatus
} from "../../features/category/categoryThunks"; 
import { clearErrors } from "../../features/category/categorySlice";

// Import Utility & Components
import { exportExcel } from "../../utils/exportExcel"; // File utils bạn đã tạo
import CustomTable from "../../components/common/table/CustomTable"; 
import CategoryModal from "../../components/common/modal/CategoryModal"; 

const CategoryManagement = () => {
    const dispatch = useDispatch();

    // Lấy state từ Redux Store
    const { categories, status, validationErrors } = useSelector((state) => state.category);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchText, setSearchText] = useState("");

    // 1. Load Data
    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    // --- LOGIC LỌC DỮ LIỆU (useMemo) ---
    const filteredCategories = useMemo(() => {
        let data = [...categories];
        if (searchText) {
            const value = searchText.toLowerCase();
            data = data.filter((item) => 
                item.id?.toString().includes(value) || 
                item.name?.toLowerCase().includes(value) || 
                item.slug?.toLowerCase().includes(value)
            );
        }
        return data; // Có thể sort thêm nếu cần
    }, [categories, searchText]);
    console.log(categories);

    // --- TÍNH TOÁN SUMMARY ---
    const summaryData = useMemo(() => {
        const total = categories.length;
        const active = categories.filter(c => c.status === 1 || c.status === true).length;
        const inactive = total - active;
        const subCategories = categories.filter(c => c.parent_id !== null).length; // Danh mục con

        return { total, active, inactive, subCategories };
    }, [categories]);

    // --- DATA CHO MODAL ---
    const activeCategoriesForModal = useMemo(() => 
        categories.filter(cat => cat.status === 1 || cat.status === true), 
    [categories]);

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

    // 5. Xử lý Xuất Excel
    const handleExportExcel = () => {
        if (filteredCategories.length === 0) {
            message.warning("Không có dữ liệu để xuất!");
            return;
        }
        
        const dataToExport = filteredCategories.map(item => {
            const parentName = item.parent_id 
                ? categories.find(c => c.id === item.parent_id)?.name || item.parent_id
                : "Danh mục gốc";

            return {
                "ID": item.id,
                "Tên danh mục": item.name,
                "Slug": item.slug,
                "Danh mục cha": parentName,
                "Trạng thái": (item.status === 1 || item.status === true) ? "Hiện" : "Ẩn",
                "Mô tả": item.description
            };
        });

        exportExcel(dataToExport, "Danh_sach_danh_muc.xlsx");
        message.success("Đang tải xuống file Excel...");
    };

    // 6. Cấu hình bảng
    const columns = [
        { 
            title: "ID", 
            dataIndex: "id", 
            width: 60, 
            align: 'center',
            sorter: (a, b) => a.id - b.id 
        },
        {
            title: "Ảnh",
            dataIndex: "image",
            width: 80,
            align: 'center',
            render: (url) => (
                url 
                ? <img src={url} alt="img" className="w-10 h-10 object-cover rounded border border-gray-200" /> 
                : <Tag>No Img</Tag>
            )
        },
        { 
            title: "Tên danh mục", 
            dataIndex: "name", 
            width: 200, 
            render: (text) => <strong className="text-blue-600">{text}</strong>,
            sorter: (a, b) => a.name.localeCompare(b.name)
        },
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
        { title: "Slug", dataIndex: "slug", width: 150, ellipsis: true },
        {
            title: "Trạng thái",
            dataIndex: "status",
            width: 100,
            align: 'center',
            render: (status, record) => (
                <Switch 
                    checked={status === 1 || status === true} 
                    onChange={() => handleToggleStatus(record.id)}
                    checkedChildren="Hiện"
                    unCheckedChildren="Ẩn"
                    loading={false} // Có thể thêm state loading riêng cho switch nếu cần
                />
            )
        },
        {
            title: "Hành động",
            key: "action",
            fixed: "right",
            width: 80,
            align: 'center',
            render: (_, record) => (
                <Tooltip title="Sửa">
                    <Button 
                        type="primary" 
                        ghost 
                        icon={<EditOutlined />} 
                        size="small" 
                        onClick={() => handleOpenModal(record)} 
                    />
                </Tooltip>
            ),
        },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            
            {/* --- 1. SUMMARY DASHBOARD --- */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Quản lý Danh mục</h1>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                            <Statistic 
                                title={<span className="text-gray-500 font-medium">Tổng danh mục</span>}
                                value={summaryData.total} 
                                prefix={<AppstoreOutlined className="text-blue-500 mr-2" />} 
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                            <Statistic 
                                title={<span className="text-gray-500 font-medium">Đang hiển thị</span>}
                                value={summaryData.active} 
                                prefix={<CheckCircleOutlined className="text-green-500 mr-2" />} 
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                            <Statistic 
                                title={<span className="text-gray-500 font-medium">Đang ẩn</span>}
                                value={summaryData.inactive} 
                                prefix={<StopOutlined className="text-red-500 mr-2" />} 
                                valueStyle={{ color: '#cf1322' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                            <Statistic 
                                title={<span className="text-gray-500 font-medium">Danh mục con</span>}
                                value={summaryData.subCategories} 
                                prefix={<BranchesOutlined className="text-purple-500 mr-2" />} 
                            />
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* --- 2. ACTIONS & TABLE --- */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    {/* Search */}
                    <Input 
                        placeholder="Tìm kiếm danh mục..." 
                        prefix={<SearchOutlined className="text-gray-400" />} 
                        allowClear
                        size="large"
                        className="max-w-md w-full"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />

                    {/* Buttons */}
                    <Space wrap>
                        <Button 
                            icon={<FileExcelOutlined />} 
                            onClick={handleExportExcel}
                            className="border-green-600 text-green-600 hover:bg-green-50"
                        >
                            Xuất Excel
                        </Button>
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />} 
                            onClick={() => handleOpenModal()}
                        >
                            Thêm mới
                        </Button>
                        <Button 
                            icon={<ReloadOutlined spin={status === 'loading'} />} 
                            onClick={() => dispatch(fetchCategories())}
                        />
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
                        showTotal: (total) => `Tổng ${total} danh mục`
                    }}
                    scroll={{ x: 800 }}
                />
            </div>

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