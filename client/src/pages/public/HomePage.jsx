import React, { useRef } from 'react';
import ShoeVideoGallery from '../../components/layouts/MainLayout/ShoeVideoGallery';
import ProductList from '../../features/product/components/ProductList';
import HeroBanner from '../../components/layouts/MainLayout/HeroBanner';
import ProductReviewsForHome from '../../features/product/components/ProductReviewsForHome';
import BestSellingProduct from '../../features/product/components/BestSellingProduct';
const HomePage = () => {

    return (
        <div>
            <HeroBanner />
           <section id='product-top' className="mt-10">
                <BestSellingProduct/>
           </section>

            <section id='product' className="mt-10">
                <ProductList />
            </section>

            <section id='reviews' className="mt-10">
                <ProductReviewsForHome />
            </section>

            <section>
                <ShoeVideoGallery />
            </section>
        </div>
    );
}

export default HomePage;
