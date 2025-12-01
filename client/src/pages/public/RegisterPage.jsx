import RegisterForm from "../../features/auth/RegisterForm";
import AuthLayout from "../../components/layouts/MainLayout/AuthLayout"; 

const RegisterPage = () => {
    return (
        <AuthLayout title="Đăng ký">
            <RegisterForm />
        </AuthLayout>
    );
}

export default RegisterPage;
