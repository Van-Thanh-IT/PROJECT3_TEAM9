import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchAdminOrderById } from "../orderThunks";
import { Spin, Result, Button, Card } from "antd";

const OrderSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const orderId = location.state?.orderId;

    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState(null);

    useEffect(() => {
        if (!orderId) {
            navigate("/"); 
            return;
        }

        const getOrder = async () => {
            try {
                const res = await dispatch(fetchAdminOrderById(orderId)).unwrap();
                setOrder(res.data || res); 
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };

        getOrder();
    }, [orderId, dispatch, navigate]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Spin size="large" />
            </div>
        );
    }

    if (!order) {
        return (
            <Result
                status="error"
                title="Không tìm thấy đơn hàng"
                extra={[
                    <Button type="primary" onClick={() => navigate("/")}>
                        Về trang chủ
                    </Button>
                ]}
            />
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <Result
                status="success"
                title="Đặt hàng thành công!"
                subTitle={`Mã đơn hàng: ${order.code || order.id}`}
            />

            <Card title="Thông tin đơn hàng" className="mb-4">
                <p><strong>Họ tên:</strong> {order.full_name}</p>
                <p><strong>Số điện thoại:</strong> {order.phone}</p>
                <p><strong>Địa chỉ:</strong> {order.address_detail}, {order.ward}, {order.district}, {order.city}</p>
                <p><strong>Ghi chú:</strong> {order.note || "Không có"}</p>

                <p><strong>Hãng vận chuyển:</strong> {order.shipping_carrier}</p>
                <p><strong>Trạng thái:</strong> {order.shipping_status}</p>
                <p><strong>Phí vận chuyển:</strong> {order.shipping_fee.toLocaleString()}đ</p>
                <p><strong>Tổng tiền:</strong> {order.final_amount.toLocaleString()}đ</p>
            </Card>

            <Card title="Sản phẩm đã mua">
                {order.items?.map((item, idx) => (
                    <div key={idx} className="mb-3 border-b pb-2">
                        <p><strong>{item.product_name}</strong></p>
                        <p>Màu: {item.color} — Size: {item.size}</p>
                        <p>Số lượng: {item.quantity}</p>
                        <p>Giá: {item.price.toLocaleString()}đ</p>
                    </div>
                ))}
            </Card>

            <div className="text-center mt-4">
                <Button type="primary" onClick={() => navigate("/orders")}>
                    Xem danh sách đơn hàng
                </Button>
            </div>
        </div>
    );
};

export default OrderSuccess;
