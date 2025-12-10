import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSummary } from "../dashboardThunks";

export default function SummaryCards() {
    const dispatch = useDispatch();
    const { summary, status } = useSelector((state) => state.dashboard);

    useEffect(() => {
        dispatch(fetchSummary());
    }, [dispatch]);

    if (status === "loading" && !summary) {
        return <p>Đang tải dữ liệu...</p>;
    }

    if (!summary) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Card label="Đơn hôm nay" value={summary.orders_today} color="blue" />
            <Card label="Doanh thu hôm nay" value={summary.revenue_today + " đ"} color="green" />
            <Card label="Sản phẩm đã bán " value={summary.products_sold_today} color="purple" />
            <Card label="Người dùng mới " value={summary.new_users_today} color="teal" />
            <Card label="Đơn đang giao " value={summary.shipping_orders} color="blue" />
            <Card label="Đơn bị hủy" value={summary.cancel_today} color="red" />
            <Card label="Sắp hết hàng" value={summary.low_stock_products} color="yellow" />
            <Card label="Đơn giao thành công" value={summary.completed_orders_today || 0} color="teal" />
        </div>
    );
}

// Card component
function Card({ label, value, color }) {
    const bgColor = {
        blue: "bg-blue-50",
        green: "bg-green-50",
        purple: "bg-purple-50",
        red: "bg-red-50",
        yellow: "bg-yellow-50",
        teal: "bg-teal-50",
    };

    const textColor = {
        blue: "text-blue-600",
        green: "text-green-600",
        purple: "text-purple-600",
        red: "text-red-600",
        yellow: "text-yellow-600",
        teal: "text-teal-600",
    };

    return (
        <div className={`p-4 rounded-lg shadow flex flex-col justify-between ${bgColor[color]}`}>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <h3 className={`text-2xl font-bold ${textColor[color]}`}>{value}</h3>
        </div>
    );
}
