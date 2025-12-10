import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import ProductCard from './ProductCard'; // Đảm bảo đường dẫn import đúng file của bạn
import { fetchBestSellingProducts } from '../productThunks';
const BestSellingProduct = () => {
    const dispatch = useDispatch();
    const {BestSellingProducts} = useSelector((state) => state.product);

    useEffect(() => {
        dispatch(fetchBestSellingProducts());
    }, [dispatch]);

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                
                {/* --- HEADER SECTION --- */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 uppercase tracking-wide">
                        Sản phẩm nổi bật
                    </h2>
                    {/* Đường gạch chân trang trí */}
                    <div className="w-24 h-1 bg-red-600 mx-auto mt-3 rounded-full"></div>
                    <p className="text-gray-500 mt-4 text-sm md:text-base max-w-2xl mx-auto">
                        Khám phá những sản phẩm được yêu thích và đánh giá cao nhất từ khách hàng của chúng tôi trong tháng này.
                    </p>
                </div>

                {/* --- PRODUCT GRID --- */}
                {/* Grid: Mobile 2 cột, Tablet 3 cột, Desktop 4 cột */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                    {BestSellingProducts.length > 0 ? (
                        BestSellingProducts.map((product) => (
                            <div key={product.id} className="h-full">
                                <ProductCard 
                                    product={product} 
                                />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-10 text-gray-400">
                            Không có sản phẩm nào để hiển thị.
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default BestSellingProduct;