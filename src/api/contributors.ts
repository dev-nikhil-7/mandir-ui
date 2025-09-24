// villages.ts
import API from "./client";

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
// Function to get villages
export const getContributors = async (): Promise<ContributorsTableProps[]> => {
  const res = await API.get<ContributorsTableProps[]>("/api/v1/contributors");

  return res.data; // Axios returns data inside `res.data`
};

// Function to get villages
export const getTolaContributors = async (
  tola_id: any
): Promise<ContributorsTableProps[]> => {
  const res = await API.get<ContributorsTableProps[]>(
    `/api/v1/tolas/${tola_id}/contributors`
  );

  return res.data; // Axios returns data inside `res.data`
};

// Function to get villages
export const updateContributor = async (
  tola_id: any,
  data: any
): Promise<ContributorsTableProps[]> => {
  const res = await API.put<any>(`/api/v1/contributors/${tola_id}`, data);

  return res.data; // Axios returns data inside `res.data`
};
