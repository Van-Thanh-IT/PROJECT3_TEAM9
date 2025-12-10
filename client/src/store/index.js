
import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from '../features/Dashboard/dashboardSlice';
import authReducer from '../features/auth/authSlice';
import userReducer from '../features/user/userSlice';
import brandRuducer from '../features/brand/brandSlice';
import categoryReducer from '../features/Category/categorySlice';
import productReducer from '../features/product/productSlice';
import cartReducer from "../features/cart/cartSlice";
import goshipReducer from '../features/checkout/goshipSlice';
import orderReducer from '../features/order/orderSlice';
import voucherReducer from '../features/voucher/voucherSlice';
import inventotyReducer from '../features/inventory/inventorySlice';
import supportReducer from "../features/support/supportTicketSlice";
export const store = configureStore({
    reducer: {
        dashboard: dashboardReducer,
        auth: authReducer,
        user: userReducer,
        brand: brandRuducer,
        category: categoryReducer,
        product: productReducer,
        cart: cartReducer,
        goship: goshipReducer,
        order: orderReducer,
        voucher: voucherReducer,
        inventory: inventotyReducer,
        support: supportReducer
    },
});