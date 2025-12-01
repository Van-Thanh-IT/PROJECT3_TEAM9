
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import userReducer from '../features/admin/userSlice';
import brandRuducer from '../features/brand/brandSlice';
import categoryReducer from '../features/Category/categorySlice';
import productReducer from '../features/product/productSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        brand: brandRuducer,
        category: categoryReducer,
        product: productReducer
    },
});