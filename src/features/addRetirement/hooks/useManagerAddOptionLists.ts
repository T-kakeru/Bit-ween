import { useState } from "react";
import { REASONS, STATUSES } from "@/features/retirementAnalytics/logic/retirementAnalytics.logic";
import departments from "@/shared/data/mock/departments.json";
import clients from "@/shared/data/mock/clients.json";

// 
const toNames = (list: any[]): string[] =>
  (Array.isArray(list) ? list : [])
    .map((x) => String(x?.name ?? "").trim())
    .filter(Boolean);

const addToList = (prev: string[], nextValue: string) => {
  const value = nextValue.trim();
  if (!value) return prev;
  return prev.includes(value) ? prev : [...prev, value];
};

const useManagerAddOptionLists = () => {
  const [departmentOptions, setDepartmentOptions] = useState<string[]>(() => toNames(departments as any));
  const [clientOptions, setClientOptions] = useState<string[]>(() => toNames(clients as any));
  const statusOptions = ["稼働中", "待機", "休職中"].filter((v) =>
    (STATUSES as unknown as string[]).includes(v)
  );
  const reasonOptions = REASONS as unknown as string[];

  return {
    departmentOptions,
    statusOptions,
    reasonOptions,
    clientOptions,
    addDepartmentOption: (value: string) => setDepartmentOptions((prev) => addToList(prev, value)),
    addClientOption: (value: string) => setClientOptions((prev) => addToList(prev, value)),
  };
};

export default useManagerAddOptionLists;
