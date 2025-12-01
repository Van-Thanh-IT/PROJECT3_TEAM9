import React from 'react';
import { 
  FaFacebookF, FaInstagram, FaTiktok, FaYoutube, 
  FaShippingFast, FaCheckCircle, FaExchangeAlt, FaHeadset 
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="font-sans text-gray-300">
      <div className="bg-red-600 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center justify-center p-2 hover:bg-red-700 transition rounded-lg cursor-pointer">
              <FaCheckCircle className="text-3xl mb-2" />
              <h4 className="font-bold uppercase text-sm">Cam kết chính hãng</h4>
              <p className="text-xs opacity-90">Đền 10 lần nếu Fake</p>
            </div>
            <div className="flex flex-col items-center justify-center p-2 hover:bg-red-700 transition rounded-lg cursor-pointer">
              <FaShippingFast className="text-3xl mb-2" />
              <h4 className="font-bold uppercase text-sm">Giao hàng hỏa tốc</h4>
              <p className="text-xs opacity-90">Freeship đơn từ 500k</p>
            </div>
            <div className="flex flex-col items-center justify-center p-2 hover:bg-red-700 transition rounded-lg cursor-pointer">
              <FaExchangeAlt className="text-3xl mb-2" />
              <h4 className="font-bold uppercase text-sm">Đổi trả dễ dàng</h4>
              <p className="text-xs opacity-90">Đổi size trong 30 ngày</p>
            </div>
            <div className="flex flex-col items-center justify-center p-2 hover:bg-red-700 transition rounded-lg cursor-pointer">
              <FaHeadset className="text-3xl mb-2" />
              <h4 className="font-bold uppercase text-sm">Hỗ trợ 24/7</h4>
              <p className="text-xs opacity-90">Hotline: 1900.xxxx</p>
            </div>
          </div>
        </div>
      </div>

      {/* PHẦN 2: NEWSLETTER & MAIN LINKS */}
      <div className="bg-gray-900 pt-12 pb-8">
        <div className="container mx-auto px-4">
          
          {/* Newsletter Section - Để thu hút khách hàng đăng ký */}
          <div className="border-b border-gray-700 pb-10 mb-10 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <h3 className="text-2xl font-bold text-white uppercase tracking-wider">Đăng ký nhận tin</h3>
              <p className="text-gray-400 mt-2">Nhận ngay voucher <span className="text-red-500 font-bold">100K</span> cho đơn hàng đầu tiên.</p>
            </div>
            <div className="w-full md:w-1/2 flex">
              <input 
                type="email" 
                placeholder="Nhập email của bạn..." 
                className="w-full px-4 py-3 rounded-l-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-red-600"
              />
              <button className="bg-red-600 text-white px-6 py-3 rounded-r-md font-bold uppercase hover:bg-red-700 transition">
                Đăng ký
              </button>
            </div>
          </div>

          {/* Main Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            
            {/* Cột 1: Thông tin liên hệ */}
            <div>
              <h4 className="text-white font-bold text-lg mb-4 uppercase">Về SneakerStore</h4>
              <p className="mb-4 text-sm leading-relaxed">
                Hệ thống bán lẻ giày chính hãng hàng đầu Việt Nam. Chúng tôi mang đến những đôi giày tốt nhất cho đôi chân của bạn.
              </p>
              <ul className="text-sm space-y-2">
                <li><strong className="text-white">Địa chỉ:</strong> 123 Phố Huế, Hà Nội</li>
                <li><strong className="text-white">Email:</strong> support@sneakerstore.vn</li>
                <li><strong className="text-white">Hotline:</strong> 1900 988 xxx</li>
              </ul>
              {/* Social Icons */}
              <div className="flex space-x-4 mt-6">
                <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-blue-600 hover:text-white transition"><FaFacebookF /></a>
                <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-pink-600 hover:text-white transition"><FaInstagram /></a>
                <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-black hover:text-white transition border border-gray-700"><FaTiktok /></a>
                <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-red-600 hover:text-white transition"><FaYoutube /></a>
              </div>
            </div>

            {/* Cột 2: Hỗ trợ khách hàng (Rất quan trọng với giày) */}
            <div>
              <h4 className="text-white font-bold text-lg mb-4 uppercase">Hỗ trợ khách hàng</h4>
              <ul className="text-sm space-y-3">
                <li><a href="#" className="hover:text-red-500 transition">Hướng dẫn chọn size</a></li>
                <li><a href="#" className="hover:text-red-500 transition">Chính sách đổi trả</a></li>
                <li><a href="#" className="hover:text-red-500 transition">Chính sách bảo hành</a></li>
                <li><a href="#" className="hover:text-red-500 transition">Phương thức thanh toán</a></li>
                <li><a href="#" className="hover:text-red-500 transition">Tra cứu đơn hàng</a></li>
              </ul>
            </div>

            {/* Cột 3: Danh mục nổi bật */}
            <div>
              <h4 className="text-white font-bold text-lg mb-4 uppercase">Sản phẩm</h4>
              <ul className="text-sm space-y-3">
                <li><a href="#" className="hover:text-red-500 transition">Nike Air Jordan</a></li>
                <li><a href="#" className="hover:text-red-500 transition">Adidas Yeezy</a></li>
                <li><a href="#" className="hover:text-red-500 transition">MLB Korea</a></li>
                <li><a href="#" className="hover:text-red-500 transition">New Balance</a></li>
                <li><a href="#" className="hover:text-red-500 transition flex items-center">
                  Sale Off <span className="ml-2 bg-red-600 text-white text-[10px] px-1 rounded">HOT</span>
                </a></li>
              </ul>
            </div>

            {/* Cột 4: Fanpage hoặc Map (Ở đây để Logo Brand Payment) */}
            <div>
              <h4 className="text-white font-bold text-lg mb-4 uppercase">Thanh toán & Vận chuyển</h4>
              <div className="grid grid-cols-3 gap-2 mb-6">
                {/* Giả lập các icon payment */}
                <div className="bg-white p-1 rounded h-8 w-12 flex items-center justify-center"><img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" /></div>
                <div className="bg-white p-1 rounded h-8 w-12 flex items-center justify-center"><img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="Paypal" /></div>
                <div className="bg-white p-1 rounded h-8 w-12 flex items-center justify-center"><img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" /></div>
                <div className="bg-white p-1 rounded h-8 w-12 flex items-center justify-center overflow-hidden"><span className="text-xs text-black font-bold">Momo</span></div>
                <div className="bg-white p-1 rounded h-8 w-12 flex items-center justify-center overflow-hidden"><span className="text-xs text-black font-bold">ZaloPay</span></div>
                <div className="bg-white p-1 rounded h-8 w-12 flex items-center justify-center overflow-hidden"><span className="text-xs text-black font-bold">COD</span></div>
              </div>
              
              <h4 className="text-white font-bold text-lg mb-2 uppercase">Chứng nhận</h4>
              <div className="flex gap-2">
                 <img src="http://online.gov.vn/Content/EndUser/LogoCCDVSaleNoti/logoSaleNoti.png" alt="BCT" className="w-32"/>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* PHẦN 3: COPYRIGHT */}
      <div className="bg-black py-4 border-t border-gray-800">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>© 2023 SneakerStore. All rights reserved. MSDN: 0123456789</p>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <a href="#" className="hover:text-white">Điều khoản sử dụng</a>
            <span className="border-r border-gray-700"></span>
            <a href="#" className="hover:text-white">Chính sách bảo mật</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;