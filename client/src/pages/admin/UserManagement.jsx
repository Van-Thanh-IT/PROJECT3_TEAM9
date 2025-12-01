import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, modifyUserStatus } from "../../features/admin/userSlice";
import CustomTable from "../../components/common/table/CustomTable";

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users, isLoading } = useSelector((state) => state.user);

  const [search, setSearch] = useState(""); // <-- trạng thái tìm kiếm

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // --- Lọc dữ liệu theo search
  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const keyword = search.toLowerCase();
    return users.filter(
      (user) =>
        user.username?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword) ||
        user.phone?.toLowerCase().includes(keyword) ||
        user.id?.toString().includes(keyword)
    );
  }, [users, search]);

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "active" ? "banned" : "active";
    await dispatch(modifyUserStatus({ id: user.id, status: newStatus })).unwrap();
  };

  const columns = [
    { title: "Tên", dataIndex: "username" },
    { title: "Email", dataIndex: "email" },
    { title: "SĐT", dataIndex: "phone" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => (
        <span className={status === "active" ? "text-green-600" : "text-red-600"}>
          {status === "active" ? "Hoạt động" : "Khóa"}
        </span>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <button
          className={`px-3 py-1 rounded ${
            record.status === "active"
              ? "bg-red-50 text-red-600"
              : "bg-green-50 text-green-600"
          }`}
          onClick={() => handleToggleStatus(record)}
        >
          {record.status === "active" ? "Khóa" : "Kích hoạt"}
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Quản lý người dùng</h2>
        <input
          type="text"
          placeholder="Tìm kiếm tên, email, ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1 border rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <CustomTable
          columns={columns}
          data={filteredUsers} // <-- dữ liệu đã lọc
          loading={isLoading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: "max-content" }}
        />
      </div>
    </div>
  );
};

export default UserManagement;
