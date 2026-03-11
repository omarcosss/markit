import { api, setToken, clearToken } from "../lib/api";
import type { Token, User, UserCreate, UserUpdate } from "../types";

export const usersService = {
  register: (data: UserCreate) =>
    api.post<User>("/users/register", data),

  login: async (email: string, password: string): Promise<Token> => {
    const token = await api.postForm<Token>("/users/login", {
      username: email, // OAuth2 spec uses "username" field
      password,
    });
    setToken(token.access_token);
    return token;
  },

  logout: (): void => {
    clearToken();
  },

  me: () =>
    api.get<User>("/users/me"),

  update: (data: UserUpdate) =>
    api.patch<User>("/users/me", data),

  remove: () =>
    api.delete("/users/me"),
};
