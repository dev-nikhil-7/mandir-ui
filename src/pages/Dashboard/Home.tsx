import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";

import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";

import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";
import { getDashboard } from "../../api/dashboard";
import ContributionsTable from "../../components/tables/ContributionsTable";
import ExpenseTable from "../../components/tables/Expenses";
import TableGraph from "../../components/tables/TableGraph";

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
            total_expense={dashboardData.total_expense}
            totalPledge={dashboardData.total_pledge}
          />
        </div>
        <div className="col-span-12">
          <div className="bg-white shadow rounded-xl p-4 overflow-x-auto">
            <TableGraph
              data={dashboardData.tol_wise_pledge.map((pledge: any) => {
                const match = dashboardData.tol_wise_collection.find(
                  (c: any) => c.tola_name === pledge.tola_name
                );
                return {
                  tola_name: pledge.tola_name,
                  total_pledged: pledge.total_amount,
                  total_collected: match ? match.total_collected : 0,
                };
              })}
            />
          </div>
        </div>

        <div className="col-span-12 xl:col-span-12">
          <ContributionsTable />
        </div>
        <div className="col-span-12 xl:col-span-12">
          <ExpenseTable />
        </div>
      </div>
    </>
  );
}
