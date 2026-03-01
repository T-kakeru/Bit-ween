import Button from "@/shared/ui/Button";
import { ClipboardPaste } from "lucide-react";
import { useRef } from "react";

type CsvFilePickerProps = {
  fileName: string | null;
  inputKey: number;
  buttonLabel?: string;
  disabled?: boolean;
  iconOnly?: boolean;
  multiple?: boolean;
  onFileChange: (files: File[] | null) => void;
};

const CsvFilePicker = ({
  fileName,
  inputKey,
  buttonLabel = "CSVファイルをアップロード",
  disabled = false,
  iconOnly = false,
  multiple = false,
  onFileChange,
}: CsvFilePickerProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="manager-import-file" role="group" aria-label="CSVファイル選択">
      <input
        ref={fileInputRef}
        className="manager-import-file-input"
        key={inputKey}
        type="file"
        accept=".csv,text/csv"
        multiple={multiple}
        disabled={disabled}
        onChange={(event) =>
          onFileChange(event.currentTarget.files ? Array.from(event.currentTarget.files) : null)
        }
      />
      <Button
        type="button"
        variant="outline"
        size="md"
        className={`manager-import-button ${iconOnly ? "manager-icon-only-button" : ""}`}
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        aria-label={buttonLabel}
        title={buttonLabel}
      >
        <ClipboardPaste className="manager-edit-icon" aria-hidden="true" />
        {iconOnly ? null : buttonLabel}
      </Button>
      <span className="manager-import-file-name">{fileName ?? "未選択"}</span>
    </div>
  );
};

export default CsvFilePicker;
