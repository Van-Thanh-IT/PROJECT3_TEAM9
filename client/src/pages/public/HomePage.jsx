import React from 'react';
import ProductList from '../../features/product/components/ProductList';
import HeroBanner from '../../components/layouts/MainLayout/HeroBanner';
const HomePage = () => {
    return (
        <div>
            <HeroBanner />
            <h1 className='bg-red-600'>Trang chủ</h1>

            <ProductList />
        </div>
    );
}

export default HomePage;
