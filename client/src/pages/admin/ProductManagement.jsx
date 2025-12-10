// src/pages/product/ProductManagement.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Space, message, Tag, Switch, Image, Tooltip, Tabs } from "antd"; // 1. Import Tabs
import { PlusOutlined, EditOutlined, UnorderedListOutlined, PictureOutlined, AppstoreOutlined, TagsOutlined } from "@ant-design/icons";

import { 
    fetchProducts, 
    createProduct, 
    updateProduct,
    toggleProductStatus,
    createVariant,
    updateVariant,
    softDeleteVariant,
    createImage,      
    softDeleteImage,  
    setPrimaryImage    
} from "../../features/product/productThunks";

import { fetchBrands } from "../../features/brand/brandThunks";
import { fetchCategories } from "../../features/category/categoryThunks";
import { clearErrors } from "../../features/product/productSlice";

// Import Components
import CustomTable from "../../components/common/table/CustomTable";
import ProductModal from "../../components/common/modal/ProductModal";
import ProductVariantModal from "../../components/common/modal/ProductVariantModal";
import ProductImageModal from "../../components/common/modal/ProductImageModal";

import BrandManagement from "./BrandManagement";

const ProductManagement = () => {
    const dispatch = useDispatch();
    
    // --- REDUX STATE ---
    const { products, status } = useSelector((state) => state.product);
    const { brands } = useSelector((state) => state.brand);
    const { categories } = useSelector((state) => state.category);
    // --- LOCAL STATE ---
    // 1. Modal Sản phẩm
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // 2. Modal Biến thể
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
    const [variantProduct, setVariantProduct] = useState(null);

    // 3. Modal Hình ảnh
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [imageProduct, setImageProduct] = useState(null);

    // --- INITIAL LOAD ---
    useEffect(() => {
        dispatch(fetchProducts());
        dispatch(fetchBrands());
        dispatch(fetchCategories());
    }, [dispatch]);

    // ==========================================
    //  HELPER: Show Error & Refresh Data
    // ==========================================
    const showErrorMessage = (payload, defaultMsg) => {
        let msg = defaultMsg;
        if (payload) {
            if (typeof payload === 'string') msg = payload;
            else if (payload.message) msg = payload.message;
        }
        message.error(msg);
    };

    // Hàm refresh lại data
    const refreshProductData = async (productId, setProductState) => {
        const res = await dispatch(fetchProducts());
        if (res.payload) {
            const updatedProduct = res.payload.find(p => p.id === productId);
            if (updatedProduct) setProductState(updatedProduct);
        }
    };

    // ==========================================
    //  A. CÁC HÀM MỞ MODAL
    // ==========================================
    const handleOpenProductModal = (record = null) => {
        dispatch(clearErrors());
        setSelectedProduct(record ? { ...record } : null);
        setIsProductModalOpen(true);
    };

    const handleOpenVariantModal = (record) => {
        setVariantProduct({ ...record });
        setIsVariantModalOpen(true);
    };

    const handleOpenImageModal = (record) => {
        setImageProduct({ ...record });
        setIsImageModalOpen(true);
    };

    // ==========================================
    //  B. LOGIC SẢN PHẨM
    // ==========================================
    const handleCreateProduct = async (values) => {
        try {
            const formData = new FormData();
            ['name', 'description', 'material', 'style', 'price',"old_price", 'category_id', 'brand_id'].forEach(key => {
                if (values[key] !== undefined && values[key] !== null) formData.append(key, values[key]);
            });
            if (values.variants?.length > 0) {
                values.variants.forEach((v, i) => {
                    formData.append(`variants[${i}][color]`, v.color);
                    formData.append(`variants[${i}][size]`, v.size);
                    formData.append(`variants[${i}][price]`, v.price);
                });
            }
            if (values.images?.length > 0) {
                values.images.forEach((file) => formData.append('images[]', file));
            }

            const action = await dispatch(createProduct(formData));
            if (createProduct.fulfilled.match(action)) {
                message.success("Tạo sản phẩm thành công!");
                setIsProductModalOpen(false);
                dispatch(fetchProducts());
            } else {
                showErrorMessage(action.payload, "Lỗi khi tạo sản phẩm");
            }
        } catch (error) { console.error(error); }
    };

    const handleUpdateProductInfo = async (values) => {
        try {
            const formData = new FormData();
            ['name', 'description', 'material', 'style', 'price', 'old_price', 'category_id', 'brand_id'].forEach(key => {
                if (values[key] !== undefined && values[key] !== null) formData.append(key, values[key]);
            });
            formData.append('_method', 'PUT');
            const action = await dispatch(updateProduct({ id: selectedProduct.id, data: formData }));
            if (updateProduct.fulfilled.match(action)) {
                message.success("Đã cập nhật thông tin!");
                setIsProductModalOpen(false);
                dispatch(fetchProducts()); 
            } else { showErrorMessage(action.payload, "Lỗi cập nhật"); }
        } catch (error) { console.error(error); }
    };

    const handleToggleStatus = async (id) => {
        const action = await dispatch(toggleProductStatus(id));
        if (toggleProductStatus.fulfilled.match(action)) {
            message.success("Đã thay đổi trạng thái!");
            dispatch(fetchProducts());
        } else { showErrorMessage(action.payload, "Lỗi thay đổi trạng thái"); }
    };

    // ==========================================
    //  C. LOGIC BIẾN THỂ
    // ==========================================
    const handleCreateVariant = async (productId, values) => {
        const action = await dispatch(createVariant({ productId, formData: values }));
        if (createVariant.fulfilled.match(action)) {
            message.success("Thêm biến thể thành công!");
            await refreshProductData(productId, setVariantProduct);
        } else { showErrorMessage(action.payload, "Lỗi thêm biến thể"); }
    };

    const handleUpdateVariant = async (variantId, values) => {
        const action = await dispatch(updateVariant({ variantId, data: values }));
        if (updateVariant.fulfilled.match(action)) {
            message.success("Cập nhật thành công!");
            await refreshProductData(variantProduct.id, setVariantProduct);
        } else { showErrorMessage(action.payload, "Lỗi cập nhật"); }
    };

    const handleDeleteVariant = async (variantId) => {
        const action = await dispatch(softDeleteVariant(variantId));
        if (softDeleteVariant.fulfilled.match(action)) {
            message.success("Đã xóa biến thể!");
            await refreshProductData(variantProduct.id, setVariantProduct);
        } else { showErrorMessage(action.payload, "Lỗi xóa biến thể"); }
    };

    const handleCreateImage = async (productId, formData) => {
        const action = await dispatch(createImage({ productId,data:formData }));
        if (createImage.fulfilled.match(action)) {
            message.success("Upload ảnh thành công!");
            await refreshProductData(productId, setImageProduct);
        } else {
            showErrorMessage(action.payload, "Lỗi upload ảnh");
        }
    };

    const handleDeleteImage = async (imageId) => {
        const action = await dispatch(softDeleteImage(imageId));
        if (softDeleteImage.fulfilled.match(action)) {
            message.success("Đã xóa ảnh!");
            await refreshProductData(imageProduct.id, setImageProduct);
        } else {
            showErrorMessage(action.payload, "Lỗi xóa ảnh");
        }
    };

    const handleSetPrimaryImage = async (productId, imageId) => {
        const action = await dispatch(setPrimaryImage({ productId, imageId }));
        if (setPrimaryImage.fulfilled.match(action)) {
            message.success("Đã đặt làm ảnh chính!");
            await refreshProductData(productId, setImageProduct);
        } else {
            showErrorMessage(action.payload, "Lỗi đặt ảnh chính");
        }
    };


    const columns = [
        { title: "ID", dataIndex: "id", width: 60, align: 'center' },
        { 
            title: "Tên sản phẩm", 
            dataIndex: "name", 
            width: 200,
            render: (text) => <strong style={{ color: '#1890ff' }}>{text}</strong> 
        },
        { 
            title: "Ảnh",
            dataIndex: "images",
            width: 80, 
            align: 'center',
            render: (images) => {
                if (!images || images.length === 0) return <span style={{fontSize: 12, color: '#999'}}>No Image</span>;
                const primaryImage = images.find(img => img.is_primary) || images[0];
                return (
                    <Image 
                        src={primaryImage.url} 
                        width={30} height={30} 
                        style={{ objectFit: "cover", borderRadius: 4, border: '1px solid #ddd' }} 
                        preview={{ mask: 'Xem' }}
                    />
                );
            }
        },
        { 
            title: "Giá bán", 
            dataIndex: "price", 
            render: (price) => <span style={{ fontWeight: 600 }}>{Number(price).toLocaleString('vi-VN')} đ</span> 
        },
        { 
            title: "Danh mục", 
            dataIndex: "category", 
            render: (cat) => cat ? <Tag color="geekblue">{cat.name}</Tag> : <Tag>N/A</Tag>
        },
        { 
            title: "Thương hiệu", 
            dataIndex: "brand", 
            render: (brand) => brand ? <Tag color="purple">{brand.name}</Tag> : <Tag>N/A</Tag>
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            align: 'center',
            render: (status, record) => (
                <Switch
                    checked={status === "active"}
                    checkedChildren="Hiện"
                    unCheckedChildren="Ẩn"
                    onChange={() => handleToggleStatus(record.id)}
                />
            )
        },
        {
            title: "Hành động",
            key: "action",
            align: "center",
            width: 200,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Sửa thông tin chung">
                        <Button 
                            type="primary" ghost icon={<EditOutlined />} size="small" 
                            onClick={() => handleOpenProductModal(record)} 
                        />
                    </Tooltip>
                    
                    <Tooltip title="Quản lý biến thể">
                        <Button 
                            style={{ borderColor: '#52c41a', color: '#52c41a' }} 
                            icon={<UnorderedListOutlined />} size="small" 
                            onClick={() => handleOpenVariantModal(record)} 
                        >
                            ({record.variants ? record.variants.length : 0})
                        </Button>
                    </Tooltip>

                    <Tooltip title="Quản lý hình ảnh">
                        <Button 
                            style={{ borderColor: '#faad14', color: '#faad14' }} 
                            icon={<PictureOutlined />} size="small" 
                            onClick={() => handleOpenImageModal(record)} 
                        >
                            ({record.images ? record.images.length : 0})
                        </Button>
                    </Tooltip>
                </Space>
            )
        }
    ];

    // ==========================================
    //  E. CONTENT FOR PRODUCT TAB
    // ==========================================
    const renderProductTab = () => (
        <>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 5}}>
                <Button 
                    type="primary" icon={<PlusOutlined />} size="large"
                    onClick={() => handleOpenProductModal(null)}
                >
                    Thêm sản phẩm
                </Button>
            </div>

            <CustomTable 
                columns={columns} 
                data={products} 
                loading={status === 'loading'} 
                bordered
                rowKey="id"
                pagination={{ 
                    pageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '25', '50', '100', '200', '1000']
                }} 
                scroll={{x:920}}
            />

            {/* Các Modal của Product */}
            <ProductModal
                open={isProductModalOpen}
                onCancel={() => setIsProductModalOpen(false)}
                loading={status === 'loading'}
                initialValues={selectedProduct}
                brands={brands}
                categories={categories}
                onCreate={handleCreateProduct} 
                onUpdateInfo={handleUpdateProductInfo}
            />

            <ProductVariantModal 
                open={isVariantModalOpen}
                onCancel={() => setIsVariantModalOpen(false)}
                product={variantProduct}
                loading={status === 'loading'}
                onCreate={handleCreateVariant}
                onUpdate={handleUpdateVariant}
                onDelete={handleDeleteVariant}
            />

            <ProductImageModal 
                open={isImageModalOpen}
                onCancel={() => setIsImageModalOpen(false)}
                product={imageProduct}
                loading={status === 'loading'}
                onCreate={handleCreateImage}
                onDelete={handleDeleteImage}
                onSetPrimary={handleSetPrimaryImage}
            />
        </>
    );

    // ==========================================
    //  F. TAB ITEMS CONFIGURATION
    // ==========================================
    const tabItems = [
        {
            key: '1',
            label: (
                <span>
                    <AppstoreOutlined />
                    Danh sách sản phẩm
                </span>
            ),
            children: renderProductTab(),
        },
        {
            key: '2',
            label: (
                <span>
                    <TagsOutlined />
                    Quản lý thương hiệu
                </span>
            ),
            children: <BrandManagement />,
        },
    ];

    // ==========================================
    //  G. RENDER MAIN COMPONENT
    // ==========================================
    return (
        <div style={{ padding: 20, background: '#fff', borderRadius: 8, minHeight: '80vh' }}>
            <Tabs defaultActiveKey="1" items={tabItems} />
        </div>
    );
};

export default ProductManagement;