import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { resetPassword } from "./authSlice";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);

    try {
      const res = await dispatch(
        resetPassword({
          email,
          token,
          password,
          password_confirmation: confirmPassword,
        })
      ).unwrap();

      toast.success(res?.message || "Đặt lại mật khẩu thành công!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error(typeof err === 'string' ? err : "Đặt lại mật khẩu thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all";

  return (
    <div className="w-full">
        {/* Thông báo Email đang reset */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <div className="p-2 bg-white rounded-full border border-gray-100 shadow-sm">
                <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            </div>
            <div>
                <p className="text-sm text-gray-500">Đang đặt lại mật khẩu cho tài khoản:</p>
                <p className="font-bold text-gray-800 break-all">{email || "Không xác định"}</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    required
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nhập lại mật khẩu</label>
                <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-lg font-bold text-white shadow-lg bg-black hover:bg-gray-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? "Đang xử lý..." : "Xác nhận đổi mật khẩu"}
            </button>
        </form>

        <div className="mt-6 text-center">
             <Link to="/login" className="text-sm text-gray-500 hover:text-black transition-colors flex items-center justify-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Quay lại đăng nhập
             </Link>
        </div>
    </div>
  );
};

export default ResetPassword;