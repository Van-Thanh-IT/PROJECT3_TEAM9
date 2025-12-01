import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, role }) => {
  const { roles } = useSelector((state) => state.auth); // roles = ["admin", "editor", ...]
  const token = localStorage.getItem("access_token");

  // Chưa đăng nhập
  if (!token) return <Navigate to="/login" replace />;

  // 
  if (role && !roles?.some(r => role.includes(r))) {
    return <h1 className="text-red-600">🚫 Bạn không có quyền truy cập trang này</h1>;
  }

  return children;
};

export default PrivateRoute;
