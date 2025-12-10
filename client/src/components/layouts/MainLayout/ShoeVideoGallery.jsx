import React, { useState } from 'react';
import { Typography, Button, Tag, Card, Avatar } from 'antd';
import { 
    PlayCircleOutlined, 
    ShoppingCartOutlined, 
    EyeOutlined,
    FireOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

// --- 1. MOCK DATA (Dữ liệu giả lập lấy từ API) ---
const VIDEO_DATA = [
    {
        id: 1,
        title: "Trên chân Nike Air Jordan 1 High Chicago - Huyền thoại trở lại",
        videoUrl: "https://www.youtube.com/embed/3D9-yJ4rWXI", // Link Embed Youtube
        views: "15.2K",
        product: {
            id: 101,
            name: "Nike Air Jordan 1 High OG",
            price: 4500000,
            slug: "nike-air-jordan-1-high-og",
            image: "https://secure-images.nike.com/is/image/DotCom/DZ5485_612_A_PREM?$SNKRS_COVER_WD$&align=0,1"
        }
    },
    {
        id: 2,
        title: "Đánh giá chi tiết Adidas Ultraboost 22 - Êm ái đỉnh cao",
        videoUrl: "https://www.youtube.com/embed/rPq5k8s9u4I",
        views: "8.4K",
        product: {
            id: 102,
            name: "Adidas Ultraboost 22",
            price: 3200000,
            slug: "adidas-ultraboost-22",
            image: "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/595080039864455883907722d35817a3_9366/Giay_Ultraboost_22_DJen_GZ0127_01_standard.jpg"
        }
    },
    {
        id: 3,
        title: "Puma LaMelo Ball MB.02 - Đôi giày bóng rổ quốc dân?",
        videoUrl: "https://www.youtube.com/embed/g2gZ3y3q0qU",
        views: "22K",
        product: {
            id: 103,
            name: "Puma MB.02 Rick and Morty",
            price: 3800000,
            slug: "puma-mb-02",
            image: "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/376442/01/sv01/fnd/VNM/fmt/png/Gi%C3%A0y-B%C3%B3ng-R%E1%BB%95-Nam-PUMA-x-RICK-AND-MORTY-MB.02"
        }
    },
    {
        id: 4,
        title: "Unboxing New Balance 550 - Phong cách Vintage",
        videoUrl: "https://www.youtube.com/embed/7r-A8k7wXjM",
        views: "5.1K",
        product: {
            id: 104,
            name: "New Balance 550 White Green",
            price: 2900000,
            slug: "new-balance-550",
            image: "https://nb.scene7.com/is/image/NB/bb550wt1_nb_02_i?$pdpflexf2$&wid=440&hei=440"
        }
    },
    {
        id: 5,
        title: "Chạy bộ cùng Nike Pegasus 40 - Có đáng tiền?",
        videoUrl: "https://www.youtube.com/embed/K1z_Ld5e6kQ",
        views: "12K",
        product: {
            id: 105,
            name: "Nike Air Zoom Pegasus 40",
            price: 3100000,
            slug: "nike-pegasus-40",
            image: "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/89f07297-2337-4d9f-a89c-550937402636/air-zoom-pegasus-40-road-running-shoes-kDwQlM.png"
        }
    },
    {
        id: 6,
        title: "Converse Chuck 70s - Phối đồ sao cho đẹp?",
        videoUrl: "https://www.youtube.com/embed/5T2k9k5g9kE",
        views: "45K",
        product: {
            id: 106,
            name: "Converse Chuck 70 High Top",
            price: 1800000,
            slug: "converse-chuck-70",
            image: "https://www.converse.com.vn/media/catalog/product/cache/207e23213cf636ccdef205098cf3c8a3/0/8/088_162050C_1.jpg"
        }
    }
];

const ShoeVideoGallery = () => {
    const navigate = useNavigate();
    const [hoveredVideo, setHoveredVideo] = useState(null);

    // Format tiền
    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="container mx-auto px-4 max-w-7xl">
                
                {/* --- HEADER --- */}
                <div className="text-center mb-12">
                    <div className="flex justify-center items-center gap-2 mb-2">
                        <PlayCircleOutlined className="text-4xl text-red-600" />
                        <Title level={2} className="m-0 uppercase tracking-wide">Góc Review Giày</Title>
                    </div>
                    <Paragraph className="text-gray-500 max-w-2xl mx-auto text-base">
                        Xem video thực tế, đánh giá chi tiết và trải nghiệm trên chân những mẫu giày hot nhất trước khi bạn quyết định mua.
                    </Paragraph>
                </div>

                {/* --- VIDEO GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {VIDEO_DATA.map((item) => (
                        <div 
                            key={item.id}
                            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 group border border-gray-100 flex flex-col"
                            onMouseEnter={() => setHoveredVideo(item.id)}
                            onMouseLeave={() => setHoveredVideo(null)}
                        >
                            {/* 1. VIDEO PLAYER (ASPECT VIDEO 16:9) */}
                            <div className="relative w-full aspect-video bg-black">
                                <iframe 
                                    className="w-full h-full object-cover"
                                    src={item.videoUrl} 
                                    title={item.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                    allowFullScreen
                                ></iframe>
                            </div>

                            {/* 2. VIDEO INFO */}
                            <div className="p-5 flex flex-col flex-1">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="font-bold text-gray-800 text-lg line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                                        {item.title}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                                    <EyeOutlined /> {item.views} lượt xem
                                    <span>•</span>
                                    <FireOutlined className="text-red-500" /> Xu hướng
                                </div>

                                {/* 3. LINKED PRODUCT (SẢN PHẨM TRONG VIDEO) */}
                                <div className="mt-auto pt-4 border-t border-dashed border-gray-200">
                                    <div className="flex items-center gap-3">
                                        {/* Ảnh nhỏ sản phẩm */}
                                        <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                                            <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                        </div>
                                        
                                        {/* Tên & Giá */}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs text-gray-500 truncate mb-0.5">Sản phẩm trong video:</div>
                                            <div className="font-bold text-gray-800 text-sm truncate">{item.product.name}</div>
                                            <div className="text-red-600 font-bold text-sm">{formatPrice(item.product.price)}</div>
                                        </div>

                                        {/* Nút Mua */}
                                        <Button 
                                            type="primary" 
                                            shape="circle" 
                                            icon={<ShoppingCartOutlined />} 
                                            size="large"
                                            className="bg-black hover:bg-gray-800 border-none shadow-lg flex-shrink-0"
                                            onClick={() => navigate(`/product/${item.product.slug}`)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- LOAD MORE --- */}
                <div className="text-center mt-12">
                    <Button size="large" className="px-8 h-12 rounded-full border-gray-300 text-gray-600 font-medium hover:border-black hover:text-black transition-colors">
                        Xem thêm video khác
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ShoeVideoGallery;