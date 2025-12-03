import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { searchProducts } from '../../features/product/productThunks'; 
import ProductCard from '../../features/product/components/ProductCard'; 
// Icons
import { FaFilter, FaDollarSign } from "react-icons/fa";
// Thư viện Slider
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const SearchPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Lấy data từ Redux
    const { productSearch, pagination, isLoading } = useSelector((state) => state.product || {});

    // --- CẤU HÌNH SLIDER ---
    const MIN_LIMIT = 0;
    const MAX_LIMIT = 50000000; 

    // Lấy params từ URL
    const queryTerm = searchParams.get('q');
    const minPriceTerm = searchParams.get('min_price');
    const maxPriceTerm = searchParams.get('max_price');
    const pageTerm = searchParams.get('page');

    // State riêng cho Slider (Mảng 2 phần tử [min, max])
    const [priceRange, setPriceRange] = useState([
        Number(minPriceTerm) || MIN_LIMIT, 
        Number(maxPriceTerm) || MAX_LIMIT
    ]);

    // Format tiền tệ
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    // --- EFFECT: ĐỒNG BỘ URL VÀ GỌI API ---
    useEffect(() => {
        const params = {
            q: queryTerm,
            min_price: minPriceTerm,
            max_price: maxPriceTerm,
            page: pageTerm || 1,
        };
        
        dispatch(searchProducts(params));
        window.scrollTo(0, 0);

        // Đồng bộ lại slider khi URL thay đổi
        setPriceRange([
            Number(minPriceTerm) || MIN_LIMIT, 
            Number(maxPriceTerm) || MAX_LIMIT
        ]);

    }, [dispatch, queryTerm, minPriceTerm, maxPriceTerm, pageTerm]);

    // Xử lý khi kéo Slider
    const handleSliderChange = (value) => {
        setPriceRange(value);
    };

    // Submit bộ lọc (Chỉ xử lý Giá, giữ nguyên Từ khóa)
    const handleFilterSubmit = (e) => {
        e.preventDefault();
        const params = {};
        
        // 1. Giữ lại từ khóa đang tìm kiếm (nếu có)
        if (queryTerm) params.q = queryTerm;
        
        // 2. Thêm khoảng giá mới
        if (priceRange[0] > MIN_LIMIT) params.min_price = priceRange[0];
        if (priceRange[1] < MAX_LIMIT) params.max_price = priceRange[1];
        
        // 3. Reset về trang 1
        params.page = 1; 
        
        setSearchParams(params);
    };

    const handlePageChange = (newPage) => {
        if (pagination && newPage >= 1 && newPage <= pagination.lastPage) {
            const currentParams = Object.fromEntries([...searchParams]);
            setSearchParams({ ...currentParams, page: newPage });
        }
    };

    const handleViewDetail = (product) => {
        navigate(`/product/${product.slug}`);
    };

    return (
        <div className="bg-gray-50 min-h-screen py-8 font-sans">
            <div className="container-fuild mx-auto px-4">
                <div className="flex flex-col md:flex-row gap-8">
                    
                    {/* --- SIDEBAR BỘ LỌC --- */}
                    {/* Fix cứng chiều rộng 280px (w-72) để không bị co giãn lung tung */}
                    <aside className="w-full md:w-72 flex-shrink-0">
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                            <h3 className="font-bold text-gray-800 text-lg mb-5 flex items-center gap-2 border-b pb-3">
                                <FaFilter className="text-blue-600"/> Bộ lọc
                            </h3>
                            
                            <form onSubmit={handleFilterSubmit} className="space-y-6">
                                {/* Chỉ còn Slider Giá */}
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-4 block flex justify-between items-center">
                                        <span>Khoảng giá</span>
                                        <FaDollarSign className="text-gray-400 bg-gray-100 p-1 rounded-full w-6 h-6"/>
                                    </label>
                                    
                                    <div className="px-2 mb-6">
                                        <Slider
                                            range
                                            min={MIN_LIMIT}
                                            max={MAX_LIMIT}
                                            step={100000}
                                            value={priceRange}
                                            onChange={handleSliderChange}
                                            trackStyle={[{ backgroundColor: '#2563eb', height: 6 }]}
                                            handleStyle={[
                                                { borderColor: '#2563eb', height: 20, width: 20, marginTop: -7, backgroundColor: 'white', opacity: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
                                                { borderColor: '#2563eb', height: 20, width: 20, marginTop: -7, backgroundColor: 'white', opacity: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }
                                            ]}
                                            railStyle={{ backgroundColor: '#e5e7eb', height: 6 }}
                                        />
                                    </div>

                                    {/* Hiển thị số tiền */}
                                    <div className="flex justify-between items-center text-xs font-medium text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                        <span>{formatCurrency(priceRange[0])}</span>
                                        <span className="text-blue-300">|</span>
                                        <span>{formatCurrency(priceRange[1])}</span>
                                    </div>
                                </div>

                                {/* Nút Áp dụng */}
                                <button 
                                    type="submit" 
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-[0.98] duration-200"
                                >
                                    Áp dụng
                                </button>
                            </form>
                        </div>
                    </aside>

                    {/* --- DANH SÁCH SẢN PHẨM --- */}
                    {/* Dùng flex-1 để chiếm toàn bộ không gian còn lại (thay vì w-3/4) */}
                    <div className="flex-1">
                        {/* Header kết quả */}
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <h1 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                                {queryTerm ? (
                                    <>Kết quả tìm kiếm: <span className="text-blue-600">"{queryTerm}"</span></>
                                ) : (
                                    "Tất cả sản phẩm"
                                )}
                            </h1>
                            <span className="text-sm font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full mt-2 sm:mt-0">
                                {pagination?.total || 0} sản phẩm
                            </span>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-20 bg-white rounded-xl shadow-sm min-h-[400px] items-center">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {Array.isArray(productSearch) && productSearch.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                                        {productSearch.map((product) => (
                                            <ProductCard 
                                                key={product.id} 
                                                product={product} 
                                                onViewDetail={handleViewDetail} 
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-200">
                                        <img src="https://cdn-icons-png.flaticon.com/512/4076/4076432.png" alt="Empty" className="w-20 h-20 mx-auto mb-4 opacity-40 grayscale"/>
                                        <h3 className="text-lg font-bold text-gray-700 mb-1">Không tìm thấy sản phẩm</h3>
                                        <p className="text-gray-500 text-sm">Vui lòng thử lại với từ khóa hoặc khoảng giá khác.</p>
                                    </div>
                                )}

                                {/* Pagination */}
                                {pagination && pagination.lastPage > 1 && (
                                    <div className="mt-10 flex justify-center gap-2">
                                        <button
                                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                                            disabled={pagination.currentPage === 1}
                                            className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors text-gray-700"
                                        >
                                            Trước
                                        </button>

                                        {Array.from({ length: pagination.lastPage }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all shadow-sm ${
                                                    pagination.currentPage === page 
                                                    ? 'bg-blue-600 text-white shadow-blue-200 ring-2 ring-blue-100' 
                                                    : 'bg-white text-gray-700 hover:bg-gray-50 border hover:border-blue-300'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        <button
                                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                                            disabled={pagination.currentPage === pagination.lastPage}
                                            className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors text-gray-700"
                                        >
                                            Sau
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchPage;