import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { resetPassword } from "./authSlice"; // thunk
import { toast } from "react-toastify";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Lấy token và email từ URL
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  const email = queryParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ mật khẩu.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu và xác nhận mật khẩu không khớp!");
      return;
    }

    setLoading(true);

    try {
      const res = await dispatch(resetPassword({
        email,
        token,
        password,
        password_confirmation: confirmPassword
      })).unwrap(); // unwrap để lấy payload

      toast.success(res?.message || "Đặt lại mật khẩu thành công!");
      navigate("/login"); // Chuyển về trang login sau khi đổi thành công
    } catch (err) {
      console.error(err);
      toast.error(err || "Đặt lại mật khẩu thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Đặt lại mật khẩu</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <p>Email: <span className="font-medium">{email}</span></p>
        <input
          type="password"
          placeholder="Nhập mật khẩu mới"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Nhập lại mật khẩu mới"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className={`py-2 px-4 rounded font-bold text-white ${loading ? 'bg-gray-400' : 'bg-blue-700 hover:bg-blue-800'}`}
        >
          {loading ? "Đang gửi..." : "Đặt lại"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
