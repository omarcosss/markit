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

  // Profile changes and account deletion both require the current password.
  update: (data: UserUpdate & { current_password: string }) =>
    api.patch<User>("/users/me", data),

  // Signs out every other session; this one stays signed in (the server re-issues its cookie).
  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch<void>("/users/me/password", {
      current_password: currentPassword,
      new_password: newPassword,
    }),

  remove: (currentPassword: string) =>
    api.delete("/users/me", { current_password: currentPassword }),
};
