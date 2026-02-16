import baseUsersJson from "@/shared/data/mock/users.json";
import type { AppUserRecord, UserRole } from "@/shared/types/erModels";

export type EmploymentStatus = "active" | "retired";

export type UserProfile = AppUserRecord & {
  name?: string;
  role?: UserRole;
  department?: string;
  team?: string;
  status?: string;
  icon?: string;
  gender?: "男性" | "女性" | "その他" | "";
  birthDate?: string;
  joinDate?: string;
  employmentStatus?: EmploymentStatus;
  retireDate?: string;
  bio?: string;
  smallTalk?: {
    hobbies?: string[];
    oneLiner?: string;
  };
};

const normalizeKey = (value: unknown) => {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\u3000/g, " ")
    .replace(/\s+/g, "");
};

const runtimeUsers: UserProfile[] = [];

export const listUsers = (): UserProfile[] => {
  const baseUsers = (baseUsersJson as any) as UserProfile[];
  const storageUsers = runtimeUsers;

  // Prefer storage users if the same id exists.
  const byId = new Map<string, UserProfile>();
  for (const u of baseUsers) byId.set(u.id, u);
  for (const u of storageUsers) byId.set(u.id, u);
  return Array.from(byId.values());
};

export const addUser = (user: UserProfile) => {
  const next = { ...(user ?? {}) } as UserProfile;
  if (!next?.id) return;

  const index = runtimeUsers.findIndex((u) => u.id === next.id);
  if (index >= 0) runtimeUsers[index] = next;
  else runtimeUsers.push(next);
};

export type SearchUsersOptions = {
  limit?: number;
  activeOnly?: boolean;
};

export const searchUsersByName = (query: string, options: SearchUsersOptions = {}) => {
  const { limit = 10, activeOnly = true } = options;
  const q = normalizeKey(query);

  const users = listUsers().filter((u) => {
    if (activeOnly && u.employmentStatus === "retired") return false;
    return true;
  });

  if (!q) return users.slice(0, limit);

  const scored = users
    .map((u) => {
      const displayName = String(u.name ?? u.email ?? "");
      const key = normalizeKey(displayName);
      const idx = key.indexOf(q);
      const score = idx === -1 ? Number.POSITIVE_INFINITY : idx;
      return { u, score };
    })
    .filter((x) => Number.isFinite(x.score))
    .sort((a, b) => a.score - b.score);

  return scored.slice(0, limit).map((x) => x.u);
};
