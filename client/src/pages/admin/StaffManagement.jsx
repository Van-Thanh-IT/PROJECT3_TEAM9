import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStaffs, addStaff, editStaff, modifyUserStatus } from "../../features/user/userThunks";
import CustomTable from "../../components/common/table/CustomTable";
import StaffDetailModal from "../../components/common/modal/StaffDetailModal";
import AddStaffModal from "../../components/common/modal/AddStaffModal";
import EditStaffModal from "../../components/common/modal/EditStaffModal";
import { message } from "antd";

const StaffManagement = () => {
  const dispatch = useDispatch();
  const { staffs, isLoading } = useSelector((state) => state.user);

  const [search, setSearch] = useState(""); // <-- trạng thái tìm kiếm
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  useEffect(() => {
    dispatch(fetchStaffs());
  }, [dispatch]);

  // --- Lọc dữ liệu theo search
  const filteredStaffs = useMemo(() => {
    if (!search.trim()) return staffs;
    const keyword = search.toLowerCase();
    return staffs.filter(
      (staff) =>
        staff.username?.toLowerCase().includes(keyword) ||
        staff.email?.toLowerCase().includes(keyword) ||
        staff.phone?.toLowerCase().includes(keyword) ||
        staff.id?.toString().includes(keyword)
    );
  }, [staffs, search]);

  // --- Handlers ---
  const handleOpenEdit = (staff) => {
    setEditingStaff(staff);
    setShowEditModal(true);
  };

  const handleAddSubmit = async (formData) => {
    try {
      await dispatch(addStaff(formData)).unwrap();
      setShowAddModal(false);
      message.success("Đã thêm nhân viên!");
      dispatch(fetchStaffs());

    } catch (error) {
      console.error("Add failed:", error);
    }
  };

  const handleEditSubmit = async (formData) => {
    try {
      await dispatch(editStaff({ id: editingStaff.id, data: formData })).unwrap();
      setShowEditModal(false);
      setEditingStaff(null);
      message.success("Đã sửa nhân viên!");
      dispatch(fetchStaffs());
    } catch (error) {
      console.error("Lỗi sửa:", error);
    }
  };

  const handleUpdateStatus = async ({ id, status }) => {
    try {
      await dispatch(modifyUserStatus({ id, status })).unwrap();
      dispatch(fetchStaffs());
    } catch (error) {
      console.error("Lỗi sửa:", error);
    }
  };

  // --- Table Configuration ---
  const columns = [
    {
      title: "Avatar",
      dataIndex: "avatar",
      render: (avatar) => (
        <img
          src={avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover border border-gray-200"
        />
      ),
    },
    { title: "Tên nhân viên", dataIndex: "username" },
    { title: "Email", dataIndex: "email" },
    {
      title: "Giới tính",
      dataIndex: "gender",
      render: (gender) => (
        <span className={gender === "male" ? "text-blue-600" : "text-pink-600"}>
          {gender === "male" ? "Nam" : "Nữ"}
        </span>
      ),
    },
    { title: "SĐT", dataIndex: "phone" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => (
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {status === "active" ? "Hoạt động" : "Khóa"}
        </span>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-2">
          <button
            className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm font-medium transition"
            onClick={() => setSelectedStaff(record)}
          >
            Xem
          </button>
          <button
            className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 text-sm font-medium transition"
            onClick={() => handleOpenEdit(record)}
          >
            Sửa
          </button>
          <button
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              record.status === "active"
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-green-50 text-green-600 hover:bg-green-100"
            }`}
            onClick={() =>
              handleUpdateStatus({
                id: record.id,
                status: record.status === "active" ? "banned" : "active",
              })
            }
          >
            {record.status === "active" ? "Khóa" : "Kích hoạt"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">Quản lý nhân viên</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Tìm kiếm tên, email, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1 border rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow transition flex items-center gap-2"
            onClick={() => setShowAddModal(true)}
          >
            <span>+</span> Thêm nhân viên
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <CustomTable
          columns={columns}
          data={filteredStaffs} // <-- dữ liệu đã lọc
          loading={isLoading}
          pagination={{ pageSize: 5, showSizeChanger: true, pageSizeOptions: [5, 10, 20] }}
          scroll={{ x: "max-content" }}
        />
      </div>

      <StaffDetailModal
        show={!!selectedStaff}
        staff={selectedStaff}
        onClose={() => setSelectedStaff(null)}
      />

      <AddStaffModal show={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAddSubmit} />

      <EditStaffModal show={showEditModal} staff={editingStaff} onClose={() => setShowEditModal(false)} onSubmit={handleEditSubmit} />
    </div>
  );
};

export default StaffManagement;
