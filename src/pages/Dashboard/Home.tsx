import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";

import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";

import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";
import { getDashboard } from "../../api/dashboard";
import ContributionsTable from "../../components/tables/ContributionsTable";
export interface TolaWisePledge {
  tola_name: string;
  total_amount: number;
}

export interface DashboardResponse {
  contributor_count: number;
  total_pledge: number;
  tol_wise_pledge: TolaWisePledge[];
}

export default function Home() {
  const [dashboardData, setDashboardData] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDashboard();
        setDashboardData(result);
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
      }
    };
    fetchData();
  }, []);

  if (!dashboardData) return <p>Loading...</p>;
  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics
            contributorCount={dashboardData.contributor_count}
            totalPledge={dashboardData.total_pledge}
          />

          <MonthlySalesChart tolWiseData={dashboardData.tol_wise_pledge} />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget
            collectedPercent={dashboardData.collected_percent}
            totalCollected={dashboardData.total_collected}
            todayCollected={dashboardData.today_collected}
            totalPledge={dashboardData.total_pledge}
          />
        </div>

        <div className="col-span-12 xl:col-span-12">
          <ContributionsTable />
        </div>
      </div>
    </>
  );
}
