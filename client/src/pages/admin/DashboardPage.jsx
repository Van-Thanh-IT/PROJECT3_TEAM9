import React from 'react';
import SummaryTotalCards from '../../features/Dashboard/components/SummaryTotalCards';
import SummaryCards from '../../features/Dashboard/components/SummaryCards';
import RevenueChart from '../../features/Dashboard/components/RevenueChart';
import OrderStatusChart from '../../features/Dashboard/components/OrderStatusChart';
import TopProductsChart from '../../features/Dashboard/components/TopProductsChart';
import InventoryFlowChart from '../../features/Dashboard/components/InventoryFlowChart';
import NewUsersChart from '../../features/Dashboard/components/NewUsersChart';
import TopCustomersChart from '../../features/Dashboard/components/TopCustomersChart';
import VoucherUsageChart from '../../features/Dashboard/components/VoucherUsageChart';

const DashboardPage = () => {
    return (
       <div className="space-y-6">
            <SummaryTotalCards />
            <div>
            <h1>Hôm nay</h1>
                <SummaryCards />
            </div>
            <RevenueChart />
            <OrderStatusChart />
            <TopProductsChart />
            <InventoryFlowChart />
            <NewUsersChart />
            <TopCustomersChart />
            <VoucherUsageChart />
        </div>
    );
}

export default DashboardPage;
