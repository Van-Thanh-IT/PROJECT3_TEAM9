import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsByCategorySlug } from '../../features/Category/categoryThunks';
import ProductCard from '../../features/product/components/ProductCard';
// Import icon để giao diện đẹp hơn (nếu bạn chưa cài react-icons thì bỏ qua hoặc cài: npm install react-icons)
import { FaFilter, FaSortAmountDown, FaHome } from "react-icons/fa";

const CategoryPage = () => {
    const { slug } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Lấy dữ liệu từ Redux
    const { productsByCategory, categories, status, error } = useSelector((state) => state.category);

    // --- STATE CHO FILTER & SORT ---
    const [sortBy, setSortBy] = useState('default'); // default, price-asc, price-desc, newest, name-az
    const [filterPrice, setFilterPrice] = useState({ min: '', max: '' }); // Khoảng giá
    const [isFilterVisible, setIsFilterVisible] = useState(false); // Toggle hiển thị bộ lọc trên mobile

    // 1. Gọi API khi Slug thay đổi
    useEffect(() => {
        if (slug) {
            dispatch(fetchProductsByCategorySlug(slug));
            // Reset bộ lọc khi chuyển danh mục
            setSortBy('default');
            setFilterPrice({ min: '', max: '' });
        }
        window.scrollTo(0, 0);
    }, [dispatch, slug]);

    // 2. Tìm danh mục hiện tại & Breadcrumb logic
    const currentCategory = useMemo(() => {
        if (!categories || categories.length === 0) return null;
        return categories.find(c => c.slug === slug);
    }, [categories, slug]);

    const breadcrumbs = useMemo(() => {
        if (!currentCategory || !categories || categories.length === 0) return [];
        const path = [];
        let current = currentCategory;
        while (current) {
            path.unshift(current);
            if (current.parent_id) {
                const parent = categories.find(c => c.id === current.parent_id);
                current = parent ? parent : null;
            } else {
                current = null;
            }
        }
        return path;
    }, [currentCategory, categories]);

    // 3. Chuẩn hóa dữ liệu đầu vào (Tránh lỗi data wrapper)
    const rawProductList = useMemo(() => {
        if (!productsByCategory) return [];
        if (Array.isArray(productsByCategory)) return productsByCategory;
        if (productsByCategory.data && Array.isArray(productsByCategory.data)) return productsByCategory.data;
        return [];
    }, [productsByCategory]);

    // --- 4. LOGIC LỌC VÀ SẮP XẾP (QUAN TRỌNG) ---
    const processedProducts = useMemo(() => {
        let products = [...rawProductList];

        // A. LỌC THEO GIÁ (Filter)
        if (filterPrice.min !== '') {
            products = products.filter(p => Number(p.price) >= Number(filterPrice.min));
        }
        if (filterPrice.max !== '') {
            products = products.filter(p => Number(p.price) <= Number(filterPrice.max));
        }

        // B. SẮP XẾP (Sorting)
        switch (sortBy) {
            case 'price-asc': // Giá thấp đến cao
                products.sort((a, b) => Number(a.price) - Number(b.price));
                break;
            case 'price-desc': // Giá cao đến thấp
                products.sort((a, b) => Number(b.price) - Number(a.price));
                break;
            case 'newest': // Mới nhất (Giả sử có field created_at hoặc id lớn là mới)
                products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); 
                // Hoặc dùng: b.id - a.id
                break;
            case 'name-az': // Tên A-Z
                products.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                break;
        }

        return products;
    }, [rawProductList, sortBy, filterPrice]);

    // Handler nhập giá
    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        setFilterPrice(prev => ({ ...prev, [name]: value }));
    };

    const handleViewDetail = (product) => {
        navigate(`/product/${product.slug}`);
    };

    // --- RENDER ---
    if (status === 'loading') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="container mx-auto px-4 py-10 text-center text-red-500">
                {error || "Lỗi tải dữ liệu"}
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-10 font-sans">
            {/* --- HEADER & BREADCRUMB --- */}
            <div className="bg-white shadow-sm mb-6">
                <div className="container mx-auto  pt-5 pb-2">
                    <nav className="flex items-center text-sm text-gray-500 mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
                        <Link to="/" className="hover:text-blue-600 flex items-center gap-1">
                             <FaHome /> Trang chủ
                        </Link>
                        {breadcrumbs.map((item, index) => {
                            const isLast = index === breadcrumbs.length - 1;
                            return (
                                <span key={item.id} className="flex items-center">
                                    <span className="mx-2 text-gray-400">/</span>
                                    {isLast ? (
                                        <span className="text-gray-900 font-bold">{item.name}</span>
                                    ) : (
                                        <Link to={`/category/${item.slug}`} className="hover:text-blue-600">
                                            {item.name}
                                        </Link>
                                    )}
                                </span>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* --- TOOLBAR: BỘ LỌC & SẮP XẾP --- */}
            <div className="container mx-auto px-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        
                        {/* 1. Nút mở bộ lọc (Mobile) & Label */}
                        <div className="flex items-center justify-between md:justify-start gap-4">
                            <div className="flex items-center gap-2 text-gray-700 font-medium">
                                <FaFilter className="text-blue-600"/>
                                <span>Bộ lọc</span>
                            </div>
                            {/* Hiển thị số lượng sản phẩm */}
                            <span className="text-sm text-gray-500">
                                Tìm thấy <strong>{processedProducts.length}</strong> sản phẩm
                            </span>
                        </div>

                        {/* 2. Khu vực Input & Select */}
                        <div className="flex flex-col md:flex-row gap-3 md:items-center">
                            
                            {/* Lọc theo giá */}
                            <div className="flex items-center gap-2 text-sm">
                                <input 
                                    type="number" 
                                    name="min"
                                    placeholder="Giá từ" 
                                    value={filterPrice.min}
                                    onChange={handlePriceChange}
                                    className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                />
                                <span className="text-gray-400">-</span>
                                <input 
                                    type="number" 
                                    name="max"
                                    placeholder="Đến giá" 
                                    value={filterPrice.max}
                                    onChange={handlePriceChange}
                                    className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="h-6 w-[1px] bg-gray-300 hidden md:block"></div>

                            {/* Sắp xếp dropdown */}
                            <div className="flex items-center gap-2">
                                <FaSortAmountDown className="text-gray-400 hidden md:block" />
                                <select 
                                    value={sortBy} 
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded bg-white text-sm text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                                >
                                    <option value="default">Mặc định</option>
                                    <option value="newest">Mới nhất</option>
                                    <option value="price-asc">Giá: Thấp đến Cao</option>
                                    <option value="price-desc">Giá: Cao đến Thấp</option>
                                    <option value="name-az">Tên: A - Z</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- DANH SÁCH SẢN PHẨM --- */}
            <div className="container mx-auto px-4">
                {processedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                        {processedProducts.map((product) => (
                            <div key={product.id} className="h-full">
                                <ProductCard 
                                    product={product} 
                                    onViewDetail={handleViewDetail} 
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    // Empty State khi lọc không ra kết quả
                    <div className="bg-white rounded-lg p-10 text-center shadow-sm border border-gray-100">
                        <img 
                            src="https://cdn-icons-png.flaticon.com/512/4076/4076432.png" 
                            alt="Empty" 
                            className="w-20 h-20 mx-auto mb-4 opacity-40"
                        />
                        <h3 className="text-lg font-medium text-gray-900">Không tìm thấy sản phẩm</h3>
                        <p className="text-gray-500">Thử thay đổi bộ lọc hoặc khoảng giá của bạn.</p>
                        <button 
                            onClick={() => { setFilterPrice({min: '', max: ''}); setSortBy('default'); }}
                            className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-medium transition"
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;