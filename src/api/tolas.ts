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

// Function to get villages
export const getVillages = async (): Promise<Tola[]> => {
  const res = await API.get<Tola[]>("/api/v1/tolas");
  console.log(res.data);
  return res.data; // Axios returns data inside `res.data`
};
