import React, { useRef } from 'react';
import ProductList from '../../features/product/components/ProductList';
import HeroBanner from '../../components/layouts/MainLayout/HeroBanner';

const HomePage = () => {

    return (
        <div>
            <HeroBanner />
            <section id='product' className="mt-10">
                <ProductList />
            </section>
        </div>
    );
}

export default HomePage;
