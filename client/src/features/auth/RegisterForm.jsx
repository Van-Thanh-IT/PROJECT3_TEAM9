import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { register, reset } from "../auth/authSlice";
import { toast } from "react-toastify";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: "", // Hoặc 'name' tùy backend bạn yêu cầu
    email: "",
    password: "",
    confirmPassword: "",
    phone : "",
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

    // Validate phía Client trước
    if (password !== confirmPassword) {
      toast.error("Mật khẩu nhập lại không khớp!");
      return;
    }

    const userData = {
      username, 
      email,
      password,
      phone
    };

    dispatch(register(userData));
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-form-container">
        <h2>Đăng ký tài khoản</h2>
        <p>Tạo tài khoản để mua sắm giày dễ dàng hơn</p>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Họ và tên</label>
            <input
              type="text"
              name="username"
              value={username}
              onChange={onChange}
              placeholder="Nhập họ tên..."
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="Nhập email..."
              className="form-control"
              required
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
              required
            />
          </div>

          <div className="form-group">
            <label>Nhập lại mật khẩu</label>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              placeholder="Xác nhận mật khẩu..."
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label>Số điện thoại:</label>
            <input
              type="number"
              name="phone"
              value={phone}
              onChange={onChange}
              placeholder="Nhập số điện thoại..."
              className="form-control"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Đang tạo tài khoản..." : "Đăng ký"}
          </button>
        </form>

        <div className="auth-footer">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;