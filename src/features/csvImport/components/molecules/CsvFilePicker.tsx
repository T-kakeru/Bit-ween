import Input from "@/shared/ui/Input";
import type { ChangeEvent } from "react";

type CsvFilePickerProps = {
  fileName: string | null;
  inputKey: number;
  disabled?: boolean;
  onFileChange: (file: File | null) => void;
};

const CsvFilePicker = ({ fileName, inputKey, disabled = false, onFileChange }: CsvFilePickerProps) => {
  return (
    <label className="manager-import-file">
      <span className="manager-import-file-label">CSVを選択</span>
      <Input
        key={inputKey}
        type="file"
        accept=".csv,text/csv"
        disabled={disabled}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onFileChange(event.currentTarget.files?.[0] ?? null)
        }
      />
      <span className="manager-import-file-name">{fileName ?? "未選択"}</span>
    </label>
  );
};

export default CsvFilePicker;
