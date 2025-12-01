import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login, reset, loginWithGoogle, loginWithFacebook} from "./authSlice"; 
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

  // 1. Lấy state từ Redux Store
  const { user, roles, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  // 2. Lắng nghe thay đổi của State
  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess && user) {
      toast.success("Đăng nhập thành công!");

      if (roles.includes("admin") || roles.includes("staff_sale") || roles.includes("staff__customer_support") || roles.includes("staff_warehouse")) {
        navigate("/admin");
      } else {
        navigate("/user/profile");
      }
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);


  // 3. Xử lý nhập liệu
  const onChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleGoogleLoginSuccess = (credentialResponse) => {
    const token = credentialResponse?.credential;
    if(!token) return toast.error("Đăng nhập Google thất bại!");
    dispatch(loginWithGoogle(token));
  };

  const handleFacebookLoginSuccess = (response) => {
    const token = response?.accessToken;
    if (!token) return toast.error("Đăng nhập Facebook thất bại!");
    dispatch(loginWithFacebook(token)); 
  };

  // 4. Submit Form
  const onSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
        toast.error("Vui lòng nhập đầy đủ thông tin");
        return;
    }
    const userData = { email, password };
    dispatch(login(userData)); 
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-form-container">
        <h2>Đăng nhập</h2>
        <p>Chào mừng bạn trở lại với Shop Giày</p>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="Nhập email..."
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="Nhập mật khẩu..."
              className="form-control"
            />
          </div>

          <div className="form-actions">
             <Link to="/forgot-password">Quên mật khẩu?</Link>
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        {/* Social Login Grid */}
            <div className="grid grid-cols-1 gap-4">
                <div className="w-full flex justify-center [&_div[role=button]]:w-full [&_iframe]:mx-auto">
                    {/* Google Login Container - Căn giữa */}
                    <GoogleLogin
                        onSuccess={handleGoogleLoginSuccess}
                        onError={() => toast.error("Không thể đăng nhập bằng Google!")}
                        width="100%"
                        theme="outline"
                        shape="rectangular"
                        size="large"
                        text="signin_with"
                    />
                </div>
                
                <FacebookLogin
                    appId="2016734672462629"
                    onSuccess={handleFacebookLoginSuccess}
                    onFail={() => toast.error("Không thể đăng nhập bằng Facebook!")}
                    render={({ onClick }) => (
                        <button onClick={onClick} className="w-full flex items-center justify-center px-4 py-2.5 border border-slate-200 rounded-lg shadow-sm bg-[#1877F2] hover:bg-[#166fe5] transition-colors text-white font-medium text-sm gap-3">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            Đăng nhập với Facebook
                        </button>
                    )}
                />
            </div>

        <div className="auth-footer">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;