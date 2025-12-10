import React from 'react';
import ForgotPassword from '../../features/auth/ForgotPassword';
import AuthLayout from '../../components/layouts/MainLayout/AuthLayout';

const ForgotPasswordPage = () => {
    React.useEffect(() => {
        document.title = "Quên mật khẩu | ShoeStore";
    })
    return (
        <div>
            <AuthLayout title="Quên mật khẩu">
                <ForgotPassword />
            </AuthLayout>
        </div>
    );
}

export default ForgotPasswordPage;
