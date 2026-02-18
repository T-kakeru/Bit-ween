import Button from "@/shared/ui/Button";
import { useRef } from "react";

type CsvFilePickerProps = {
  fileName: string | null;
  inputKey: number;
  disabled?: boolean;
  onFileChange: (file: File | null) => void;
};

const CsvFilePicker = ({ fileName, inputKey, disabled = false, onFileChange }: CsvFilePickerProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="manager-import-file" role="group" aria-label="CSVファイル選択">
      <span className="manager-import-file-label">CSVファイルをアップロード</span>
      <input
        ref={fileInputRef}
        className="manager-import-file-input"
        key={inputKey}
        type="file"
        accept=".csv,text/csv"
        disabled={disabled}
        onChange={(event) =>
          onFileChange(event.currentTarget.files?.[0] ?? null)
        }
      />
      <Button
        type="button"
        variant="outline"
        size="md"
        className="manager-import-button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
      >
        CSVファイルをアップロード
      </Button>
      <span className="manager-import-file-name">{fileName ?? "未選択"}</span>
    </div>
  );
};

export default CsvFilePicker;
