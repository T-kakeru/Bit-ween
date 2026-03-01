import { useCallback, useMemo, useState } from "react";
import { parseCsvText } from "../logic/csvParser";
import { normalizeEmployeeCsvRows } from "../logic/employeeCsvNormalization";
import { validateEmployeeCsvRows } from "../logic/employeeCsvValidation";
import {
  addClientMaster,
  addDepartmentMaster,
  initializeEmployeeCsvMasters,
} from "../logic/employeeCsvConstants";
import type { EmployeeCsvError, EmployeeCsvNormalizedRow, EmployeeCsvRawRow } from "../types";
import { ERROR_MESSAGES } from "@/shared/constants/messages/appMessages";

const readFileAsText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error(ERROR_MESSAGES.CSV.READ_FAILED_DOT));
    reader.readAsText(file);
  });

type SourceRowWithMeta = {
  fileName: string;
  rowNumberInFile: number;
  row: EmployeeCsvRawRow;
};

type UseEmployeeCsvImportOptions = {
  allowFutureRetirementDate?: boolean;
};

type AddedCatalog = {
  departments: string[];
  workLocations: string[];
};

const addUnique = (list: string[], value: string) => {
  const v = String(value ?? "").trim();
  if (!v) return list;
  return list.includes(v) ? list : [...list, v];
};

const buildFileLabel = (files: File[]) => {
  const list = Array.isArray(files) ? files : [];
  if (list.length === 0) return null;
  if (list.length === 1) return list[0].name;
  const first = list[0].name;
  return `${list.length}ファイル（${first} など）`;
};

const withFilePrefix = (fileName: string, message: string) => {
  const f = String(fileName ?? "").trim();
  if (!f) return message;
  return `【${f}】${message}`;
};

const normalizeEmployeeIdForDedupe = (value: unknown) => String(value ?? "").trim();

const dedupeEmployeeIdsInPlace = (rows: SourceRowWithMeta[]) => {
  const seen = new Set<string>();

  for (const item of rows) {
    const id = normalizeEmployeeIdForDedupe(item.row.employeeId);
    if (!id) continue;
    if (seen.has(id)) {
      // CSV内の社員ID重複は、後続を空にして自動採番に任せる（誤更新防止）
      item.row.employeeId = "";
      continue;
    }
    seen.add(id);
  }
};

const useEmployeeCsvImport = ({ allowFutureRetirementDate = false }: UseEmployeeCsvImportOptions = {}) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [errors, setErrors] = useState<EmployeeCsvError[]>([]);
  const [headerErrors, setHeaderErrors] = useState<EmployeeCsvError[]>([]);
  const [validRows, setValidRows] = useState<EmployeeCsvNormalizedRow[]>([]);
  const [sourceRows, setSourceRows] = useState<SourceRowWithMeta[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const [addedCatalog, setAddedCatalog] = useState<AddedCatalog>({
    departments: [],
    workLocations: [],
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
    setAddedCatalog({ departments: [], workLocations: [] });
  }, []);

  const revalidate = useCallback(
    (rowsWithMeta: SourceRowWithMeta[]) => {
      const headerErrs: EmployeeCsvError[] = [];
      const rowErrs: EmployeeCsvError[] = [];
      const nextValidRows: EmployeeCsvNormalizedRow[] = [];

      // ファイル別に検証して、行番号は「各ファイル内の行番号」を維持する
      const byFile = new Map<string, SourceRowWithMeta[]>();
      for (const item of rowsWithMeta) {
        const list = byFile.get(item.fileName) ?? [];
        list.push(item);
        byFile.set(item.fileName, list);
      }

      byFile.forEach((list, currentFileName) => {
        const rows = list.map((item: SourceRowWithMeta) => item.row);
        const validation = validateEmployeeCsvRows({ rows, allowFutureRetirementDate });
        nextValidRows.push(...validation.validRows);
        rowErrs.push(
          ...validation.errors.map((e) => ({
            ...e,
            message: withFilePrefix(currentFileName, e.message),
          }))
        );
      });

      headerErrs.push(
        ...headerErrors.map((e) => ({
          ...e,
          message: e.message,
        }))
      );

      setErrors([...headerErrs, ...rowErrs]);
      setValidRows(nextValidRows);
      setRowCount(rowsWithMeta.length);
    },
    [allowFutureRetirementDate, headerErrors]
  );

  const handleFileSelect = useCallback(
    async (files: File[] | null) => {
      const list = Array.isArray(files) ? files.filter(Boolean) : [];
      if (list.length === 0) {
        reset();
        return;
      }

      setIsProcessing(true);
      setFileName(buildFileLabel(list));
      setAddedCatalog({ departments: [], workLocations: [] });

      try {
        await initializeEmployeeCsvMasters();

        const aggregatedHeaderErrors: EmployeeCsvError[] = [];
        const aggregatedSourceRows: SourceRowWithMeta[] = [];

        for (const file of list) {
          const currentFileName = file.name;
          const text = await readFileAsText(file);
          const { headers, rows } = parseCsvText(text);

          if (!headers.length) {
            aggregatedHeaderErrors.push({
              rowNumber: 0,
              field: "file",
              message: withFilePrefix(currentFileName, ERROR_MESSAGES.CSV.HEADER_NOT_FOUND_DOT),
            });
            continue;
          }

          const { normalizedRows, errors: headerErrs } = normalizeEmployeeCsvRows({ headers, rows });
          aggregatedHeaderErrors.push(
            ...headerErrs.map((e) => ({
              ...e,
              message: withFilePrefix(currentFileName, e.message),
            }))
          );

          normalizedRows.forEach((row, index) => {
            aggregatedSourceRows.push({
              fileName: currentFileName,
              rowNumberInFile: index + 1,
              row,
            });
          });
        }

        // 社員ID重複（複数ファイル横断含む）は後続を空にして自動採番に回す
        dedupeEmployeeIdsInPlace(aggregatedSourceRows);

        setHeaderErrors(aggregatedHeaderErrors);
        setSourceRows(aggregatedSourceRows);

        // 追加マスタの再検証などと挙動を揃えるため、同じ経路で検証する
        // headerErrors は revalidate 内で参照される
        const nextRows = aggregatedSourceRows;

        // 一時的に headerErrors state が未反映でも良いように、ここは同等ロジックで即時反映する
        const rowErrs: EmployeeCsvError[] = [];
        const nextValidRows: EmployeeCsvNormalizedRow[] = [];
        const byFile = new Map<string, SourceRowWithMeta[]>();
        for (const item of nextRows) {
          const group = byFile.get(item.fileName) ?? [];
          group.push(item);
          byFile.set(item.fileName, group);
        }

        byFile.forEach((group, currentFileName) => {
          const validation = validateEmployeeCsvRows({
            rows: group.map((item: SourceRowWithMeta) => item.row),
            allowFutureRetirementDate,
          });
          nextValidRows.push(...validation.validRows);
          rowErrs.push(
            ...validation.errors.map((e) => ({
              ...e,
              message: withFilePrefix(currentFileName, e.message),
            }))
          );
        });

        setErrors([...aggregatedHeaderErrors, ...rowErrs]);
        setValidRows(nextValidRows);
        setRowCount(nextRows.length);
      } catch (error) {
        setErrors([
          {
            rowNumber: 0,
            field: "file",
            message: ERROR_MESSAGES.CSV.READ_FAILED_WITH_HINT_DOT,
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
    async (value: string) => {
      if (!sourceRows.length) return;
      setIsProcessing(true);
      try {
        await addDepartmentMaster(value);
        setAddedCatalog((prev) => ({ ...prev, departments: addUnique(prev.departments, value) }));
        revalidate(sourceRows);
      } finally {
        setIsProcessing(false);
      }
    },
    [revalidate, sourceRows]
  );

  const addWorkLocationAndRevalidate = useCallback(
    async (value: string) => {
      if (!sourceRows.length) return;
      setIsProcessing(true);
      try {
        await addClientMaster(value);
        setAddedCatalog((prev) => ({ ...prev, workLocations: addUnique(prev.workLocations, value) }));
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
    reset,
  };
};

export default useEmployeeCsvImport;
