import { useEffect, useState } from "react";
import {
  addCatalogOption,
  deleteCatalogOption,
  fetchClientNames,
  fetchDepartmentNames,
  fetchRetirementReasonNames,
  fetchWorkStatusNames,
  renameCatalogOption,
} from "@/services/masterData/masterDataService";

const collator = new Intl.Collator("ja");
const sortJa = (names: string[]) => names.slice().sort((a, b) => collator.compare(a, b));

const useManagerAddOptionLists = () => {
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [clientOptions, setClientOptions] = useState<string[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [reasonOptions, setReasonOptions] = useState<string[]>([]);

  useEffect(() => {
    let disposed = false;

    const load = async () => {
      const [departments, clients, statuses, reasons] = await Promise.all([
        fetchDepartmentNames(),
        fetchClientNames(),
        fetchWorkStatusNames(),
        fetchRetirementReasonNames(),
      ]);
      if (disposed) return;
      setDepartmentOptions(sortJa(departments));
      setClientOptions(sortJa(clients));
      setStatusOptions(sortJa(statuses));
      setReasonOptions(sortJa(reasons));
    };

    void load();

    return () => {
      disposed = true;
    };
  }, []);

  return {
    departmentOptions,
    statusOptions,
    reasonOptions,
    clientOptions,
    addDepartmentOption: async (value: string) => {
      const next = await addCatalogOption({
        keyName: "departments",
        value,
      });
      setDepartmentOptions(sortJa(next));
    },
    renameDepartmentOption: (prevName: string, nextName: string) => {
      const run = async () => {
        const result = await renameCatalogOption({
          keyName: "departments",
          prevName,
          nextName,
        });
        if (result.ok) {
          const latest = await fetchDepartmentNames();
          setDepartmentOptions(sortJa(latest));
        }
        return result.ok
          ? ({ ok: true } as const)
          : ({ ok: false, message: result.message } as const);
      };
      return run();
    },
    deleteDepartmentOption: (name: string) => {
      const run = async () => {
        const next = await deleteCatalogOption({
          keyName: "departments",
          value: name,
        });
        setDepartmentOptions(sortJa(next));
      };
      void run();
    },
    addClientOption: async (value: string) => {
      const next = await addCatalogOption({
        keyName: "clients",
        value,
      });
      setClientOptions(sortJa(next));
    },
    renameClientOption: (prevName: string, nextName: string) => {
      const run = async () => {
        const result = await renameCatalogOption({
          keyName: "clients",
          prevName,
          nextName,
        });
        if (result.ok) {
          const latest = await fetchClientNames();
          setClientOptions(sortJa(latest));
        }
        return result.ok
          ? ({ ok: true } as const)
          : ({ ok: false, message: result.message } as const);
      };
      return run();
    },
    deleteClientOption: (name: string) => {
      const run = async () => {
        const next = await deleteCatalogOption({
          keyName: "clients",
          value: name,
        });
        setClientOptions(sortJa(next));
      };
      void run();
    },
  };
};

export default useManagerAddOptionLists;
