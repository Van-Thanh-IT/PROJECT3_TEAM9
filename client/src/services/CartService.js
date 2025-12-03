import axiosClient from "./axiosClient";

const CartService = {
    getCart: () => axiosClient.get("/client/carts", {
        params: {
            guest_id: localStorage.getItem("guestId")
        }
    }),

    addCart: (data) => axiosClient.post("/client/carts/add", data,{
        params: {
            guest_id: localStorage.getItem("guestId")
        }
    }),
    removeItem:(id) => axiosClient.delete(`client/carts/removeItem/${id}`),
    updateCartQuantity: (id, quantity) => axiosClient.patch(`/client/carts/item/${id}`, {quantity})

}

export default CartService;