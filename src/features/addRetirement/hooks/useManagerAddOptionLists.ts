import { useState } from "react";
import { REASONS } from "@/features/retirementAnalytics/logic/retirementAnalytics.logic";
import departments from "@/shared/data/mock/departments.json";
import clients from "@/shared/data/mock/clients.json";
import workStatuses from "@/shared/data/mock/workStatuses.json";
import {
  addCatalogNameIfMissing,
  deleteCatalogName,
  getCatalogNames,
  renameCatalogName,
} from "@/shared/logic/catalogStorage";

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

const toCatalogItems = (list: any[]): Array<{ id: string; name: string }> =>
  (Array.isArray(list) ? list : [])
    .map((x) => ({ id: String(x?.id ?? "").trim(), name: String(x?.name ?? "").trim() }))
    .filter((x) => x.id && x.name);

const departmentFallback = toCatalogItems(departments as any);
const clientFallback = toCatalogItems(clients as any);
const workStatusFallback = toCatalogItems(workStatuses as any);

const toOptionNames = (items: Array<{ id: string; name: string }>) => toNames(items);

const collator = new Intl.Collator("ja");
const sortJa = (names: string[]) => names.slice().sort((a, b) => collator.compare(a, b));

const useManagerAddOptionLists = () => {
  const [departmentOptions, setDepartmentOptions] = useState<string[]>(() =>
    sortJa(getCatalogNames("departments", departmentFallback))
  );
  const [clientOptions, setClientOptions] = useState<string[]>(() =>
    sortJa(getCatalogNames("clients", clientFallback))
  );
  const [statusOptions, setStatusOptions] = useState<string[]>(() =>
    sortJa(getCatalogNames("workStatuses", workStatusFallback))
  );
  const reasonOptions = REASONS as unknown as string[];

  return {
    departmentOptions,
    statusOptions,
    reasonOptions,
    clientOptions,
    addDepartmentOption: (value: string) => {
      const nextItems = addCatalogNameIfMissing({
        keyName: "departments",
        name: value,
        fallbackItems: departmentFallback,
        idPrefix: "dept-auto-",
      });
      setDepartmentOptions(sortJa(toOptionNames(nextItems)));
    },
    renameDepartmentOption: (prevName: string, nextName: string) => {
      const result = renameCatalogName({
        keyName: "departments",
        prevName,
        nextName,
        fallbackItems: departmentFallback,
      });
      setDepartmentOptions(sortJa(toOptionNames(result.items)));
      return result.ok ? { ok: true as const } : { ok: false as const, message: result.message };
    },
    deleteDepartmentOption: (name: string) => {
      const nextItems = deleteCatalogName({
        keyName: "departments",
        name,
        fallbackItems: departmentFallback,
      });
      setDepartmentOptions(sortJa(toOptionNames(nextItems)));
    },
    addClientOption: (value: string) => {
      const nextItems = addCatalogNameIfMissing({
        keyName: "clients",
        name: value,
        fallbackItems: clientFallback,
        idPrefix: "client-auto-",
      });
      setClientOptions(sortJa(toOptionNames(nextItems)));
    },
    renameClientOption: (prevName: string, nextName: string) => {
      const result = renameCatalogName({
        keyName: "clients",
        prevName,
        nextName,
        fallbackItems: clientFallback,
      });
      setClientOptions(sortJa(toOptionNames(result.items)));
      return result.ok ? { ok: true as const } : { ok: false as const, message: result.message };
    },
    deleteClientOption: (name: string) => {
      const nextItems = deleteCatalogName({
        keyName: "clients",
        name,
        fallbackItems: clientFallback,
      });
      setClientOptions(sortJa(toOptionNames(nextItems)));
    },
    addStatusOption: (value: string) => {
      const nextItems = addCatalogNameIfMissing({
        keyName: "workStatuses",
        name: value,
        fallbackItems: workStatusFallback,
        idPrefix: "ws-auto-",
      });
      setStatusOptions(sortJa(toOptionNames(nextItems)));
    },
    renameStatusOption: (prevName: string, nextName: string) => {
      const result = renameCatalogName({
        keyName: "workStatuses",
        prevName,
        nextName,
        fallbackItems: workStatusFallback,
      });
      setStatusOptions(sortJa(toOptionNames(result.items)));
      return result.ok ? { ok: true as const } : { ok: false as const, message: result.message };
    },
    deleteStatusOption: (name: string) => {
      const nextItems = deleteCatalogName({
        keyName: "workStatuses",
        name,
        fallbackItems: workStatusFallback,
      });
      setStatusOptions(sortJa(toOptionNames(nextItems)));
    },
  };
};

export default useManagerAddOptionLists;
