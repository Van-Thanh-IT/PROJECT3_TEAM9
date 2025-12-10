import { createAsyncThunk } from "@reduxjs/toolkit";
import SupportService from "../../services/supportService";

//  Lấy danh sách ticket
export const fetchTickets = createAsyncThunk(
    "support/fetchTickets",
    async (_, { rejectWithValue }) => {
        try {
            const res = await SupportService.listTickets();
            return res.data;
        } catch (err) {
             console.error(err);
            return rejectWithValue(err.response?.data);
        }
    }
);

//  Tạo ticket mới
export const createTicket = createAsyncThunk(
    "support/createTicket",
    async (data, { rejectWithValue }) => {
        try {
            const res = await SupportService.createTicket(data);
          
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data);
        }
    }
);

//  Load message của 1 ticket
export const fetchMessages = createAsyncThunk(
    "support/fetchMessages",
    async (ticketId, { rejectWithValue }) => {
        try {
            const res = await SupportService.getMessages(ticketId);
            return {
                ticketId,
                messages: res.data,
            };
        } catch (err) {
            return rejectWithValue(err.response?.data);
        }
    }
);

//  Gửi message
export const sendMessage = createAsyncThunk(
    "support/sendMessage",
    async (data, { rejectWithValue }) => {
        try {
            const res = await SupportService.sendMessage(data);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data);
        }
    }
);

