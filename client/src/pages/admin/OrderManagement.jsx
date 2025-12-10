import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminOrders, fetchAdminOrderById } from "../../features/order/orderThunks";
import { clearErrors } from "../../features/order/orderSlice";
import OrderList from "../../features/order/components/OrderList"; 
import OrderDetailModal from "../../components/common/modal/OrderDetailModal"; 

const OrderManagement = () => {
  const dispatch = useDispatch();
  
  // Lấy state từ Redux
  const { adminOrders, adminOrderDetail, status } = useSelector((state) => state.order);

  // State quản lý Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Initial Load
  useEffect(() => {
    dispatch(fetchAdminOrders());
    return () => dispatch(clearErrors());
  }, [dispatch]);

  // Handler: Khi user bấm nút "Xem chi tiết" ở bảng
  const handleViewDetail = async (orderId) => {
    setLoadingDetail(true);
    setIsModalOpen(true);
    try {
      await dispatch(fetchAdminOrderById(orderId)).unwrap();
    } catch (error) {
      console.error("Lỗi tải chi tiết đơn:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Có thể clear adminOrderDetail nếu cần thiết để tránh hiện data cũ
  };

  const handleRefresh = () => {
    dispatch(fetchAdminOrders());
  };

  return (
    <div className=" bg-gray-50 min-h-screen">
        {/* Component Bảng Danh Sách */}
        <OrderList 
            orders={adminOrders} 
            loading={status === 'loading'} 
            onRefresh={handleRefresh}
            onViewDetail={handleViewDetail} 
        />

        {/* Component Modal Chi Tiết */}
        <OrderDetailModal
            open={isModalOpen}
            onCancel={handleCloseModal}
            order={adminOrderDetail}
            loading={loadingDetail}
        />
    </div>
  );
};

export default OrderManagement;