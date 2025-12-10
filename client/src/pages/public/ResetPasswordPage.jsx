import React from 'react';
import ResetPassword from '../../features/auth/ResetPassword';
import AuthLayout from '../../components/layouts/MainLayout/AuthLayout';
const ResetPasswordPage = () => {
    React.useEffect(() => {
        document.title = "Đặt lại mật khẩu | ShoeStore";
    }, []);
    return (
        <div>
            <AuthLayout 
                title="Chào mừng trở lại!" 
                subtitle="vui lòng nhập thông tin"
                >
                <ResetPassword/>
            </AuthLayout>
        </div>
    );
}

export default ResetPasswordPage;
