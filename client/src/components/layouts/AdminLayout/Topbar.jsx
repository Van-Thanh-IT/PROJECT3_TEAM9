import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, getMe } from "../../../features/auth/authSlice";

// Import Ant Design & Icons
import { Input, Badge, Avatar, Dropdown, Space, theme } from "antd";
import { 
  SearchOutlined, 
  BellOutlined, 
  UserOutlined, 
  LogoutOutlined, 
  SettingOutlined 
} from "@ant-design/icons";

const Topbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // Lấy token màu sắc từ Ant Design (để đồng bộ theme)
  const { useToken } = theme;
  const { token } = useToken();

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Menu Dropdown cho User
  const userMenu = {
    items: [
      {
        key: '1',
        label: <span className="font-medium">Hồ sơ cá nhân</span>,
        icon: <UserOutlined />,
        onClick: () => navigate("/admin/profile"), // Ví dụ đường dẫn
      },
      {
        key: '2',
        label: 'Cài đặt hệ thống',
        icon: <SettingOutlined />,
      },
      {
        type: 'divider',
      },
      {
        key: '3',
        label: 'Đăng xuất',
        icon: <LogoutOutlined />,
        danger: true, // Màu đỏ cảnh báo
        onClick: handleLogout,
      },
    ],
  };

  return (
    <header 
      className="sticky top-0 z-50 flex items-center justify-between px-6 h-16 shadow-sm transition-all"
      style={{ 
        backgroundColor: token.colorBgContainer, // Màu trắng theo theme Antd
        borderBottom: `1px solid ${token.colorBorderSecondary}` 
      }}
    >
      {/* --- 1. SEARCH BAR --- */}
      <div className="flex-1 max-w-md">
        <Input 
          size="large" 
          placeholder="Tìm kiếm dữ liệu..." 
          prefix={<SearchOutlined className="text-gray-400" />} 
          bordered={false} 
          className="bg-gray-100 hover:bg-gray-200 focus:bg-white transition-colors rounded-full px-4"
        />
      </div>

      {/* --- 2. RIGHT ACTIONS --- */}
      <div className="flex items-center gap-6">
        
        {/* Notification */}
        <div className="cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors">
          <Badge count={5} size="small" offset={[0, 0]}>
            <BellOutlined style={{ fontSize: '20px', color: '#64748b' }} />
          </Badge>
        </div>

        {/* User Profile Dropdown */}
        <Dropdown menu={userMenu} trigger={['click']} placement="bottomRight">
          <div className="flex items-center gap-3 cursor-pointer p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            {/* Avatar */}
            <Avatar 
              src={user?.avatar} 
              icon={<UserOutlined />} 
              size="large"
              style={{ backgroundColor: '#1890ff' }} // Màu nền nếu không có ảnh
            >
              {user?.username?.charAt(0)?.toUpperCase()}
            </Avatar>

            {/* Info Text (Ẩn trên mobile nếu cần) */}
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-bold text-gray-700 leading-tight">
                {user?.username || "Admin User"}
              </span>
              <span className="text-[11px] text-gray-400 font-medium uppercase">
                {user?.role || "Administrator"}
              </span>
            </div>
          </div>
        </Dropdown>
      </div>
    </header>
  );
};

export default Topbar;