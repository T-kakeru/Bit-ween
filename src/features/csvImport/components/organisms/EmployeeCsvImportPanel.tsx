import { useMemo, useState } from "react";
import Button from "@/shared/ui/Button";
import TextCaption from "@/shared/ui/TextCaption";
import { TableContainer, Table, Th, Td } from "@/shared/ui/Table";
import type { ManagerRow } from "@/features/retirement/types";
import { CSV_HEADER_HINTS } from "../../logic/employeeCsvConstants";
import { mapEmployeeCsvRowsToManagerRows } from "../../logic/employeeCsvMapper";
import useEmployeeCsvImport from "../../hooks/useEmployeeCsvImport";
import CsvFilePicker from "../molecules/CsvFilePicker";
import CsvImportErrorList from "../molecules/CsvImportErrorList";

type EmployeeCsvImportPanelProps = {
  onImportRows: (rows: ManagerRow[]) => void;
  allowFutureRetirementDate?: boolean;
  onAfterImport?: () => void;
};

type Step = "edit" | "confirm" | "success";

type LastImported = {
  fileName: string;
  count: number;
  previewNames: string[];
};

const CONFIRM_TABLE_COLUMNS: Array<{ key: keyof ManagerRow; label: string; isEllipsis?: boolean }> = [
  { key: "社員ID", label: "社員ID" },
  { key: "名前", label: "氏名" },
  { key: "性別", label: "性別" },
  { key: "部署", label: "部署" },
  { key: "入社日", label: "入社日" },
  { key: "退職日", label: "退職日" },
  { key: "ステータス", label: "稼働状態" },
  { key: "当時のクライアント", label: "当時の稼働先", isEllipsis: true },
  { key: "退職理由", label: "退職理由" },
];

const EmployeeCsvImportPanel = ({
  onImportRows,
  allowFutureRetirementDate = false,
  onAfterImport,
}: EmployeeCsvImportPanelProps) => {
  const [step, setStep] = useState<Step>("edit");
  const [lastImported, setLastImported] = useState<LastImported | null>(null);

  const {
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
  } = useEmployeeCsvImport({ allowFutureRetirementDate });

  const mappedRows = useMemo(() => mapEmployeeCsvRowsToManagerRows(validRows), [validRows]);
  const previewNames = useMemo(
    () => mappedRows.map((row) => String((row as any)?.["名前"] ?? "").trim()).filter(Boolean).slice(0, 10),
    [mappedRows]
  );

  const addedCatalogTotal =
    (addedCatalog?.departments?.length ?? 0) +
    (addedCatalog?.workStatuses?.length ?? 0) +
    (addedCatalog?.workLocations?.length ?? 0);

  const handleGoConfirm = () => {
    if (!canImport) return;
    setStep("confirm");
  };

  const handleConfirmImport = () => {
    if (!canImport) return;
    onImportRows(mappedRows);
    setLastImported({ fileName: fileName ?? "(不明)", count: mappedRows.length, previewNames });
    reset();
    setStep("success");
    onAfterImport?.();
  };

  const handleClear = () => {
    setStep("edit");
    setLastImported(null);
    reset();
  };

  return (
    <section className="manager-import-panel">
      <div className="manager-import-header">
        <div>
          <h3 className="manager-import-title">従業員CSVインポート</h3>
          <TextCaption className="manager-import-help">
            Excelで編集したCSVをアップロードし、全行を検証してから取り込みます。
          </TextCaption>
        </div>

        <div className="manager-import-actions">
          <CsvFilePicker
            fileName={fileName}
            inputKey={inputKey}
            disabled={isProcessing}
            onFileChange={(file: File | null) => {
              setStep("edit");
              setLastImported(null);
              handleFileSelect(file);
            }}
          />

          <Button
            type="button"
            variant="primary"
            size="md"
            className="manager-import-button"
            onClick={handleGoConfirm}
            disabled={!canImport || isProcessing}
          >
            取り込み
          </Button>

          <Button
            type="button"
            variant="outline"
            size="md"
            className="manager-import-button"
            onClick={handleClear}
            disabled={isProcessing}
          >
            クリア
          </Button>
        </div>
      </div>

      {step === "confirm" ? (
        <div className="manager-import-confirm">
          <p className="manager-import-confirm-title">この内容で追加してよろしいですか？</p>
          <TextCaption className="manager-import-confirm-meta">
            ファイル: {fileName ?? "(不明)"} / 読み込み: {rowCount}件 / 取り込み: {mappedRows.length}件
          </TextCaption>

          {addedCatalogTotal > 0 ? (
            <div className="manager-import-confirm-added" aria-label="追加されるマスタの案内">
              <p className="manager-import-confirm-added-title">今回、次のマスタも追加されます</p>
              <TextCaption className="manager-import-confirm-added-meta">
                CSVの未知値を「追加」したものです（設定画面から後で編集できます）。
              </TextCaption>

              <div className="manager-import-confirm-added-grid">
                {addedCatalog.departments.length > 0 ? (
                  <div>
                    <p className="manager-import-confirm-added-label">部署（{addedCatalog.departments.length}件）</p>
                    <ul className="manager-import-confirm-added-list">
                      {addedCatalog.departments.map((v) => (
                        <li key={`dep-${v}`}>{v}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {addedCatalog.workStatuses.length > 0 ? (
                  <div>
                    <p className="manager-import-confirm-added-label">稼働状態（{addedCatalog.workStatuses.length}件）</p>
                    <ul className="manager-import-confirm-added-list">
                      {addedCatalog.workStatuses.map((v) => (
                        <li key={`ws-${v}`}>{v}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {addedCatalog.workLocations.length > 0 ? (
                  <div>
                    <p className="manager-import-confirm-added-label">稼働先（{addedCatalog.workLocations.length}件）</p>
                    <ul className="manager-import-confirm-added-list">
                      {addedCatalog.workLocations.map((v) => (
                        <li key={`wl-${v}`}>{v}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          <TextCaption className="manager-import-confirm-preview">
            プレビュー（全{mappedRows.length}件）※上下・左右にスクロールして確認できます
          </TextCaption>

          <TableContainer className="manager-import-preview-wrap" role="region" aria-label="取り込みプレビュー">
            <Table className="manager-import-preview-table">
              <thead>
                <tr>
                  {CONFIRM_TABLE_COLUMNS.map((c) => (
                    <Th key={String(c.key)} scope="col">
                      {c.label}
                    </Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mappedRows.map((row) => (
                  <tr key={String(row.id)}>
                    {CONFIRM_TABLE_COLUMNS.map((c) => {
                      const raw = (row as any)?.[c.key];
                      const value = raw == null || String(raw).trim() === "" ? "-" : String(raw);
                      return (
                        <Td key={`${String(row.id)}-${String(c.key)}`}>
                          {c.isEllipsis ? (
                            <span className="manager-import-preview-ellipsis">{value}</span>
                          ) : (
                            value
                          )}
                        </Td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableContainer>

          <div className="manager-import-confirm-actions">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setStep("edit")}
              disabled={isProcessing}
            >
              戻る
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleConfirmImport}
              disabled={!canImport || isProcessing}
            >
              この内容で取り込む
            </Button>
          </div>
        </div>
      ) : null}

      {step === "success" && lastImported ? (
        <div className="manager-import-success">
          <p className="manager-import-success-title">取り込みが完了しました</p>
          <TextCaption>
            ファイル: {lastImported.fileName} / 取り込み: {lastImported.count}件
          </TextCaption>
        </div>
      ) : null}

      <div className="manager-import-guidance">
        <p className="manager-import-guidance-title">推奨ヘッダー（順不同）</p>
        <ul className="manager-import-guidance-list">
          {CSV_HEADER_HINTS.map((header) => (
            <li key={header} className="manager-import-guidance-item">
              {header}
            </li>
          ))}
        </ul>
        <p className="manager-import-guidance-note">
          先頭0が必要な項目はExcelで文字列形式に設定してください。文字化けが起きる場合はUTF-8で保存し直してください。
        </p>
      </div>

      <div className="manager-import-summary">
        <TextCaption>
          読み込み行数: {rowCount}件 / 取り込み可能: {validRows.length}件
        </TextCaption>
      </div>

      <CsvImportErrorList
        errors={errors}
        isProcessing={isProcessing}
        onAddDepartment={addDepartmentAndRevalidate}
        onAddWorkLocation={addWorkLocationAndRevalidate}
        onAddWorkStatus={addWorkStatusAndRevalidate}
      />
    </section>
  );
};

export default EmployeeCsvImportPanel;
