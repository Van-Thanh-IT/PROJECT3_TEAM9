import { createSlice, isPending, isRejected } from "@reduxjs/toolkit";
import {
    fetchTickets,
    createTicket,
    fetchMessages,
    sendMessage,
} from "./supportTicketThunks";

const initialState = {
    tickets: [],
    messages: {},     
    status: "idle",
    error: null,
};

const supportSlice = createSlice({
    name: "support",
    initialState,
    reducers: {
        clearErrors: (state) => {
            state.error = null;
            state.status = "idle";
        },

        resetSupport: (state) => {
            Object.assign(state, initialState);
        },

        // realtime nhận tin nhắn từ Reverb
       addRealtimeMessage: (state, action) => {
            const msg = action.payload;
            const ticketId = msg.ticket_id;

            if (!state.messages[ticketId]) {
                state.messages[ticketId] = [];
            }

            // Kiểm tra trùng
            const exists = state.messages[ticketId].some(m => m.id === msg.id);
            if (!exists) {
                state.messages[ticketId].push(msg);
            }
        }

    },

    extraReducers: (builder) => {

        // ============ FETCH TICKETS ============
        builder.addCase(fetchTickets.fulfilled, (state, action) => {
            state.status = "succeeded";
            state.tickets = action.payload;
        });

        // ============ CREATE TICKET ============
        builder.addCase(createTicket.fulfilled, (state, action) => {
            state.status = "succeeded";
            state.tickets.push(action.payload);
        });

        // ============ MESSAGES OF TICKET ============
        builder.addCase(fetchMessages.fulfilled, (state, action) => {
            state.status = "succeeded";
            const { ticketId, messages } = action.payload;
            state.messages[ticketId] = messages;
        });

        // ============ SEND MESSAGE ============
        builder.addCase(sendMessage.fulfilled, (state, action) => {
            state.status = "succeeded";
            const msg = action.payload;

            if (!state.messages[msg.ticket_id]) {
                state.messages[msg.ticket_id] = [];
            }

            state.messages[msg.ticket_id].push(msg);
        });

        // ---------- MATCHERS ----------
        builder.addMatcher(isPending, (state) => {
            state.status = "loading";
            state.error = null;
        });

        builder.addMatcher(isRejected, (state, action) => {
            state.status = "failed";
            state.error =
                action.payload?.message ||
                action.error?.message ||
                "Lỗi không xác định!";
        });
    },
});

export const { clearErrors, resetSupport, addRealtimeMessage } =
    supportSlice.actions;

export default supportSlice.reducer;
