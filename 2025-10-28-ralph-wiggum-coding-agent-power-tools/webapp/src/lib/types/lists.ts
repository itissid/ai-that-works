import type { List, ListShare } from "@/generated/prisma";

export type { List, ListShare };

export interface CreateListInput {
  name: string;
}

export interface UpdateListInput {
  name?: string;
}

export interface ListResult {
  success: boolean;
  list?: List;
  error?: string;
}

export interface ListsResult {
  success: boolean;
  lists?: List[];
  error?: string;
}

export interface ShareListInput {
  email: string;
}

export interface ListShareResult {
  success: boolean;
  share?: ListShare;
  error?: string;
}

export interface ListSharesResult {
  success: boolean;
  shares?: ListShare[];
  error?: string;
}
