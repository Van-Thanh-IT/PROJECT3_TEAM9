import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMe } from "../../features/auth/authSlice";
import { Link } from "react-router-dom";

function ProfilePage() {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  if (isLoading) return <div className="p-4">Đang tải...</div>;

  if (!user) return <div className="p-4">Không có dữ liệu tài khoản!</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold mb-6">Thông tin cá nhân</h2>

      <div className="bg-white shadow rounded-xl p-6">

        {/* Avatar + Tên */}
        <div className="flex items-center gap-5 mb-6">
          <img
            src={user.avatar}
            alt="avatar"
            className="w-24 h-24 rounded-full border object-cover"
          />
          <div>
            <h3 className="text-xl font-semibold">{user.username}</h3>
            <p className="text-gray-500">{user.email}</p>
            <span className="text-sm px-3 py-1 rounded-lg bg-green-100 text-green-700 mt-1 inline-block">
              Đăng nhập bằng: {user.provider}
            </span>
          </div>
        </div>

        {/* Grid thông tin */}
        <div className="grid grid-cols-2 gap-5">

          <div>
            <label className="text-gray-400 text-sm">Số điện thoại</label>
            <p className="text-gray-800 font-medium">
              {user.phone || "Chưa cập nhật"}
            </p>
          </div>

          <div>
            <label className="text-gray-400 text-sm">Giới tính</label>
            <p className="text-gray-800 font-medium">
              {user.gender === "male"
                ? "Nam"
                : user.gender === "female"
                ? "Nữ"
                : "Khác"}
            </p>
          </div>

          <div>
            <label className="text-gray-400 text-sm">Ngày sinh</label>
            <p className="text-gray-800 font-medium">
              {user.date_of_birth || "Chưa cập nhật"}
            </p>
          </div>

          <div>
            <label className="text-gray-400 text-sm">Trạng thái</label>
            <p
              className={`font-medium ${
                user.status === "active" ? "text-green-600" : "text-red-500"
              }`}
            >
              {user.status === "active" ? "Hoạt động" : "Bị khóa"}
            </p>
          </div>

          <div>
            <label className="text-gray-400 text-sm">Ngày tạo tài khoản</label>
            <p className="text-gray-800 font-medium">
              {new Date(user.created_at).toLocaleDateString("vi-VN")}
            </p>
          </div>

          <div>
            <label className="text-gray-400 text-sm">Cập nhật gần nhất</label>
            <p className="text-gray-800 font-medium">
              {new Date(user.updated_at).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>

        {/* Nút chức năng */}
        <div className="mt-6 flex gap-4">
          <Link
            to="/profile/edit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Cập nhật thông tin
          </Link>

          {/* Không cho đổi mật khẩu nếu provider = google/facebook */}
          {user.provider === "local" && (
            <Link
              to="/profile/change-password"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
            >
              Đổi mật khẩu
            </Link>
          )}

          <Link
            to="/profile/orders"
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
          >
            Lịch sử đơn hàng
          </Link>

          <Link
            to="/profile/reviews"
            className="px-4 py-2 bg-orange-600 text-white rounded-lg"
          >
            Đánh giá của tôi
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
