import type { EmployeeCsvError } from "../../types";
import { EMPLOYEE_CSV_FIELD_LABELS } from "../../logic/employeeCsvConstants";
import Button from "@/shared/ui/Button";

type CsvImportErrorListProps = {
  errors: EmployeeCsvError[];
  isProcessing?: boolean;
  onAddDepartment?: (value: string) => void;
  onAddWorkLocation?: (value: string) => void;
  onAddWorkStatus?: (value: string) => void;
};

const formatLocation = (rowNumber: number) => (rowNumber === 0 ? "ヘッダー" : `${rowNumber}行目`);

const formatFieldLabel = (field: EmployeeCsvError["field"]) => {
  if (field === "row") return "行全体";
  if (field === "file") return "ファイル";
  if (field === "header") return "ヘッダー";
  return EMPLOYEE_CSV_FIELD_LABELS[field] ?? String(field);
};

const CsvImportErrorList = ({
  errors,
  isProcessing = false,
  onAddDepartment,
  onAddWorkLocation,
  onAddWorkStatus,
}: CsvImportErrorListProps) => {
  if (!errors.length) return null;

  const handleAdd = (error: EmployeeCsvError) => {
    const value = String(error.value ?? "").trim();
    if (!value) return;

    if (error.code === "unknownDepartment") onAddDepartment?.(value);
    if (error.code === "unknownWorkLocation") onAddWorkLocation?.(value);
    if (error.code === "unknownWorkStatus") onAddWorkStatus?.(value);
  };

  return (
    <div className="manager-import-errors">
      <p className="manager-import-errors-title">エラー一覧（{errors.length}件）</p>
      <ul className="manager-import-error-list">
        {errors.map((error, index) => (
          <li key={`${error.rowNumber}-${error.field}-${index}`}>
            <span className="manager-import-error-location">{formatLocation(error.rowNumber)}</span>
            <span className="manager-import-error-field">{formatFieldLabel(error.field)}</span>
            <span className="manager-import-error-message">{error.message}</span>

            {(error.code === "unknownDepartment" ||
              error.code === "unknownWorkLocation" ||
              error.code === "unknownWorkStatus") &&
            error.value ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isProcessing}
                onClick={() => handleAdd(error)}
              >
                追加
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CsvImportErrorList;
