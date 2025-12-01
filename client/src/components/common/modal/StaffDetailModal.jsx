import React from "react";

const StaffDetailModal = ({ show, staff, onClose }) => {
  if (!show) return null; // Không render modal nếu show = false

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="bg-white rounded-lg shadow-lg z-10 max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Thông tin nhân viên</h2>
          <button
            className="text-gray-500 hover:text-gray-800"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        {staff && (
          <div className="space-y-2">
            <div className="flex justify-center mb-4">
              <img
                src={staff.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                alt="avatar"
                className="w-20 h-20 rounded-full object-cover"
              />
            </div>
            <p><strong>Tên:</strong> {staff.username}</p>
            <p><strong>Email:</strong> {staff.email}</p>
            <p><strong>Giới tính:</strong> {staff.gender === "male" ? "Nam" : "Nữ"}</p>
            <p><strong>SĐT:</strong> {staff.phone}</p>
            <p><strong>Trạng thái:</strong> {staff.status === "active" ? "Hoạt động" : "Khóa"}</p>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffDetailModal;
