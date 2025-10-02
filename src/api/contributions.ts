import API from "./client";

export interface ContributionCreate {
  tola_id: number;
  contributor_id: number;
  event_id: number;
  payment_date: string; // ISO format
  amount: number;
  payment_mode_id: string;
}

export interface ContributionResponse extends ContributionCreate {
  id: number;
  created_at: string;
  updated_at: string;
}

export const createContribution = async (
  data: ContributionCreate
): Promise<ContributionResponse> => {
  const res = await API.post("/api/v1/contributions", data);
  return res.data;
};

export interface Contribution {
  id: number;
  amount: number;
  payment_date: string;
  tola_name: string;
  contributor_name: string;
  payment_mode: string;
  receipt_id: string;
}

export const getContributions = async (): Promise<Contribution[]> => {
  const res = await API.get("/api/v1/contributions");
  return res.data;
};

/* ---------------------  PAYMENTS API --------------------- */

export interface PaymentContributor {
  contributor_id: number;
  contributor_name: string;
  pledged_amount: number;
  paid_amount: number;
  percent_diff: number;
  tola?: {
    id: number;
    tola_name: string;
  };
}

export interface PaymentsSummary {
  total_pledged: number;
  total_paid: number;
  total_percent_diff: number;
}

export interface PaymentsResponse {
  contributors: PaymentContributor[];
  summary: PaymentsSummary;
}

/**
 * Fetch payments for a specific tola
 * @param tolaId required tola id
 */
export const getPayments = async (
  tolaId: number
): Promise<PaymentsResponse> => {
  const res = await API.get(`/api/v1/contributions/tola/${tolaId}/payments`);
  return res.data;
};
