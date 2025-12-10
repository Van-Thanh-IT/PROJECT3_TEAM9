import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMe } from "../../features/auth/authSlice";

import { 
  Button, Input, Form, 
  Upload, message, DatePicker, Select, Radio,
  Avatar, Spin
} from "antd";
import { 
  UserOutlined, 
  ShoppingOutlined, 
  BellOutlined, 
  KeyOutlined, 
  EditOutlined,
  UploadOutlined,
  CameraOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { updateInfo } from "../../features/user/userThunks";

import OrderHistory from "../../features/order/components/OrderHostory";
import ForgotPassword from "../../features/auth/ForgotPassword";



const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  // State quản lý Tab đang active (mặc định là 'profile' hoặc 'orders')
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  // --- RENDER CONTENT BÊN PHẢI ---
  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <MyProfile user={user} />;
      case "orders":
        return <OrderHistory />; 
      case "forgot-password":
        return <ForgotPassword />;
      case "notification":
        return <Notification />;
      default:
        return <MyProfile user={user} />;
    }
  };

  if (isLoading || !user) return <div className="min-h-screen flex justify-center items-center"><Spin size="large"/></div>;

  return (
    <div className="bg-gray-50 min-h-screen py-8 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* === CỘT TRÁI: SIDEBAR MENU === */}
          <div className="w-full md:w-1/4 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-4 flex items-center gap-3 border-b-2 border-orange-500/10">
               <Avatar size={50} src={user.avatar} icon={<UserOutlined />} className="border" />
               <div className="overflow-hidden">
                  <div className="font-bold text-gray-800 truncate">{user.username}</div>
                  <div className="text-gray-500 text-xs flex items-center gap-1 cursor-pointer hover:text-orange-500" onClick={() => setActiveTab("profile")}>
                     <EditOutlined /> Sửa hồ sơ
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm py-2">
               <MenuItem 
                  icon={<UserOutlined />} 
                  label="Tài khoản của tôi" 
                  isActive={activeTab === "profile"} 
                  onClick={() => setActiveTab("profile")}
               />
               {user.provider === 'local' && (
                   <MenuItem 
                      icon={<KeyOutlined />} 
                      label="Đổi mật khẩu" 
                      isActive={activeTab === "password"} 
                      onClick={() => setActiveTab("password")}
                   />
               )}
               <MenuItem 
                  icon={<ShoppingOutlined />} 
                  label="Đơn mua" 
                  isActive={activeTab === "orders"} 
                  onClick={() => setActiveTab("orders")}
               />
               <MenuItem 
                  icon={<BellOutlined />} 
                  label="Thông báo" 
                  isActive={activeTab === "notification"} 
                  onClick={() => setActiveTab("notification")}
               />
            </div>
          </div>

          {/* === CỘT PHẢI: NỘI DUNG CHÍNH === */}
          <div className="w-full md:w-3/4">
             <div className="bg-white rounded-lg shadow-sm min-h-[500px] p-6 relative">
                {renderContent()}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: MENU ITEM ---
const MenuItem = ({ icon, label, isActive, onClick }) => (
    <div 
        onClick={onClick}
        className={`flex items-center gap-3 px-6 py-3 cursor-pointer transition-colors ${
            isActive ? "text-orange-600 font-medium bg-orange-50" : "text-gray-700 hover:text-orange-600"
        }`}
    >
        <span className="text-lg">{icon}</span>
        <span>{label}</span>
    </div>
);

// --- SUB-COMPONENT: THÔNG TIN CÁ NHÂN (Form Edit) ---
const MyProfile = ({ user }) => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        form.setFieldsValue({
            username: user.username,
            email: user.email,
            phone: user.phone,
            gender: user.gender || "other",
            date_of_birth: user.date_of_birth ? dayjs(user.date_of_birth) : null,
        });
    }, [user, form]);

    const onFinish = async (values) => {
        setLoading(true);
        const formData = new FormData();
        formData.append("_method", "PUT");
        formData.append("username", values.username);
        formData.append("phone", values.phone || "");
        formData.append("gender", values.gender);
        if (values.date_of_birth) formData.append("date_of_birth", values.date_of_birth.format("YYYY-MM-DD"));
        if (fileList.length > 0) formData.append("avatar", fileList[0].originFileObj);

        try {
            await dispatch(updateInfo(formData)).unwrap();
            message.success("Cập nhật thành công!");
            dispatch(getMe());
        } catch (error) {
            console.error(error);
            message.error("Lỗi cập nhật!");
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = ({ fileList: newFileList }) => setFileList(newFileList.slice(-1));

    return (
        <div>
            <div className="border-b pb-4 mb-6">
                <h1 className="text-xl font-medium text-gray-800">Hồ sơ của tôi</h1>
                <p className="text-sm text-gray-500 mt-1">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
            </div>

            <div className="flex flex-col-reverse md:flex-row gap-8">
                {/* Form bên trái */}
                <div className="flex-1 md:pr-12">
                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item name="username" label="Tên hiển thị" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="phone" label="Số điện thoại">
                                <Input />
                            </Form.Item>
                        </div>
                        <Form.Item name="email" label="Email">
                            <Input disabled className="bg-gray-100" />
                        </Form.Item>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item name="gender" label="Giới tính">
                                <Radio.Group>
                                    <Radio value="male">Nam</Radio>
                                    <Radio value="female">Nữ</Radio>
                                    <Radio value="other">Khác</Radio>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item name="date_of_birth" label="Ngày sinh">
                                <DatePicker format="DD/MM/YYYY" className="w-full" />
                            </Form.Item>
                        </div>
                        <Button type="primary" htmlType="submit" loading={loading} className="bg-orange-600 hover:bg-orange-500 h-10 px-8 mt-4">
                            Lưu
                        </Button>
                    </Form>
                </div>

                {/* Avatar bên phải */}
                <div className="w-full md:w-1/3 flex flex-col items-center justify-start border-l pl-8 pt-4">
                    <div className="relative group cursor-pointer overflow-hidden rounded-full w-28 h-28 mb-4 border border-gray-200">
                        <img 
                            src={fileList.length > 0 ? URL.createObjectURL(fileList[0].originFileObj) : (user?.avatar || "https://via.placeholder.com/150")} 
                            alt="avatar" 
                            className="w-full h-full object-cover"
                        />
                        {/* Overlay khi hover */}
                        <div className="absolute inset-0 bg-black/30 hidden group-hover:flex items-center justify-center text-white text-xs">
                            Sửa ảnh
                        </div>
                    </div>
                    <Upload listType="picture" fileList={fileList} onChange={handleUpload} beforeUpload={() => false} showUploadList={false} accept="image/*">
                        <Button icon={<CameraOutlined />}>Chọn ảnh</Button>
                    </Upload>
                    <div className="text-gray-400 text-xs mt-3 text-center">
                        Dụng lượng file tối đa 1 MB<br/>Định dạng: .JPEG, .PNG
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: THÔNG BÁO (Placeholder) ---
const Notification = () => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <BellOutlined className="text-4xl mb-4" />
        <p>Chưa có thông báo mới.</p>
    </div>
);

export default ProfilePage;