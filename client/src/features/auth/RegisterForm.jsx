import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { register, reset } from "../auth/authSlice";
import { toast } from "react-toastify";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const { username, email, password, confirmPassword, phone } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess) {
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    }

    dispatch(reset());
  }, [isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Mật khẩu nhập lại không khớp!");
      return;
    }

    const userData = {
      username,
      email,
      password,
      phone,
    };

    dispatch(register(userData));
  };

  // Class chung cho input để tái sử dụng
  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all placeholder-gray-400";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="w-full">
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Hàng 1: Họ tên & SĐT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Họ và tên</label>
            <input
              type="text"
              name="username"
              value={username}
              onChange={onChange}
              placeholder="Nguyễn Văn A"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Số điện thoại</label>
            <input
              type="number"
              name="phone"
              value={phone}
              onChange={onChange}
              placeholder="0912..."
              className={inputClass}
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            placeholder="name@example.com"
            className={inputClass}
            required
          />
        </div>

        {/* Mật khẩu */}
        <div>
          <label className={labelClass}>Mật khẩu</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            placeholder="Tối thiểu 6 ký tự"
            className={inputClass}
            required
          />
        </div>

        {/* Nhập lại mật khẩu */}
        <div>
          <label className={labelClass}>Xác nhận mật khẩu</label>
          <input
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={onChange}
            placeholder="Nhập lại mật khẩu"
            className={inputClass}
            required
          />
        </div>

        {/* Checkbox điều khoản (Optional nhưng làm cho chuyên nghiệp) */}
        <div className="flex items-center">
          <input
            id="terms"
            type="checkbox"
            required
            className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded cursor-pointer"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-900 cursor-pointer">
            Tôi đồng ý với <span className="font-bold underline">Điều khoản dịch vụ</span> & <span className="font-bold underline">Chính sách bảo mật</span>.
          </label>
        </div>

        {/* Button Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang tạo tài khoản...
            </span>
          ) : (
            "Đăng Ký Ngay"
          )}
        </button>
      </form>

      {/* Footer Link */}
      <p className="mt-8 text-center text-sm text-gray-600">
        Bạn đã có tài khoản?{" "}
        <Link
          to="/login"
          className="font-bold text-black hover:text-orange-600 transition-colors underline"
        >
          Đăng nhập tại đây
        </Link>
      </p>
    </div>
  );
};

export default RegisterForm;