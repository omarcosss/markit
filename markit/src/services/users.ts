import { api } from "../lib/api";
import type { User, UserCreate, UserUpdate } from "../types";

export const usersService = {
  register: (data: UserCreate) =>
    api.post<User>("/users/register", data),

  // The server sets an HttpOnly session cookie; nothing is stored in the browser.
  login: (email: string, password: string) =>
    api.postForm<User>("/users/login", {
      username: email, // OAuth2 spec uses "username" field
      password,
    }),

  logout: () =>
    api.post<void>("/users/logout"),

  me: () =>
    api.get<User>("/users/me"),

  update: (data: UserUpdate) =>
    api.patch<User>("/users/me", data),

  remove: () =>
    api.delete("/users/me"),
};
