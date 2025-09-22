import API from "./client";

export interface TolaWisePledge {
  tola_name: string;
  total_amount: number;
}

export interface DashboardResponse {
  contributor_count: number;
  total_pledge: number;
  tol_wise_pledge: TolaWisePledge[];
}

export const getDashboard = async (): Promise<DashboardResponse> => {
  const res = await API.get<DashboardResponse>("/api/v1/dashboard");
  return res.data;
};
