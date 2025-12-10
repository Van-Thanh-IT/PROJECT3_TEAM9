import React, { useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Rate, Avatar, Typography, Card, Image, Empty, Skeleton } from 'antd';
// SỬA DÒNG NÀY: Thay QuoteLeftOutlined bằng CommentOutlined
import { UserOutlined, CommentOutlined } from '@ant-design/icons'; 
import { fetchProductReviewsForHome } from '../productThunks';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const { Title, Text, Paragraph } = Typography;

const ProductReviewsForHome = () => {
    const { ReviewsForHome, status } = useSelector((state) => state.product);
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchProductReviewsForHome());
    }, [dispatch]);


    const { globalRating, totalReviews, allReviews } = useMemo(() => {
        const products = ReviewsForHome || []; 
        
        if (products.length === 0) return { globalRating: 0, totalReviews: 0, allReviews: [] };

        let totalScore = 0;
        let count = 0;
        let collectedReviews = [];

        products.forEach(product => {
            const pCount = Number(product.reviews_count) || 0;
            const pRating = Number(product.reviews_avg_rating) || 0;
            
            if (pCount > 0) {
                totalScore += pRating * pCount;
                count += pCount;
            }

            if (product.reviews_details && Array.isArray(product.reviews_details)) {
                const productReviews = product.reviews_details.map(review => ({
                    ...review,
                    productName: product.name,
                    productImage: product.image,
                    productSlug: product.slug,
                }));
                collectedReviews = [...collectedReviews, ...productReviews];
            }
        });

        const avg = count > 0 ? (totalScore / count).toFixed(1) : 0;

        return {
            globalRating: avg,
            totalReviews: count,
            allReviews: collectedReviews
        };
    }, [ReviewsForHome]);

    if (status === 'loading') {
        return <div className="py-12 container mx-auto"><Skeleton active paragraph={{ rows: 4 }} /></div>;
    }

    if (!allReviews || allReviews.length === 0) {
        return null; 
    }

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                
                <div className="text-center mb-12">
                    <Title level={2} className="mb-4 text-3xl font-bold text-gray-800">
                        Khách hàng nói gì về chúng tôi?
                    </Title>
                    <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center gap-4 bg-gray-50 px-6 py-3 rounded-full border border-gray-100 shadow-sm">
                            <span className="text-5xl font-extrabold text-gray-800 leading-none">{globalRating}</span>
                            <div className="flex flex-col items-start">
                                <Rate disabled allowHalf value={parseFloat(globalRating)} className="text-yellow-400 text-lg" />
                                <Text className="text-gray-500 text-sm mt-1">
                                    Dựa trên <b>{totalReviews}</b> đánh giá xác thực
                                </Text>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-2 md:px-8">
                    <Swiper
                        modules={[Autoplay, Pagination, Navigation]}
                        spaceBetween={24}
                        slidesPerView={1}
                        navigation
                        pagination={{ clickable: true, dynamicBullets: true }}
                        autoplay={{ delay: 4000, disableOnInteraction: false }}
                        breakpoints={{
                            640: { slidesPerView: 1 },
                            768: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                        }}
                        className="pb-14 !px-4"
                    >
                        {allReviews.map((review, index) => (
                            <SwiperSlide key={index} className="h-auto">
                                <Card 
                                    className="h-full rounded-2xl border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300"
                                    bodyStyle={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', height: '100%' }}
                                >
                                    {/* Quote Icon (Đã sửa lại icon) */}
                                    <div className="mb-4">
                                        <CommentOutlined className="text-4xl text-blue-100" />
                                    </div>

                                    <div className="flex-grow mb-6">
                                        <Paragraph 
                                            ellipsis={{ rows: 4, expandable: true, symbol: 'xem thêm' }} 
                                            className="text-gray-600 text-[15px] italic leading-relaxed m-0"
                                        >
                                            "{review.comment}"
                                        </Paragraph>

                                        {review.images && review.images.length > 0 && (
                                            <div className="flex gap-2 mt-4">
                                                {review.images.slice(0, 3).map((img, idx) => (
                                                    <Image 
                                                        key={idx}
                                                        src={img}
                                                        alt="review-img"
                                                        width={50}
                                                        height={50}
                                                        className="rounded-lg object-cover border border-gray-100"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="h-px w-full bg-gray-100 mb-4"></div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar 
                                                src={review.avatar} 
                                                icon={<UserOutlined />} 
                                                size={40} 
                                                className="bg-gray-200"
                                            />
                                            <div>
                                                <div className="font-bold text-gray-800 text-sm">{review.username}</div>
                                                <Rate disabled defaultValue={review.rating} className="text-xs text-yellow-400" />
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 pl-4 border-l border-gray-100 ml-auto max-w-[40%]">
                                            <img 
                                                src={review.productImage} 
                                                alt="product" 
                                                className="w-8 h-8 rounded object-cover"
                                            />
                                            <Text ellipsis className="text-[10px] text-gray-400 block max-w-full">
                                                {review.productName}
                                            </Text>
                                        </div>
                                    </div>
                                </Card>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    );
};

export default ProductReviewsForHome;