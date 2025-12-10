import React from 'react';
import AuthLayout from '../../components/layouts/MainLayout/AuthLayout'; // Đảm bảo đường dẫn đúng
import LoginForm from '../../features/auth/LoginFrom';

const LoginPage = () => {
  // Set title cho tab trình duyệt (Optional)
  React.useEffect(() => {
    document.title = "Đăng nhập | ShoeStore";
  }, []);

  return (
    <AuthLayout 
      title="Chào mừng trở lại!" 
    >
        <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;