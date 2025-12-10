import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { forgotPassword } from './authSlice';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false); // Trạng thái đã gửi thành công

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Vui lòng nhập địa chỉ email của bạn.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await dispatch(forgotPassword(email)).unwrap();
      
      // Thành công
      toast.success(res.message || "Đã gửi email khôi phục!");
      setIsSent(true);
      setEmail(''); 
    } catch (err) {
      console.error(err);
      // Xử lý hiển thị lỗi từ backend (thường là lỗi validation hoặc 404)
      const errorMsg = err?.response?.data?.errors?.email?.[0] || 
                       (typeof err === 'string' ? err : "Không tìm thấy email này trong hệ thống.");
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // UI khi đã gửi email thành công
  if (isSent) {
    return (
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Đã gửi hướng dẫn!</h3>
        <p className="text-gray-600 mb-6">
            Vui lòng kiểm tra email của bạn để đặt lại mật khẩu. Nếu không thấy, hãy kiểm tra mục Spam.
        </p>
        <button 
            onClick={() => setIsSent(false)}
            className="text-sm font-bold text-black hover:underline"
        >
            Thử lại với email khác
        </button>
        <div className="mt-8 border-t pt-4">
            <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-black flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Quay lại đăng nhập
            </Link>
        </div>
      </div>
    );
  }

  // UI Form nhập liệu
  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email đăng ký
          </label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all placeholder-gray-400"
          />
          <p className="mt-2 text-xs text-gray-500">
            Chúng tôi sẽ gửi một liên kết bảo mật đến email này để bạn đặt lại mật khẩu.
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
             <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang gửi...
            </span>
          ) : (
            "Gửi yêu cầu"
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <Link 
            to="/login" 
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-black transition-colors"
        >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại trang đăng nhập
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;