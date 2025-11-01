// expenses.ts
import API from "./client";

// Interface for main Expense structure (flat)
export interface Expense {
  id: number;
  event_id: number;
  financial_year_id: number;
  amount: number;
  description: string;
  expense_type: string;
  paid_by: string;
  approved_by: string;
  payment_mode: string;
  date_of_expense: string;
  created_at: string;
  updated_at: string;
}

// Function to get all expenses
export const getExpenses = async (): Promise<Expense[]> => {
  const res = await API.get<Expense[]>("/api/v1/expenses");
  return res.data;
};

// Function to create a new expense
export const createExpense = async (data: any): Promise<Expense> => {
  const res = await API.post<Expense>("/api/v1/expenses", data);
  return res.data;
};

// Function to get single expense
export const getExpenseById = async (id: number): Promise<Expense> => {
  const res = await API.get<Expense>(`/api/v1/expenses/${id}`);
  return res.data;
};

// Function to update an expense
export const updateExpense = async (
  id: number,
  data: any
): Promise<Expense> => {
  const res = await API.put<Expense>(`/api/v1/expenses/${id}`, data);
  return res.data;
};

// Function to delete an expense
export const deleteExpense = async (id: number): Promise<void> => {
  await API.delete(`/api/v1/expenses/${id}`);
};
