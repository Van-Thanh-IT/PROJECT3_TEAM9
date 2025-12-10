import { createAsyncThunk } from "@reduxjs/toolkit";
import InventoryService from "../../services/inventoryService";

export const getAllInventories = createAsyncThunk(
    "inventory/fetchInventory",
    async (_, thunkAPI) => {
        try {
            const response = await InventoryService.getAllInventories();
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getInventoryNoteDetail = createAsyncThunk(
    "inventory/getInventoryNoteDetail",
    async (noteId, thunkAPI) => {
        try {
            const response = await InventoryService.getInventoryNoteDetail(noteId);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const importStock = createAsyncThunk(
    "inventory/importStock",
    async (data, thunkAPI) => {
        try {
            const response = await InventoryService.importStock(data);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const exportStock = createAsyncThunk(
    "inventory/exportStock",
    async (data, thunkAPI) => {
        try {
            const response = await InventoryService.exportStock(data);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const adjustStock = createAsyncThunk(
    "inventory/adjustStock",
    async (data, thunkAPI) => {
        try {
            const response = await InventoryService.adjustStock(data);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
)

export const getVariantHistory = createAsyncThunk(
    "inventory/getVariantHistory",
    async (variantId, thunkAPI) => {
        try {
            const response = await InventoryService.getVariantHistory(variantId);
            return response.data.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
)