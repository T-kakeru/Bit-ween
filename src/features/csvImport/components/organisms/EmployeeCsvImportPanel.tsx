import { useMemo, useState } from "react";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import TextCaption from "@/shared/ui/TextCaption";
import { ClipboardCopy } from "lucide-react";
import { TableContainer, Table, Th, Td } from "@/shared/ui/Table";
import type { ManagerRow } from "@/features/retirement/types";
import { EMPLOYEE_CSV_HEADER_SPECS } from "../../logic/employeeCsvConstants";
import { mapEmployeeCsvRowsToManagerRows } from "../../logic/employeeCsvMapper";
import useEmployeeCsvImport from "../../hooks/useEmployeeCsvImport";
import { buildEmployeeCsvTemplateText, EMPLOYEE_CSV_TEMPLATE_FILE_NAME } from "../../logic/employeeCsvTemplate";
import CsvFilePicker from "../molecules/CsvFilePicker";
import CsvImportErrorList from "../molecules/CsvImportErrorList";
import { ERROR_MESSAGES } from "@/shared/constants/messages/appMessages";

type EmployeeCsvImportPanelProps = {
  onImportRows: (rows: ManagerRow[]) => Promise<{ ok: true; count?: number } | { ok: false; message: string }>;
  allowFutureRetirementDate?: boolean;
  onAfterImport?: () => void;
  title?: string;
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
  { key: "当時のクライアント", label: "稼働先", isEllipsis: true },
  { key: "退職理由", label: "退職理由" },
];

const EmployeeCsvImportPanel = ({
  onImportRows,
  allowFutureRetirementDate = false,
  onAfterImport,
  title = "従業員CSVインポート",
}: EmployeeCsvImportPanelProps) => {
  const [step, setStep] = useState<Step>("edit");
  const [lastImported, setLastImported] = useState<LastImported | null>(null);
  const [importError, setImportError] = useState("");
  const [isImporting, setIsImporting] = useState(false);

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
    reset,
  } = useEmployeeCsvImport({ allowFutureRetirementDate });

  const mappedRows = useMemo(() => mapEmployeeCsvRowsToManagerRows(validRows), [validRows]);
  const previewNames = useMemo(
    () => mappedRows.map((row) => String((row as any)?.["名前"] ?? "").trim()).filter(Boolean).slice(0, 10),
    [mappedRows]
  );

  const addedCatalogTotal =
    (addedCatalog?.departments?.length ?? 0) +
    (addedCatalog?.workLocations?.length ?? 0);

  const handleGoConfirm = () => {
    if (!canImport) return;
    setImportError("");
    setStep("confirm");
  };

  const handleConfirmImport = async () => {
    if (!canImport) return;
    setIsImporting(true);
    setImportError("");

    try {
      const result = await onImportRows(mappedRows);
      if (!result.ok) {
        setIsImporting(false);
        setImportError(result.message || ERROR_MESSAGES.CSV.IMPORT_FAILED_DOT);
        return;
      }

      setLastImported({ fileName: fileName ?? "(不明)", count: mappedRows.length, previewNames });
      reset();
      setIsImporting(false);
      setStep("success");
      onAfterImport?.();
    } catch (error) {
      setIsImporting(false);
      setImportError(ERROR_MESSAGES.CSV.IMPORT_ERROR);
    }
  };

  const handleClear = () => {
    setStep("edit");
    setLastImported(null);
    setImportError("");
    reset();
  };

  const handleDownloadTemplate = () => {
    const csvWithBom = buildEmployeeCsvTemplateText();
    const blob = new Blob([csvWithBom], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = EMPLOYEE_CSV_TEMPLATE_FILE_NAME;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="manager-import-panel">
      <div className="manager-import-header">
        <div>
          <Heading level={2} className="manager-import-title">
            {title}
          </Heading>
        </div>
      </div>

      <Card className="manager-import-sub-card manager-import-upload-box">
        <Heading level={3} className="manager-import-section-title">CSVファイルをアップロード</Heading>
        <TextCaption className="manager-import-help manager-import-help--in-card">
          Excelで編集したCSVをアップロードし、全行を検証してから取り込みます。
        </TextCaption>
        <div className="manager-import-actions manager-import-actions--stacked">
          <CsvFilePicker
            fileName={fileName}
            inputKey={inputKey}
            buttonLabel="アップロード"
            iconOnly
            disabled={isProcessing}
            onFileChange={(file: File | null) => {
              setStep("edit");
              setLastImported(null);
              handleFileSelect(file);
            }}
          />

          <div className="manager-import-actions-row">
            <Button
              type="button"
              variant="primary"
              size="md"
              className="manager-import-button"
              onClick={handleGoConfirm}
              disabled={!canImport || isProcessing || isImporting}
            >
              取り込み
            </Button>

            <Button
              type="button"
              variant="danger"
              size="md"
              className="manager-import-button settings-cancel-button"
              onClick={handleClear}
              disabled={isProcessing || isImporting}
            >
              クリア
            </Button>
          </div>
        </div>

        <div className="manager-import-summary">
          <TextCaption>
            読み込み行数: {rowCount}件 / 取り込み可能: {validRows.length}件
          </TextCaption>
        </div>
      </Card>

      {step === "confirm" ? (
        <div className="manager-import-confirm">
          <p className="manager-import-confirm-title">この内容で追加してよろしいですか？</p>
          <TextCaption className="manager-import-confirm-meta">
            ファイル: {fileName ?? "(不明)"} / 読み込み: {rowCount}件 / 取り込み: {mappedRows.length}件
          </TextCaption>
          {importError ? <p className="mt-2 text-xs text-rose-600">{importError}</p> : null}

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
              onClick={() => {
                void handleConfirmImport();
              }}
              disabled={isImporting || isProcessing}
            >
              {isImporting ? "取り込み中..." : "この内容で取り込む"}
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

      <Card className="manager-import-sub-card manager-import-guidance manager-import-download-box">
        <Heading level={3} className="manager-import-guidance-title">テンプレートCSVをダウンロード</Heading>

        <div className="manager-import-actions">
          <Button
            type="button"
            variant="outline"
            size="md"
            className="manager-import-button manager-icon-only-button"
            onClick={handleDownloadTemplate}
            disabled={isProcessing}
            aria-label="テンプレートCSVをダウンロード"
            title="テンプレートCSVをダウンロード"
          >
            <ClipboardCopy className="manager-edit-icon" aria-hidden="true" />
          </Button>
        </div>

        <ul className="manager-import-guidance-list">
          {EMPLOYEE_CSV_HEADER_SPECS.map((x) => (
            <li key={x.label} className="manager-import-guidance-item">
              {x.label}
              {x.required ? "（必須）" : "（任意）"}
            </li>
          ))}
        </ul>
        <p className="manager-import-guidance-note">
          ※ヘッダー名は完全一致のみ受け付けます（別名・揺れは不可）。先頭0が必要な項目はExcelで文字列形式に設定してください。文字化けが起きる場合はUTF-8で保存し直してください。
        </p>
      </Card>

      <CsvImportErrorList
        errors={errors}
        isProcessing={isProcessing}
        onAddDepartment={addDepartmentAndRevalidate}
        onAddWorkLocation={addWorkLocationAndRevalidate}
      />
    </section>
  );
};

export default EmployeeCsvImportPanel;
