import { useCallback, useMemo, useState } from "react";
import { parseCsvText } from "../logic/csvParser";
import { normalizeEmployeeCsvRows } from "../logic/employeeCsvNormalization";
import { validateEmployeeCsvRows } from "../logic/employeeCsvValidation";
import { addClientMaster, addDepartmentMaster, addWorkStatusMaster } from "../logic/employeeCsvConstants";
import type { EmployeeCsvError, EmployeeCsvNormalizedRow, EmployeeCsvRawRow } from "../types";

const readFileAsText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("CSVの読み込みに失敗しました。"));
    reader.readAsText(file);
  });

type UseEmployeeCsvImportOptions = {
  allowFutureRetirementDate?: boolean;
};

type AddedCatalog = {
  departments: string[];
  workLocations: string[];
  workStatuses: string[];
};

const addUnique = (list: string[], value: string) => {
  const v = String(value ?? "").trim();
  if (!v) return list;
  return list.includes(v) ? list : [...list, v];
};

const useEmployeeCsvImport = ({ allowFutureRetirementDate = false }: UseEmployeeCsvImportOptions = {}) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [errors, setErrors] = useState<EmployeeCsvError[]>([]);
  const [headerErrors, setHeaderErrors] = useState<EmployeeCsvError[]>([]);
  const [validRows, setValidRows] = useState<EmployeeCsvNormalizedRow[]>([]);
  const [sourceRows, setSourceRows] = useState<EmployeeCsvRawRow[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const [addedCatalog, setAddedCatalog] = useState<AddedCatalog>({
    departments: [],
    workLocations: [],
    workStatuses: [],
  });

  const reset = useCallback(() => {
    setFileName(null);
    setErrors([]);
    setHeaderErrors([]);
    setValidRows([]);
    setSourceRows([]);
    setRowCount(0);
    setIsProcessing(false);
    setInputKey((prev) => prev + 1);
    setAddedCatalog({ departments: [], workLocations: [], workStatuses: [] });
  }, []);

  const revalidate = useCallback(
    (rows: EmployeeCsvRawRow[]) => {
      const validation = validateEmployeeCsvRows({
        rows,
        allowFutureRetirementDate,
      });
      setErrors([...headerErrors, ...validation.errors]);
      setValidRows(validation.validRows);
      setRowCount(validation.rowCount);
    },
    [allowFutureRetirementDate, headerErrors]
  );

  const handleFileSelect = useCallback(
    async (file: File | null) => {
      if (!file) {
        reset();
        return;
      }
      setIsProcessing(true);
      setFileName(file.name);
      setAddedCatalog({ departments: [], workLocations: [], workStatuses: [] });

      try {
        const text = await readFileAsText(file);
        const { headers, rows } = parseCsvText(text);

        if (!headers.length) {
          setErrors([
            { rowNumber: 0, field: "file", message: "CSVのヘッダーが見つかりません。" },
          ]);
          setValidRows([]);
          setRowCount(0);
          return;
        }

        const { normalizedRows, errors: headerErrors } = normalizeEmployeeCsvRows({ headers, rows });
        setHeaderErrors(headerErrors);
        setSourceRows(normalizedRows);
        const validation = validateEmployeeCsvRows({ rows: normalizedRows, allowFutureRetirementDate });
        setErrors([...headerErrors, ...validation.errors]);
        setValidRows(validation.validRows);
        setRowCount(validation.rowCount);
      } catch (error) {
        setErrors([
          {
            rowNumber: 0,
            field: "file",
            message: "CSVの読み込みに失敗しました。ファイル形式を確認してください。",
          },
        ]);
        setHeaderErrors([]);
        setValidRows([]);
        setSourceRows([]);
        setRowCount(0);
      } finally {
        setIsProcessing(false);
      }
    },
    [allowFutureRetirementDate, reset]
  );

  const addDepartmentAndRevalidate = useCallback(
    (value: string) => {
      if (!sourceRows.length) return;
      setIsProcessing(true);
      try {
        addDepartmentMaster(value);
        setAddedCatalog((prev) => ({ ...prev, departments: addUnique(prev.departments, value) }));
        revalidate(sourceRows);
      } finally {
        setIsProcessing(false);
      }
    },
    [revalidate, sourceRows]
  );

  const addWorkLocationAndRevalidate = useCallback(
    (value: string) => {
      if (!sourceRows.length) return;
      setIsProcessing(true);
      try {
        addClientMaster(value);
        setAddedCatalog((prev) => ({ ...prev, workLocations: addUnique(prev.workLocations, value) }));
        revalidate(sourceRows);
      } finally {
        setIsProcessing(false);
      }
    },
    [revalidate, sourceRows]
  );

  const addWorkStatusAndRevalidate = useCallback(
    (value: string) => {
      if (!sourceRows.length) return;
      setIsProcessing(true);
      try {
        addWorkStatusMaster(value);
        setAddedCatalog((prev) => ({ ...prev, workStatuses: addUnique(prev.workStatuses, value) }));
        revalidate(sourceRows);
      } finally {
        setIsProcessing(false);
      }
    },
    [revalidate, sourceRows]
  );

  const canImport = useMemo(() => errors.length === 0 && validRows.length > 0, [errors.length, validRows.length]);

  return {
    fileName,
    errors,
    validRows,
    rowCount,
    isProcessing,
    canImport,
    addedCatalog,
    inputKey,
    handleFileSelect,
    addDepartmentAndRevalidate,
    addWorkLocationAndRevalidate,
    addWorkStatusAndRevalidate,
    reset,
  };
};

export default useEmployeeCsvImport;
