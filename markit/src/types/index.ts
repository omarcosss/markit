export interface Collection {
  id: number;
  name: string;
  created_at: string;
  bookmark_count: number;
}

export interface Bookmark {
  id: number;
  url: string;
  title: string | null;
  description: string | null;
  thumbnail: string | null;
  favicon: string | null;
  domain: string | null;
  collection_id: number | null;
  created_at: string;
}

export interface ScrapeResult {
  url: string;
  title: string | null;
  description: string | null;
  thumbnail: string | null;
  favicon: string | null;
  domain: string | null;
}

// User & auth types

export interface User {
  id: number;
  email: string;
  name: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface UserCreate {
  email: string;
  password: string;
  name?: string;
}

export interface UserUpdate {
  name?: string;
  email?: string;
}