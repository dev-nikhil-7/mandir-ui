import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import { getVillages } from "../../api/tolas";
import { useEffect, useState } from "react";

// Define the type of a Village
// Interface for the nested 'village' object
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

export default function BasicTables() {
  const [villages, setVillages] = useState<Tola[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVillages = async () => {
      try {
        const data = await getVillages();
        setVillages(data);
      } catch (err) {
        console.error("Error fetching villages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVillages();
  }, []);
  const columns = [
    { Header: "ID", accessor: "id" },
    { Header: "Name", accessor: "tola_name" },
    {
      Header: "Village",
      render: (row: any) => <span>{row.village.name}</span>,
      accessor: "village",
    },
  ];
  return (
    <>
      <PageMeta
        title="React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Master Data" />
      <div className="space-y-6">
        <BasicTableOne<Tola> columns={columns} data={villages} />
      </div>
    </>
  );
}
