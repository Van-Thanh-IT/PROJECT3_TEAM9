import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  UserGroupIcon,
  UsersIcon,
  // BuildingStorefrontIcon, // Chưa dùng
  // FolderIcon, // Chưa dùng
  CubeIcon,
  // Cog6ToothIcon, // Chưa dùng
  ArrowLeftOnRectangleIcon,
  ChartBarIcon,
  LifebuoyIcon, // Icon cho Hỗ trợ
  ArchiveBoxIcon // Icon cho Kho
} from "@heroicons/react/24/outline";
import { useSelector, useDispatch } from "react-redux";

const Sidebar = () => {
  const location = useLocation();
  // Lấy roles từ Redux (Giả sử roles là một mảng: ['admin'] hoặc ['staff_sale'])
  const { roles } = useSelector(state => state.auth);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    { 
      name: "Trang chủ", 
      path: "/admin", 
      icon: HomeIcon, 
      // Trang chủ thì ai đăng nhập vào cũng thấy
      allowedRoles: ['admin', 'staff_sale', 'staff_customer_support', 'staff_warehouse'] 
    },
    { 
      name: "Quản lý nhân viên", 
      path: "/admin/staffs", 
      icon: UserGroupIcon, 
      allowedRoles: ['admin'] // Chỉ admin
    },
    { 
      name: "Quản lý người dùng", 
      path: "/admin/users", 
      icon: UsersIcon, 
      allowedRoles: ['admin'] // Chỉ admin
    },
   
    { 
      name: "Quản lý danh mục", 
      path: "/admin/category", 
      icon: CubeIcon, 
      allowedRoles: ['admin', 'staff_sale'] 
    },
    { 
      name: "Quản lý sản phẩm", 
      path: "/admin/products", 
      icon: CubeIcon, 
      allowedRoles: ['admin', 'staff_sale'] // Admin và Sale
    },
    { 
      name: "Quản lý voucher", 
      path: "/admin/vouchers", 
      icon: CubeIcon, 
      allowedRoles: ['admin', 'staff_sale'] // Admin và Sale
    },
    {
      name: "Quản lý đơn hàng", 
      path: "/admin/orders", 
      icon: CubeIcon, 
      allowedRoles: ['admin', 'staff_sale'] // Admin và Sale
    },
    { 
      name: "Quản lý Kho hàng", 
      path: "/admin/inventory", 
      icon: ArchiveBoxIcon, // Đổi icon cho hợp
      allowedRoles: ['admin', 'staff_warehouse'] // Admin và Kho
    },
    { 
      name: "Hỗ trợ & CSKH", 
      path: "/admin/support", 
      icon: LifebuoyIcon, 
      allowedRoles: ['admin', 'staff_customer_support'] 
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    // Nếu item không yêu cầu role cụ thể (allowedRoles undefined) thì cho hiện luôn
    if (!item.allowedRoles) return true;

    // Kiểm tra xem user hiện tại có role nào khớp với allowedRoles không
    // roles || [] để tránh lỗi nếu state chưa load kịp
    return item.allowedRoles.some(role => (roles || []).includes(role));
  });

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-50 transition-all duration-300">
      
      {/* 1. LOGO AREA */}
      <div className="h-20 flex items-center justify-center border-b border-slate-800/50">
        <Link to="/admin" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
            <ChartBarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide leading-tight">Admin</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Dashboard</p>
          </div>
        </Link>
      </div>

      {/* 2. MENU ITEMS - Render danh sách ĐÃ LỌC */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 custom-scrollbar">
        <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Menu chính</p>
        
        {/* Sử dụng filteredMenuItems thay vì menuItems */}
        {filteredMenuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium text-sm ${
                active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "hover:bg-slate-800 hover:text-white text-slate-400"
              }`}
            >
              <item.icon
                className={`w-5 h-5 transition-colors ${
                  active ? "text-white" : "text-slate-500 group-hover:text-white"
                }`}
              />
              <span>{item.name}</span>
              
              {active && (
                <span className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full shadow-sm animate-pulse"></span>
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;