import API from "./client";

export interface LoginCreate {
  username: string;
  password: string; // ISO format
}

export const login = async (data: LoginCreate): Promise<any> => {
  const res = await API.post("/api/v1/users/login", data);
  return res.data;
};
