import { createSlice, isPending, isRejected } from "@reduxjs/toolkit";
import { 
    fetchCategories,
    fetchCategoryById,
    createCategory,
    updateCategory,
    toggleCategoryStatus
 } from "./categoryThunks";

const initialState = {
    categories: [],
    categoryDetail: null,
    status: "idle",
    error: null,
    validationErrors: null,
};

const categorySlice = createSlice({
    name: "category",
    initialState,
    reducers: {
        clearErrors: (state) => {
            state.error = null;
            state.validationErrors = null;
            state.status = "idle";
        },
        resetCategoryDetail: (state) => {
            state.categoryDetail = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // 1. Get All
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.categories = action.payload;
            })

            // 2. Get By ID
            .addCase(fetchCategoryById.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.categoryDetail = action.payload;
            })

            // 3. Create
            .addCase(createCategory.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.categories.unshift(action.payload);
            })

            // 4. Update
            .addCase(updateCategory.fulfilled, (state, action) => {
                state.status = "succeeded";
                const index = state.categories.findIndex((c) => c.id === action.payload.id);
                if (index !== -1) {
                    state.categories[index] = action.payload;
                }
            })

            // 5. Toggle Status
            .addCase(toggleCategoryStatus.fulfilled, (state, action) => {
                const index = state.categories.findIndex((c) => c.id === action.payload.id);
                if (index !== -1) {
                    state.categories[index] = action.payload;
                }
            })

            .addMatcher(isPending, (state) => {
                state.status = "loading";
                state.error = null;
                state.validationErrors = null;
            })
            .addMatcher(isRejected, (state, action) => {
                state.status = "failed";
                
                if (action.payload?.errors) {
                    state.validationErrors = action.payload.errors;
                } else if (action.payload?.message) {
                    state.error = action.payload.message;
                } else {
                    state.error = action.error.message || "Đã có lỗi xảy ra";
                }
            });
    },
});

export const { clearErrors, resetCategoryDetail } = categorySlice.actions;
export default categorySlice.reducer;

           