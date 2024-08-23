import axios from "axios";
import { API_URL } from "./constants";

export interface LoginResponse {
  token: string;
}

export const login = async (
  username: string,
  password: string,
): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(
    `${API_URL}/api-token-auth/`,
    {
      username,
      password,
    },
  );
  return response.data;
};

export interface UserResponse {
  username: string;
  email: string;
  role: "factory" | "carrier" | "sale-point";
}

export const user = async (): Promise<UserResponse> => {
  const response = await axios.post<UserResponse>(`${API_URL}/users/`);
  return response.data;
};
