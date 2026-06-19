import API from "../api/axios";

type LoginPayLoad = {
  email: string;
  password: string;
};

type RegisterPayLoad = {
  name: string;
  email: string;
  password: string;
}

type User = {
  id: number;
  name: string;
  email: string;
}

type AuthResponse = {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
};

// LOGIN
export const login = async (data: LoginPayLoad) => {
  return API.post<AuthResponse>("/auth/login", data);
};

// REGISTER
export const register = async (data: RegisterPayLoad) => {
  return API.post<AuthResponse>("/auth/register", data);
};

// LOGOUT
export const logout = async () => {
  return API.post("/auth/logout");
}