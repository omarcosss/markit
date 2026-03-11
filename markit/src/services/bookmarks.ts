import { api } from "../lib/api";
import type { Bookmark, ScrapeResult } from "../types";

export const bookmarksService = {
  scrape: (url: string) =>
    api.post<ScrapeResult>("/bookmarks/scrape", { url }),

  list: (collection_id?: number) => {
    const query = collection_id ? `?collection_id=${collection_id}` : "";
    return api.get<Bookmark[]>(`/bookmarks/${query}`);
  },

  create: (data: Omit<Bookmark, "id" | "created_at">) =>
    api.post<Bookmark>("/bookmarks/", data),

  update: (id: number, data: Partial<Bookmark>) =>
    api.patch<Bookmark>(`/bookmarks/${id}`, data),

  remove: (id: number) =>
    api.delete(`/bookmarks/${id}`),
};