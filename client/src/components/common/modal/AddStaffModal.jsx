import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearErrors } from "../../../features/admin/userSlice"; // Đảm bảo đúng đường dẫn

const AddStaffModal = ({ show, onClose, onSubmit }) => {
  const dispatch = useDispatch();

  // Lấy state từ Redux
  const { isSubmitting, validationErrors } = useSelector(
    (state) => state.user // Hoặc state.management tùy store.js
  );

  const initialFormState = {
    username: "",
    email: "",
    password: "",
    password_confirmation: "", // 1. Thêm field này để khớp với validate 'confirmed'
    phone: "",
    gender: "male",
    date_of_birth: "",
    avatar: null,
    role: "staff_sale",
  };

  const [form, setForm] = useState(initialFormState);

  // Reset form và lỗi khi đóng/mở modal
  useEffect(() => {
    if (!show) {
      setForm(initialFormState);
      dispatch(clearErrors());
    }
  }, [show, dispatch]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar" && files && files.length > 0) {
      setForm((prev) => ({ ...prev, avatar: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    // Tự động append tất cả các field trong state (bao gồm password_confirmation)
    Object.keys(form).forEach(key => {
        if (form[key] !== null && form[key] !== "") {
             formData.append(key, form[key]);
        }
    });
    
    onSubmit(formData);
  };

  // Helper hiển thị lỗi
  const ErrorMsg = ({ field }) => {
    if (validationErrors && validationErrors[field]?.[0]) {
      return (
        <p className="text-red-500 text-xs mt-1 italic">
          {validationErrors[field][0]}
        </p>
      );
    }
    return null;
  };

  // Helper class css
  const getInputClass = (field) => {
    const base = "w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 transition-colors";
    // Laravel thường trả lỗi "not match" vào field 'password', nhưng ta cứ check cả 2
    return validationErrors?.[field] 
      ? `${base} border-red-500 focus:ring-red-200 bg-red-50` 
      : `${base} border-gray-300 focus:ring-indigo-200`;
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="bg-white rounded-xl shadow-2xl z-10 max-w-lg w-full p-6 relative overflow-hidden animate-fade-in-up">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-2xl leading-none"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-5 text-gray-800 border-b pb-2">
          Thêm nhân viên mới
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
          
          {/* Username */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Tên nhân viên</label>
            <input
              type="text"
              name="username"
              placeholder="Nhập tên nhân viên"
              className={getInputClass("username")}
              value={form.username}
              onChange={handleChange}
            />
            <ErrorMsg field="username" />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="example@domain.com"
              className={getInputClass("email")}
              value={form.email}
              onChange={handleChange}
            />
            <ErrorMsg field="email" />
          </div>

          {/* Password & Confirm Password Container */}
          <div className="flex gap-4">
            {/* Password */}
            <div className="w-1/2">
                <label className="text-sm font-medium text-gray-700 block mb-1">Mật khẩu</label>
                <input
                type="password"
                name="password"
                placeholder="********"
                className={getInputClass("password")}
                value={form.password}
                onChange={handleChange}
                />
                <ErrorMsg field="password" />
            </div>

            {/* 2. Password Confirmation (Mới) */}
            <div className="w-1/2">
                <label className="text-sm font-medium text-gray-700 block mb-1">Xác nhận mật khẩu</label>
                <input
                type="password"
                name="password_confirmation" // Tên chuẩn của Laravel
                placeholder="Nhập lại mật khẩu"
                className={getInputClass("password_confirmation")}
                value={form.password_confirmation}
                onChange={handleChange}
                />
                {/* Thông thường Laravel trả lỗi "password confirmation does not match" vào field 'password', 
                    nhưng nếu có lỗi riêng cho field này thì vẫn hiện */}
                <ErrorMsg field="password_confirmation" />
            </div>
          </div>

          {/* Phone */}
          <div>
             <label className="text-sm font-medium text-gray-700 block mb-1">Số điện thoại</label>
            <input
              type="text"
              name="phone"
              placeholder="0912..."
              className={getInputClass("phone")}
              value={form.phone}
              onChange={handleChange}
            />
            <ErrorMsg field="phone" />
          </div>

          {/* Date & Gender */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="text-sm font-medium text-gray-700 block mb-1">Ngày sinh</label>
              <input
                type="date"
                name="date_of_birth"
                className={getInputClass("date_of_birth")}
                value={form.date_of_birth}
                onChange={handleChange}
              />
              <ErrorMsg field="date_of_birth" />
            </div>
            <div className="w-1/2">
               <label className="text-sm font-medium text-gray-700 block mb-1">Giới tính</label>
              <select
                name="gender"
                className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-indigo-200"
                value={form.gender}
                onChange={handleChange}
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </div>
          </div>

          {/* Role */}
          <div>
             <label className="text-sm font-medium text-gray-700 block mb-1">Chức vụ</label>
            <select
              name="role"
              className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-indigo-200"
              value={form.role}
              onChange={handleChange}
            >
              <option value="staff_sale">Nhân viên bán hàng</option>
              <option value="staff_customer_support">Nhân viên CSKH</option>
              <option value="staff_warehouse">Nhân viên kho</option>
            </select>
          </div>

          {/* Avatar */}
          <div>
             <label className="text-sm font-medium text-gray-700 block mb-1">Ảnh đại diện</label>
            <input
              type="file"
              name="avatar"
              accept="image/*"
              className={`w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 ${
                  validationErrors?.avatar ? "border border-red-500 rounded p-1" : ""
              }`}
              onChange={handleChange}
            />
            <ErrorMsg field="avatar" />
          </div>

          {/* Buttons */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2.5 rounded-lg font-medium shadow-md transition-all flex items-center justify-center ${
                isSubmitting
                  ? "bg-indigo-400 cursor-not-allowed text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg"
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận thêm"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaffModal;