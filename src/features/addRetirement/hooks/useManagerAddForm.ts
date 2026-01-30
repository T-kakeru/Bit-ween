import { useMemo, useState } from "react";

// 今回はファイル内で完結（Omit<ManagerRow, "id"> 相当をここで定義）
// ※ manager/types の ManagerRow は any 寄りなので、理解しやすい形に寄せています。
export type ManagerRowInput = {
  "名前": string;
  "性別": "男性" | "女性" | "その他" | "";
  "生年月日": string; // input: YYYY-MM-DD
  "入社日": string; // input: YYYY-MM-DD
  "退職日": string; // input: YYYY-MM-DD
  "ステータス": string;
  "退職理由": string;
  "当時のクライアント": string;
  "学歴point": number | "";
  "経歴point": number | "";
};

export type ManagerColumn = {
  key: string;
  label?: string;
  type?: string;
};

type UseManagerAddFormArgs = {
  columns: ManagerColumn[];
};

const createInitialForm = (): ManagerRowInput => ({
  "名前": "",
  "性別": "",
  "生年月日": "",
  "入社日": "",
  "退職日": "",
  "ステータス": "",
  "退職理由": "",
  "当時のクライアント": "",
  "学歴point": "",
  "経歴point": "",
});

const useManagerAddForm = ({ columns }: UseManagerAddFormArgs) => {
  const [form, setForm] = useState<ManagerRowInput>(() => createInitialForm());

  const hasStatusColumn = useMemo(() => (columns ?? []).some((c) => c.key === "ステータス"), [columns]);

  const canSave = String(form["名前"] || "").trim().length > 0;

  return {
    form,
    setForm,
    hasStatusColumn,
    canSave,
    setName: (value: string) => setForm((p) => ({ ...p, "名前": value })),
    setGender: (value: ManagerRowInput["性別"]) => setForm((p) => ({ ...p, "性別": value })),
    setBirthDate: (value: string) => setForm((p) => ({ ...p, "生年月日": value })),
    setJoinDate: (value: string) => setForm((p) => ({ ...p, "入社日": value })),
    setRetireDate: (value: string) => setForm((p) => ({ ...p, "退職日": value })),
    setStatus: (value: string) => setForm((p) => ({ ...p, "ステータス": value })),
    setReason: (value: string) => setForm((p) => ({ ...p, "退職理由": value })),
    setClient: (value: string) => setForm((p) => ({ ...p, "当時のクライアント": value })),
    setEducationPoint: (value: number | "") => setForm((p) => ({ ...p, "学歴point": value })),
    setCareerPoint: (value: number | "") => setForm((p) => ({ ...p, "経歴point": value })),
  };
};

export default useManagerAddForm;
