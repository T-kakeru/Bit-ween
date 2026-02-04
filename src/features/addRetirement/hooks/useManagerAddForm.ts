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
    trigger,
    formState: { errors, isValid },
  } = useForm<ManagerAddFormValues>({
    resolver: zodResolver(managerAddSchema),// バリデーションにZodスキーマを使用
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      gender: "",
      birthDate: "",
      joinDate: "",
      retireDate: "",
      status: "",
      client: "",
      reason: "",
      educationPoint: undefined,
      careerPoint: undefined,
    },
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
  register("birthDate");
  register("joinDate");
  register("retireDate");
  register("status");
  register("client");
  register("reason");
  register("educationPoint");
  register("careerPoint");

  const setName = (value: string) => {
    setForm((p) => ({ ...p, "名前": value }));
    setValue("name", value, { shouldDirty: true, shouldValidate: true });
  };

  // 既存データを初期値として流し込む用途
  // - UI側のform state と RHF を同時に同期
  // - 想定外値が混ざっていても、即エラー表示できるように trigger する
  const setDefaultValues = (next: Partial<ManagerRowInput>) => {
    setForm((p) => ({ ...p, ...next }));

    if (Object.prototype.hasOwnProperty.call(next, "名前")) {
      setValue("name", String(next["名前"] ?? ""), { shouldDirty: false, shouldValidate: true });
    }
    if (Object.prototype.hasOwnProperty.call(next, "性別")) {
      setValue("gender", String(next["性別"] ?? ""), { shouldDirty: false, shouldValidate: true });
    }
    if (Object.prototype.hasOwnProperty.call(next, "生年月日")) {
      setValue("birthDate", String(next["生年月日"] ?? ""), { shouldDirty: false, shouldValidate: true });
    }
    if (Object.prototype.hasOwnProperty.call(next, "入社日")) {
      setValue("joinDate", String(next["入社日"] ?? ""), { shouldDirty: false, shouldValidate: true });
    }
    if (Object.prototype.hasOwnProperty.call(next, "退職日")) {
      setValue("retireDate", String(next["退職日"] ?? ""), { shouldDirty: false, shouldValidate: true });
    }
    if (Object.prototype.hasOwnProperty.call(next, "ステータス")) {
      setValue("status", String(next["ステータス"] ?? ""), { shouldDirty: false, shouldValidate: true });
    }
    if (Object.prototype.hasOwnProperty.call(next, "当時のクライアント")) {
      setValue("client", String(next["当時のクライアント"] ?? ""), { shouldDirty: false, shouldValidate: true });
    }
    if (Object.prototype.hasOwnProperty.call(next, "退職理由")) {
      setValue("reason", String(next["退職理由"] ?? ""), { shouldDirty: false, shouldValidate: true });
    }
    if (Object.prototype.hasOwnProperty.call(next, "学歴point")) {
      const v = next["学歴point"];
      const num = v === "" || v == null ? undefined : Number(v);
      setValue("educationPoint", Number.isFinite(num as number) ? (num as number) : undefined, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
    if (Object.prototype.hasOwnProperty.call(next, "経歴point")) {
      const v = next["経歴point"];
      const num = v === "" || v == null ? undefined : Number(v);
      setValue("careerPoint", Number.isFinite(num as number) ? (num as number) : undefined, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }

    void trigger();
  };

  return {
    form,
    setForm,
    setDefaultValues,
    hasStatusColumn,
    canSave,
    isValid,
    registerName,
    nameError: errors.name?.message,
    genderError: errors.gender?.message,
    birthDateError: errors.birthDate?.message,
    joinDateError: errors.joinDate?.message,
    retireDateError: errors.retireDate?.message,
    statusError: errors.status?.message,
    clientError: errors.client?.message,
    reasonError: errors.reason?.message,
    educationPointError: errors.educationPoint?.message,
    careerPointError: errors.careerPoint?.message,
    handleSubmit,
    setName,
    setGender: (value: ManagerRowInput["性別"]) => {
      setForm((p) => ({ ...p, "性別": value }));
      setValue("gender", String(value ?? ""), { shouldDirty: true, shouldValidate: true });
    },
    setBirthDate: (value: string) => {
      setForm((p) => ({ ...p, "生年月日": value }));
      setValue("birthDate", value, { shouldDirty: true, shouldValidate: true });
      void trigger(["birthDate", "joinDate"]);
    },
    setJoinDate: (value: string) => {
      setForm((p) => ({ ...p, "入社日": value }));
      setValue("joinDate", value, { shouldDirty: true, shouldValidate: true });
      void trigger(["joinDate", "retireDate"]);
    },
    setRetireDate: (value: string) => {
      setForm((p) => ({ ...p, "退職日": value }));
      setValue("retireDate", value, { shouldDirty: true, shouldValidate: true });
      void trigger("retireDate");
    },
    setStatus: (value: string) => {
      setForm((p) => ({ ...p, "ステータス": value }));
      setValue("status", value, { shouldDirty: true, shouldValidate: true });
      void trigger("status");
    },
    setReason: (value: string) => {
      setForm((p) => ({ ...p, "退職理由": value }));
      setValue("reason", value, { shouldDirty: true, shouldValidate: true });
      void trigger("reason");
    },
    setClient: (value: string) => {
      setForm((p) => ({ ...p, "当時のクライアント": value }));
      setValue("client", value, { shouldDirty: true, shouldValidate: true });
      void trigger("client");
    },
    setEducationPoint: (value: number | "") => {
      setForm((p) => ({ ...p, "学歴point": value }));
      setValue("educationPoint", value === "" ? undefined : value, { shouldDirty: true, shouldValidate: true });
      void trigger("educationPoint");
    },
    setCareerPoint: (value: number | "") => {
      setForm((p) => ({ ...p, "経歴point": value }));
      setValue("careerPoint", value === "" ? undefined : value, { shouldDirty: true, shouldValidate: true });
      void trigger("careerPoint");
    },
  };
};

export default useManagerAddForm;
