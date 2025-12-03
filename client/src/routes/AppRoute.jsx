import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MainLayout from "../components/layouts/MainLayout/MainLayout";
import AdminMainLayout from "../components/layouts/AdminLayout/MainLayout";

// public
import LoginPage from "../pages/public/LoginPage";
import RegisterPage from "../pages/public/RegisterPage";
import HomePage from "../pages/public/HomePage";
import ProductPage from "../pages/public/ProductPage";
import ProfilePage from "../pages/public/ProfilePage";
import ForgotPasswordPage from "../pages/public/ForgotPasswordPage";
import ResetPasswordPage from "../pages/public/ResetPasswordPage";
import ProductDetailPage from "../pages/public/ProductDetailPage";
import CartPage from "../pages/public/CartPage";
import CategoryPage from "../pages/public/CategoryPage";
import SearchPage from "../pages/public/SearchPage";

//admin 
import Dashboard from "../pages/admin/Dashboard";
import UserManagement from "../pages/admin/UserManagement";
import StaffManagement from "../pages/admin/StaffManagement"; 
import ProductManagement from "../pages/admin/ProductManagement";
import SupportManagement from "../pages/admin/SupportManagement";
import InventoryManagement from "../pages/admin/InventoryManagement";
import CategoryManagement from "../pages/admin/CategoryManagement";
import ReportStatisticsManagement from "../pages/admin/Report_StatisticsManagement";

// private
import PrivateRoute from "./PrivateRoute";



const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="/product" element={<ProductPage />} />
                    <Route path="/product/:slug" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage/>}/>
                    <Route path="/category/:slug" element={<CategoryPage/>}/>
                    <Route path="/search" element={<SearchPage/>}/>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/user/profile" element={<PrivateRoute role={["user"]}><ProfilePage /></PrivateRoute>} />
                </Route>

                <Route path="/admin" element={<AdminMainLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="/admin/users" element={<UserManagement />} />
                    <Route path="/admin/staffs" element={<StaffManagement />} />
                    <Route path="/admin/products" element={<ProductManagement />} />
                    <Route path="/admin/support" element={<SupportManagement />} />
                    <Route path="/admin/inventory" element={<InventoryManagement />} />
                    <Route path="/admin/category" element={<CategoryManagement />} />
                    <Route path="/admin/report_statistics" element={<ReportStatisticsManagement />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default AppRoutes;
