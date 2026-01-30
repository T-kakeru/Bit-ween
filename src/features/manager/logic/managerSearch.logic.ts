import type { ManagerRow } from "@/features/manager/types";

export const applyManagerSearch = (
  rows: ManagerRow[] | null | undefined,
  query: string
): ManagerRow[] | null | undefined => {
  const keyword = String(query || "").trim().toLowerCase();
  if (!keyword) return rows;

  return (rows ?? []).filter((row) => {
    const name: string = String(row?.["名前"] ?? "").toLowerCase();
    const id: string = String(row?.id ?? "").toLowerCase();
    return name.includes(keyword) || id.includes(keyword);
  });
};
