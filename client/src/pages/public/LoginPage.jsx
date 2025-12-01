// src/pages/public/LoginPage.jsx
import React from 'react';
import AuthLayout from '../../components/layouts/MainLayout/AuthLayout';
import LoginForm from '../../features/auth/LoginFrom';

const LoginPage = () => {
  // Tại đây bạn có thể set Title cho tab trình duyệt
//   document.title = "Đăng nhập - ShoeStore"; 

  return (
    <AuthLayout title="Đăng nhập tài khoản">
        <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;