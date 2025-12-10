import React from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Button, Statistic } from "antd";
import { 
  TrophyOutlined, 
  SyncOutlined, 
  CarOutlined, 
  CheckCircleFilled,
  ArrowRightOutlined
} from "@ant-design/icons";

// --- ẢNH DEMO CHỦ ĐỀ GIÀY ---
const HERO_IMAGE = "https://images.unsplash.com/photo-1556906781-9a412961d28c?q=80&w=2070&auto=format&fit=crop"; // Ảnh kệ giày sneaker
const STORY_IMAGE = "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012&auto=format&fit=crop"; // Ảnh cột dây giày

const AboutPage = () => {
  return (
    <div className="bg-white min-h-screen font-sans">
      
      {/* --- 1. HERO SECTION: STEP INTO STYLE --- */}
      <div className="relative h-[500px] w-full overflow-hidden">
        <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
            style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-start text-white">
            <h4 className="text-blue-400 font-bold uppercase tracking-[0.2em] mb-2 animate-fade-in">Since 2023</h4>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight animate-fade-in-up">
                Nâng tầm <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Bước Chân Việt</span>
            </h1>
            <p className="text-lg md:text-xl max-w-xl text-gray-300 mb-8 font-light">
                Một đôi giày tốt sẽ đưa bạn đến những nơi tuyệt vời. Tại MyShop, chúng tôi cung cấp những mẫu Sneaker & Giày da dẫn đầu xu hướng.
            </p>
            <Link to="/products">
                <Button type="primary" size="large" shape="round" icon={<ArrowRightOutlined />} className="h-14 px-10 text-lg font-bold bg-white text-black hover:!bg-blue-600 hover:!text-white border-none transition-all">
                    Săn giày ngay
                </Button>
            </Link>
        </div>
      </div>

      {/* --- 2. CÂU CHUYỆN: PASSION FOR SHOES --- */}
      <section className="py-20">
        <div className="container mx-auto px-4">
            <Row gutter={[64, 48]} align="middle">
                <Col xs={24} md={12} className="order-2 md:order-1">
                    <h4 className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-3">Câu chuyện thương hiệu</h4>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                        Không chỉ là Giày,<br/>Đó là Phong Cách Sống
                    </h2>
                    <p className="text-gray-600 text-lg mb-4 leading-relaxed">
                        Khởi đầu từ một cửa hàng nhỏ đam mê Sneaker, MyShop hiểu rằng mỗi đôi giày không chỉ để đi, mà còn thể hiện cá tính của người mang.
                    </p>
                    <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                        Chúng tôi tuyển chọn kỹ lưỡng từng đường kim mũi chỉ, chất liệu da, đế cao su để đảm bảo sự êm ái tối đa cho cả ngày dài hoạt động. Dù bạn đi làm, đi chơi hay tập thể thao, MyShop luôn có đôi giày phù hợp.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                        {['Form chuẩn, tôn dáng', 'Đế êm, chống trơn trượt', 'Đổi size trong 7 ngày', 'Fullbox, Tag, Giấy gói'].map((item, index) => (
                            <div key={index} className="flex items-center gap-3 text-gray-800 font-semibold bg-gray-50 p-2 rounded-lg">
                                <CheckCircleFilled className="text-blue-500 text-xl" /> {item}
                            </div>
                        ))}
                    </div>
                </Col>
                <Col xs={24} md={12} className="order-1 md:order-2">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-blue-600 rounded-2xl transform rotate-3 transition-transform group-hover:rotate-6"></div>
                        <img 
                            src={STORY_IMAGE} 
                            alt="Shoe Craftsmanship" 
                            className="rounded-2xl shadow-2xl w-full h-[500px] object-cover relative z-10 transform transition-transform group-hover:-translate-y-2"
                        />
                    </div>
                </Col>
            </Row>
        </div>
      </section>

      {/* --- 3. GIÁ TRỊ CỐT LÕI (ICONS CHO GIÀY) --- */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Cam kết từ MyShop</h2>
                <p className="text-gray-500">Chúng tôi giải quyết mọi nỗi lo khi mua giày Online của bạn.</p>
            </div>
            
            <Row gutter={[32, 32]}>
                <Col xs={24} md={8}>
                    <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 text-center py-10 rounded-2xl">
                        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 text-blue-600">
                            <TrophyOutlined style={{ fontSize: 40 }} />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-800">Chất Lượng Premium</h3>
                        <p className="text-gray-500 px-4">Cam kết chất liệu cao cấp, bền bỉ theo thời gian. Bảo hành keo dán trọn đời sản phẩm.</p>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 text-center py-10 rounded-2xl">
                        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 text-green-600">
                            <SyncOutlined style={{ fontSize: 40 }} />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-800">Đổi Size Dễ Dàng</h3>
                        <p className="text-gray-500 px-4">Mua Online sợ không vừa? Đừng lo, chúng tôi hỗ trợ đổi size tận nhà nhanh chóng.</p>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 text-center py-10 rounded-2xl">
                        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-50 text-purple-600">
                            <CarOutlined style={{ fontSize: 40 }} />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-800">Ship Hỏa Tốc</h3>
                        <p className="text-gray-500 px-4">Nhận giày ngay trong 2h (Nội thành) và 2-3 ngày toàn quốc. Cho phép kiểm tra hàng.</p>
                    </Card>
                </Col>
            </Row>
        </div>
      </section>

      {/* --- 4. THỐNG KÊ ẤN TƯỢNG --- */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gray-900"></div>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(#4a5568 1px, transparent 1px)", backgroundSize: "32px 32px"}}></div>
        
        <div className="container relative z-10 mx-auto px-4">
             <Row gutter={[32, 32]} justify="center">
                <Col xs={12} md={6} className="text-center">
                    <Statistic title={<span className="text-gray-400 font-medium text-sm uppercase">Đôi giày đã bán</span>} value={15000} suffix="+" valueStyle={{ color: '#60a5fa', fontSize: '3rem', fontWeight: '800' }} />
                </Col>
                <Col xs={12} md={6} className="text-center">
                    <Statistic title={<span className="text-gray-400 font-medium text-sm uppercase">Mẫu mã đa dạng</span>} value={500} suffix="+" valueStyle={{ color: '#60a5fa', fontSize: '3rem', fontWeight: '800' }} />
                </Col>
                <Col xs={12} md={6} className="text-center">
                    <Statistic title={<span className="text-gray-400 font-medium text-sm uppercase">Khách hàng hài lòng</span>} value={99} suffix="%" valueStyle={{ color: '#60a5fa', fontSize: '3rem', fontWeight: '800' }} />
                </Col>
             </Row>
        </div>
      </section>

      {/* --- 5. CTA: BỘ SƯU TẬP MỚI --- */}
      <section className="py-24 bg-white text-center">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 uppercase tracking-tighter">
                Ready to Run?
            </h2>
            <p className="text-gray-500 mb-10 max-w-xl mx-auto text-lg">
                Khám phá bộ sưu tập Sneaker mới nhất mùa này. Êm ái, thoáng khí và đậm chất thời trang.
            </p>
            <div className="flex justify-center gap-4">
                <Link to="/product">
                    <Button type="primary" size="large" className="h-14 px-10 rounded-full bg-black hover:bg-gray-800 border-none font-bold text-lg shadow-xl shadow-gray-200">
                        Xem Bộ Sưu Tập Mới
                    </Button>
                </Link>
            </div>
      </section>
    </div>
  );
};

export default AboutPage;