import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearErrors } from "../../../features/admin/userSlice";

const EditStaffModal = ({ show, onClose, onSubmit, staff }) => {
  const dispatch = useDispatch();

  // Lấy lỗi từ Redux
  const { isSubmitting, validationErrors } = useSelector((state) => state.user);

  const initialFormState = {
    username: "",
    email: "",
    password: "", // Mật khẩu để trống (nếu không đổi)
    password_confirmation: "",
    phone: "",
    gender: "male",
    date_of_birth: "",
    avatar: null, // File mới (nếu có)
    role: "staff_sale",
  };

  const [form, setForm] = useState(initialFormState);
  const [previewAvatar, setPreviewAvatar] = useState(null); // State để xem trước ảnh

  // Effect: Đổ dữ liệu nhân viên vào form khi mở modal
  useEffect(() => {
    if (show && staff) {
      setForm({
        username: staff.username || "",
        email: staff.email || "",
        password: "", // Luôn reset password về rỗng
        password_confirmation: "",
        phone: staff.phone || "",
        gender: staff.gender || "male",
        date_of_birth: staff.date_of_birth || "",
        role: staff.role || "staff_sale",
        avatar: null, // Reset input file
      });
      // Set ảnh cũ để hiển thị preview
      setPreviewAvatar(staff.avatar || null);
      
      // Xóa lỗi cũ
      dispatch(clearErrors());
    }
  }, [show, staff, dispatch]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar" && files && files.length > 0) {
      const file = files[0];
      setForm((prev) => ({ ...prev, avatar: file }));
      // Tạo URL preview cho ảnh mới chọn
      setPreviewAvatar(URL.createObjectURL(file));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();

    // 1. QUAN TRỌNG: Laravel yêu cầu gửi POST kèm _method: PUT để upload file khi update
    formData.append("_method", "PUT");

    Object.keys(form).forEach((key) => {
      // 2. Logic Mật khẩu: Nếu rỗng thì KHÔNG gửi lên (nghĩa là không đổi pass)
      if ((key === "password" || key === "password_confirmation") && !form[key]) {
        return;
      }

      // 3. Logic Avatar: Chỉ gửi nếu người dùng chọn file mới (dạng File object)
      const { name, files } = e.target;
     if (name === "avatar" && files && files.length > 0) {
        const file = files[0];
        setForm((prev) => ({ ...prev, avatar: file }));
        setPreviewAvatar(URL.createObjectURL(file)); 
        }


      // Append các dữ liệu khác
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

  const getInputClass = (field) => {
    const base = "w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 transition-colors";
    return validationErrors?.[field]
      ? `${base} border-red-500 focus:ring-red-200 bg-red-50`
      : `${base} border-gray-300 focus:ring-indigo-200`;
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-xl shadow-2xl z-10 max-w-lg w-full p-6 relative overflow-hidden animate-fade-in-up">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-2xl leading-none"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-5 text-gray-800 border-b pb-2">
          Cập nhật nhân viên
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
          
          {/* 1. Username */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Tên nhân viên <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="username"
              required
              maxLength={255}
              className={getInputClass("username")}
              value={form.username}
              onChange={handleChange}
            />
            <ErrorMsg field="username" />
          </div>

          {/* 2. Email (Có thể disabled nếu không cho sửa email) */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              name="email"
              required
              className={getInputClass("email")}
              value={form.email}
              onChange={handleChange}
            />
            <ErrorMsg field="email" />
          </div>

          {/* 3. Password (KHÔNG BẮT BUỘC KHI SỬA) */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Mật khẩu <span className="text-xs text-gray-400">(Bỏ trống nếu không đổi)</span>
              </label>
              <input
                type="password"
                name="password"
                // Bỏ required
                minLength={6}
                placeholder="********"
                className={getInputClass("password")}
                value={form.password}
                onChange={handleChange}
              />
              <ErrorMsg field="password" />
            </div>
            <div className="w-1/2">
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Xác nhận
              </label>
              <input
                type="password"
                name="password_confirmation"
                // Bỏ required
                placeholder="Nhập lại mật khẩu"
                className={getInputClass("password_confirmation")}
                value={form.password_confirmation}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* 4. Phone */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Số điện thoại <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="phone"
              required
              maxLength={15}
              className={getInputClass("phone")}
              value={form.phone}
              onChange={handleChange}
            />
            <ErrorMsg field="phone" />
          </div>

          {/* 5. Date & Gender */}
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
                <option value="other">Khác</option>
              </select>
              <ErrorMsg field="gender" />
            </div>
          </div>

          {/* 6. Role */}
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
            <ErrorMsg field="role" />
          </div>

          {/* 7. Avatar + Preview */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Ảnh đại diện</label>
            
            {/* Hiển thị ảnh preview (ảnh cũ hoặc ảnh mới chọn) */}
            {previewAvatar && (
              <div className="mb-2">
                <img 
                  src={previewAvatar} 
                  alt="Avatar Preview" 
                  className="w-16 h-16 rounded-full object-cover border border-gray-300"
                />
              </div>
            )}

            <input
              type="file"
              name="avatar"
              accept="image/png, image/jpeg, image/jpg"
              className={`w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 ${
                  validationErrors?.avatar ? "border border-red-500 rounded p-1" : ""
              }`}
              onChange={handleChange}
            />
            <ErrorMsg field="avatar" />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2.5 rounded-lg font-medium shadow-md transition-all flex items-center justify-center ${
                isSubmitting 
                ? "bg-indigo-400 cursor-not-allowed text-white" 
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {isSubmitting ? "Đang xử lý..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStaffModal;