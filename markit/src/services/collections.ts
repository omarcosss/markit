import { api } from "../lib/api";
import type { Collection } from "../types";

export const collectionsService = {
  list: () => api.get<Collection[]>("/collections/"),
  get: (id: number) => api.get<Collection>(`/collections/${id}`),
  create: (name: string) => api.post<Collection>("/collections/", { name }),
  update: (id: number, name: string) =>
    api.patch<Collection>(`/collections/${id}`, { name }),
  remove: (id: number) => api.delete(`/collections/${id}`),
};