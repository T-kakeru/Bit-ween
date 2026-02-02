import baseUsersJson from "@/shared/data/mock/users.json";

export type EmploymentStatus = "active" | "retired";

export type UserProfile = {
  id: string;
  name: string;
  department?: string;
  team?: string;
  role?: string;
  status?: string;
  icon?: string;
  gender?: "男性" | "女性" | "その他" | "";
  birthDate?: string; // YYYY-MM-DD
  joinDate?: string; // YYYY-MM-DD
  employmentStatus?: EmploymentStatus;
  retireDate?: string; // YYYY-MM-DD
  bio?: string;
  smallTalk?: {
    hobbies?: string[];
    oneLiner?: string;
  };
};

const STORAGE_KEY = "bitween:mockUsers";

const normalizeKey = (value: unknown) => {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\u3000/g, " ")
    .replace(/\s+/g, "");
};

const readStorageUsers = (): UserProfile[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as UserProfile[]) : [];
  } catch {
    return [];
  }
};

const writeStorageUsers = (users: UserProfile[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch {
    // ignore
  }
};

export const listUsers = (): UserProfile[] => {
  const baseUsers = (baseUsersJson as any) as UserProfile[];
  const storageUsers = readStorageUsers();

  // Prefer storage users if the same id exists.
  const byId = new Map<string, UserProfile>();
  for (const u of baseUsers) byId.set(u.id, u);
  for (const u of storageUsers) byId.set(u.id, u);
  return Array.from(byId.values());
};

export const addUser = (user: UserProfile) => {
  const current = readStorageUsers();
  const next = [...current, user];
  writeStorageUsers(next);
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
      const key = normalizeKey(u.name);
      const idx = key.indexOf(q);
      const score = idx === -1 ? Number.POSITIVE_INFINITY : idx;
      return { u, score };
    })
    .filter((x) => Number.isFinite(x.score))
    .sort((a, b) => a.score - b.score);

  return scored.slice(0, limit).map((x) => x.u);
};
