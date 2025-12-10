import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login, reset, loginWithGoogle, loginWithFacebook } from "./authSlice";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import FacebookLogin from "@greatsumini/react-facebook-login";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, roles, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess && user) {
      toast.success("Đăng nhập thành công!");
      if (
        roles.includes("admin") ||
        roles.includes("staff_sale") ||
        roles.includes("staff__customer_support") ||
        roles.includes("staff_warehouse")
      ) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch, roles]);

  const onChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleGoogleLoginSuccess = (credentialResponse) => {
    const token = credentialResponse?.credential;
    if (!token) return toast.error("Đăng nhập Google thất bại!");
    dispatch(loginWithGoogle(token));
  };

  const handleFacebookLoginSuccess = (response) => {
    const token = response?.accessToken;
    if (!token) return toast.error("Đăng nhập Facebook thất bại!");
    dispatch(loginWithFacebook(token));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    dispatch(login({ email, password }));
  };

  return (
    <>
      {/* --- FORM LOGIN --- */}
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            placeholder="name@example.com"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Mật khẩu
            </label>
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-orange-600 hover:text-orange-500"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang xử lý...
            </span>
          ) : (
            "Đăng nhập"
          )}
        </button>
      </form>

      {/* --- DIVIDER --- */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Hoặc đăng nhập với</span>
        </div>
      </div>

      {/* --- SOCIAL BUTTONS --- */}
      <div className="grid grid-cols-1 gap-3">
        {/* Google wrapper để full width */}
        <div className="w-full flex justify-center [&>div]:w-full">
            <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={() => toast.error("Lỗi Google Login")}
                theme="outline"
                size="large"
                width="100%" 
                text="continue_with"
                shape="rectangular"
            />
        </div>

        <FacebookLogin
          appId="2016734672462629"
          onSuccess={handleFacebookLoginSuccess}
          onFail={() => toast.error("Lỗi Facebook Login")}
          render={({ onClick }) => (
            <button
              onClick={onClick}
              className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm bg-[#1877F2] hover:bg-[#166fe5] transition-colors text-white font-medium text-sm gap-3"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Tiếp tục với Facebook
            </button>
          )}
        />
      </div>

      {/* --- FOOTER LINK --- */}
      <p className="mt-8 text-center text-sm text-gray-600">
        Chưa có tài khoản?{" "}
        <Link
          to="/register"
          className="font-semibold text-black hover:text-orange-600 transition-colors"
        >
          Đăng ký miễn phí
        </Link>
      </p>
    </>
  );
};

export default LoginForm;