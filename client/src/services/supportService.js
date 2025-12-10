import axiosClient from "./axiosClient";

const SupportService = {

    createTicket: (data) => axiosClient.post("/support/ticket", data),

    listTickets: () => axiosClient.get("/support/tickets"),
    getMessages: (ticketId) => axiosClient.get(`/support/messages/${ticketId}`),

    sendMessage: (data) => {
        let formData;
        
        if (data instanceof FormData) {
            formData = data;
        } else {
            formData = new FormData();
            formData.append('ticket_id', data.ticket_id);
            
            if (data.message) {
                formData.append('message', data.message);
            }
            if (data.file) {
                formData.append('file', data.file);
            }
        }

        return axiosClient.post("/support/send", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    },
};

export default SupportService;