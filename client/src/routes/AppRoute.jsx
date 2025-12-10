import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MainLayout from "../components/layouts/MainLayout/MainLayout";
import AdminMainLayout from "../components/layouts/AdminLayout/MainLayout";

// public
import LoginPage from "../pages/public/LoginPage";
import RegisterPage from "../pages/public/RegisterPage";
import HomePage from "../pages/public/HomePage";
import ProductPage from "../pages/public/ProductPage";
import AboutPage from "../pages/public/AboutPage";
import ProfilePage from "../pages/public/ProfilePage";
import ForgotPasswordPage from "../pages/public/ForgotPasswordPage";
import ResetPasswordPage from "../pages/public/ResetPasswordPage";
import ProductDetailPage from "../pages/public/ProductDetailPage";
import CartPage from "../pages/public/CartPage";
import CategoryPage from "../pages/public/CategoryPage";
import SearchPage from "../pages/public/SearchPage";
import CheckoutPage from "../pages/public/CheckoutPage";
import OrderSuccessPage from "../pages/public/OrderSuccessPage";
import OrderHistoryPage from "../pages/public/OrderHistoryPage";
import OrderDetailPage from "../pages/public/OrderDetailPage";


//admin 
import DashboardPage from "../pages/admin/DashboardPage";
import UserManagement from "../pages/admin/UserManagement";
import StaffManagement from "../pages/admin/StaffManagement"; 
import ProductManagement from "../pages/admin/ProductManagement";
import VoucherManagement from "../pages/admin/VoucherManagement";
import OrderManagement from "../pages/admin/OrderManagement";
import SupportManagement from "../pages/admin/SupportManagement";
import InventoryManagement from "../pages/admin/InventoryManagement";
import CategoryManagement from "../pages/admin/CategoryManagement";
import InventoryHistoryPage from "../pages/admin/InvenHistoryPage";
import InventoryDetailPage from "../pages/admin/InventoryDetailPage";
// private
import PrivateRoute from "./PrivateRoute";


import UserSupportPage from "../pages/public/UserSupportPage";
const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="/product" element={<ProductPage />} />
                    <Route path="/product/:slug" element={<ProductDetailPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/cart" element={<CartPage/>}/>
                    <Route path="/category/:slug" element={<CategoryPage/>}/>
                    <Route path="/search" element={<SearchPage/>}/>
                    <Route path="/checkout" element={<CheckoutPage/>}/>
                    <Route path="/order-success" element={<OrderSuccessPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/user/profile" element={<PrivateRoute role={["user"]}><ProfilePage /></PrivateRoute>} />
                    <Route path="/profile/orders" element={<PrivateRoute role={["user"]}><OrderHistoryPage/></PrivateRoute>} />
                    <Route path="/user/orders/:id" element={<PrivateRoute role={["user"]}><OrderDetailPage /></PrivateRoute>} />
                    <Route path="/user/support" element={<UserSupportPage/>} />
                </Route>

                <Route path="/admin" element={<AdminMainLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="/admin/users" element={<UserManagement />} />
                    <Route path="/admin/staffs" element={<StaffManagement />} />
                    <Route path="/admin/products" element={<ProductManagement />} />
                    <Route path="/admin/vouchers" element={<VoucherManagement />} />
                    <Route path="/admin/orders" element={<OrderManagement />} />
                    <Route path="/admin/support" element={<SupportManagement />} />
                    <Route path="/admin/inventory" element={<InventoryManagement />} />
                    <Route path="inventory/history/:variantId" element={<InventoryHistoryPage/>} />
                    <Route path="inventory/detail/:id" element={<InventoryDetailPage/>} />
                    <Route path="/admin/category" element={<CategoryManagement />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default AppRoutes;
