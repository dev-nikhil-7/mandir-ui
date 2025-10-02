import { useEffect, useState } from "react";
import AdvancedTable from "../../components/tables/PaymentsTable";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { getContributors } from "../../api/contributors";
interface Village {
  id: number;
  name: string;
}

// Interface for the main JSON object
interface Tola {
  id: number;
  village_id: number;
  tola_name: string;
  tola_code: string;
  created_at: string;
  updated_at: string;
  village: Village; // Use the Village interface here
}
interface FinancialYear {
  id: number;
  name: number;
}

interface Pledge {
  id: number;
  amount: number;
  financial_year: FinancialYear;
}

interface Tola {
  id: number;
  tola_name: string;
}

interface Contributor {
  id: number;
  name: string;
  contact: string | null;
  tola_id: number;
  created_at: string;
  updated_at: string;
  tola: Tola;
  pledges: Pledge[];
}

interface ContributorsTableProps {
  contributors: Contributor[];
}
export default function ModernTableClient() {
  const [contributors, setContributors] = useState<ContributorsTableProps[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContributors = async () => {
      try {
        const data = await getContributors();
        setContributors(data);
      } catch (err) {
        console.error("Error fetching villages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContributors();
  }, []);
  return (
    <>
      <PageMeta
        title="React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Master Data" />
      <div className="space-y-6">
        <AdvancedTable />;
      </div>
    </>
  );
}
