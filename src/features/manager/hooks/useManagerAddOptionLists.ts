import { useState } from "react";
import employees from "@/shared/data/mock/retirement.json";

const uniqueValues = (list: unknown[], key: string) =>
  Array.from(
    new Set(
      list
        .map((item) => (item as Record<string, string | undefined>)?.[key])
        .filter((value): value is string => Boolean(value && String(value).trim()))
    )
  ).sort((a, b) => a.localeCompare(b, "ja"));

const EMPLOYEES = employees as unknown[];

const INITIAL_REASON_OPTIONS = uniqueValues(EMPLOYEES, "退職理由");
const INITIAL_CLIENT_OPTIONS = uniqueValues(EMPLOYEES, "当時のクライアント");
const INITIAL_STATUS_OPTIONS = ["開発", "営業", "事務", "派遣", "待機", "その他"];

const addToList = (prev: string[], nextValue: string) => {
  const value = nextValue.trim();
  if (!value) return prev;
  return prev.includes(value) ? prev : [...prev, value];
};

const useManagerAddOptionLists = () => {
  const [statusOptions, setStatusOptions] = useState<string[]>(() => [...INITIAL_STATUS_OPTIONS]);
  const [reasonOptions, setReasonOptions] = useState<string[]>(() => [...INITIAL_REASON_OPTIONS]);
  const [clientOptions, setClientOptions] = useState<string[]>(() => [...INITIAL_CLIENT_OPTIONS]);

  return {
    statusOptions,
    reasonOptions,
    clientOptions,
    addStatusOption: (value: string) => setStatusOptions((prev) => addToList(prev, value)),
    addReasonOption: (value: string) => setReasonOptions((prev) => addToList(prev, value)),
    addClientOption: (value: string) => setClientOptions((prev) => addToList(prev, value)),
  };
};

export default useManagerAddOptionLists;
