import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ManagerAddFormValues } from "@/features/addRetirement/logic/validation/managerAdd";
import { managerAddSchema } from "@/features/addRetirement/logic/validation/managerAdd";

export type { ManagerAddFormValues };

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
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<ManagerAddFormValues>({
    resolver: zodResolver(managerAddSchema),// バリデーションにZodスキーマを使用
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: { name: "", gender: "" },
  });

  const hasStatusColumn = useMemo(() => (columns ?? []).some((c) => c.key === "ステータス"), [columns]);

  const canSave = isValid;

  const registerName = register("name", {
    onChange: (event) => {
      const value = String(event?.target?.value ?? "");
      setForm((p) => ({ ...p, "名前": value }));
    },
  });

  // ChipGroupはinputではないので、RHF側にフィールドだけ登録しておく
  register("gender");

  const setName = (value: string) => {
    setForm((p) => ({ ...p, "名前": value }));
    setValue("name", value, { shouldDirty: true, shouldValidate: true });
  };

  return {
    form,
    setForm,
    hasStatusColumn,
    canSave,
    isValid,
    registerName,
    nameError: errors.name?.message,
    genderError: errors.gender?.message,
    handleSubmit,
    setName,
    setGender: (value: ManagerRowInput["性別"]) => {
      setForm((p) => ({ ...p, "性別": value }));
      setValue("gender", String(value ?? ""), { shouldDirty: true, shouldValidate: true });
    },
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
