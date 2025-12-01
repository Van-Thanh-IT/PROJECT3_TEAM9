// components/HeroBannerSimple.jsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';

// Import CSS
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
// data/bannerSimpleData.js
const bannerSimpleData = [
  {
    id: 1,
    // Ảnh Converse đỏ giống hình bạn gửi
    image: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?q=80&w=1920&auto=format&fit=crop", 
    tag: "Street Style / Phong cách đường phố",
    title: "Cổ Điển & <br/> Thời Thượng",
    description: "Những thiết kế kinh điển không bao giờ lỗi mốt. Định hình phong cách riêng biệt của bạn mỗi ngày.",
  },
  {
    id: 2,
    // Ảnh Nike Jordan (Tone màu tối/Ngầu)
    image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=1920&auto=format&fit=crop",
    tag: "Sporty & Dynamic / Năng động",
    title: "Bứt Phá <br/> Giới Hạn",
    description: "Công nghệ đệm khí tiên tiến giúp bạn chinh phục mọi thử thách. Nhẹ hơn, êm hơn, xa hơn.",
  },
  {
    id: 3,
    // Ảnh Vans (Tone màu Lifestyle)
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1920&auto=format&fit=crop",
    tag: "Casual Wear / Hằng ngày",
    title: "Đơn Giản <br/> Là Đỉnh Cao",
    description: "Sự tinh tế đến từ những điều giản đơn nhất. Phù hợp với mọi outfit, mọi hoàn cảnh.",
  }
];

const HeroBanner = () => {
  return (
    <section className="relative w-full h-[500px] md:h-[500px] bg-gray-900 font-sans overflow-hidden">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect={'fade'}
        speed={1500}
        loop={true}
        autoplay={{
          delay: 5000, 
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        className="mySwiper h-full w-full"
      >
        {bannerSimpleData.map((slide) => (
          <SwiperSlide key={slide.id}>
            {/* --- 1. LỚP ẢNH NỀN --- */}
            <div 
              className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] ease-linear hover:scale-105"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              {/* Lớp phủ Gradient (Rất quan trọng): Giúp chữ trắng nổi bật trên mọi nền ảnh */}
              {/* Gradient từ Đen (trái) -> Trong suốt (phải) */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
            </div>

            {/* --- 2. NỘI DUNG TEXT (Không có nút) --- */}
            <div className="relative h-full container mx-auto px-6 md:px-12 flex flex-col justify-center items-start z-10">
              <div className="max-w-xl space-y-6">
                
                {/* Tag nhỏ phía trên (Giống ảnh mẫu) */}
                <div className="animate-slideUp opacity-0" style={{ animationDelay: '0.1s' }}>
                  <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs md:text-sm font-bold uppercase tracking-widest text-gray-100 border border-white/10">
                    {slide.tag}
                  </span>
                </div>

                {/* Tiêu đề lớn (Giống ảnh mẫu) */}
                <h1 
                  className="text-5xl md:text-7xl font-black text-white leading-tight drop-shadow-lg animate-slideUp opacity-0" 
                  style={{ animationDelay: '0.3s' }}
                  dangerouslySetInnerHTML={{ __html: slide.title }}
                >
                </h1>

                {/* Mô tả */}
                <p 
                  className="text-base md:text-lg text-gray-200 leading-relaxed font-medium max-w-md animate-slideUp opacity-0"
                  style={{ animationDelay: '0.5s' }}
                >
                  {slide.description}
                </p>

                {/* Thanh trang trí nhỏ (Thay thế cho nút) */}
                <div className="w-20 h-1 bg-white rounded-full animate-widthGrow opacity-0" style={{ animationDelay: '0.7s' }}></div>

              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Style riêng cho Animation và Pagination */}
      <style jsx>{`
        /* Animation chữ trượt từ dưới lên */
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp {
          animation: slideUp 1s ease-out forwards;
        }

        /* Animation thanh gạch ngang */
        @keyframes widthGrow {
          from { width: 0; opacity: 0; }
          to { width: 80px; opacity: 1; }
        }
        .animate-widthGrow {
          animation: widthGrow 1s ease-out forwards;
        }

        /* Custom Pagination */
        .swiper-pagination-bullet {
          background: white;
          opacity: 0.4;
          width: 10px; height: 10px;
        }
        .swiper-pagination-bullet-active {
          background: white;
          opacity: 1;
          width: 30px; border-radius: 5px;
          transition: all 0.3s;
        }
      `}</style>
    </section>
  );
};

export default HeroBanner;