import React from 'react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children, title}) => {
  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* --- LEFT SIDE: IMAGE BANNER (Ẩn trên mobile) --- */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black overflow-hidden">
        {/* Ảnh nền giày - Bạn có thể thay URL này bằng ảnh sản phẩm thật của shop */}
        <img 
          src="https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2070&auto=format&fit=crop" 
          alt="Shoe Banner" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        
        {/* Overlay gradient để chữ nổi bật hơn */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

        {/* Brand content trên ảnh */}
        <div className="relative z-10 w-full flex flex-col justify-between p-12 text-white">
          <Link to="/" className="text-2xl font-bold tracking-tighter uppercase">
            SHOE<span className="text-orange-500">STORE</span>.
          </Link>
          
          <div>
            <h2 className="text-4xl font-extrabold mb-4 leading-tight">
              Bước đi tự tin <br/> Khẳng định phong cách.
            </h2>
            <p className="text-gray-300 text-lg max-w-md">
              Gia nhập cộng đồng Sneakerhead lớn nhất và nhận ngay những ưu đãi độc quyền.
            </p>
          </div>
          
          <div className="text-sm text-gray-400">
            © 2025 ShoeStore Official. All rights reserved.
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: FORM CONTAINER --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12  bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Header Mobile (chỉ hiện khi màn hình nhỏ) */}
          <div className="lg:hidden text-center mb-8">
             <Link to="/" className="text-3xl font-bold tracking-tighter uppercase block mb-2">
                SHOE<span className="text-orange-500">STORE</span>.
             </Link>
          </div>

          <div className="text-center lg:text-left">
            <h1 className=" font-bold text-gray-900">{title}</h1>
          </div>

          {/* Form Content */}
          <div >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;