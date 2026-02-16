import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ManagerAddFormValues } from "@/features/addRetirement/logic/validation/managerAdd";
import { managerAddMessages, managerAddSchema } from "@/features/addRetirement/logic/validation/managerAdd";
import { buildNextEmployeeIdByJoinYear } from "@/features/addRetirement/logic/employeeId/buildNextEmployeeIdByJoinYear";

export type { ManagerAddFormValues };

// 今回はファイル内で完結（Omit<ManagerRow, "id"> 相当をここで定義）
// ※ manager/types の ManagerRow は any 寄りなので、理解しやすい形に寄せています。
export type ManagerRowInput = {
  "社員ID": string;
  "部署": string;
  "名前": string;
  "性別": "男性" | "女性" | "その他" | "";
  "生年月日": string; // input: YYYY-MM-DD
  "入社日": string; // input: YYYY-MM-DD
  "退職日": string; // input: YYYY-MM-DD
  "ステータス": string;
  "退職理由": string;
  "備考": string;
  "当時のクライアント": string;
};

export type ManagerColumn = {
  key: string;
  label?: string;
  type?: string;
};

type UseManagerAddFormArgs = {
  columns: ManagerColumn[];
  rows: Array<Record<string, any>>;
};

const createInitialForm = (employeeId: string): ManagerRowInput => ({
  "社員ID": employeeId,
  "部署": "",
  "名前": "",
  "性別": "",
  "生年月日": "",
  "入社日": "",
  "退職日": "",
  "ステータス": "",
  "退職理由": "",
  "備考": "",
  "当時のクライアント": "",
});

const useManagerAddForm = ({ columns, rows }: UseManagerAddFormArgs) => {
  const initialEmployeeId = useMemo(
    () => buildNextEmployeeIdByJoinYear({ rows, joinDate: "", today: new Date(), preferHyphen: true }),
    [rows]
  );
  const initialForm = useMemo(() => createInitialForm(initialEmployeeId), [initialEmployeeId]);
  const initialEmployeeIdRef = useRef(initialEmployeeId);

  const existingEmployeeIdSet = useMemo(() => {
    const set = new Set<string>();
    for (const row of rows ?? []) {
      const v = String((row as any)?.["社員ID"] ?? "").trim();
      if (!v || v === "-") continue;
      set.add(v);
    }
    return set;
  }, [rows]);

  const [form, setForm] = useState<ManagerRowInput>(() => initialForm);
  const [isActive, setIsActiveState] = useState<boolean | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<ManagerAddFormValues>({
    resolver: zodResolver(managerAddSchema),// バリデーションにZodスキーマを使用
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      isActive: null,
      employeeId: initialForm["社員ID"],
      department: initialForm["部署"],
      name: initialForm["名前"],
      gender: initialForm["性別"],
      birthDate: initialForm["生年月日"],
      joinDate: initialForm["入社日"],
      retireDate: initialForm["退職日"],
      retireReason: initialForm["退職理由"],
      remark: initialForm["備考"],
      workStatus: initialForm["ステータス"],
      client: initialForm["当時のクライアント"],
    },
  });

  const hasStatusColumn = useMemo(() => (columns ?? []).some((c) => c.key === "ステータス"), [columns]);

  const canSave = isValid;

  // RHFにフィールド登録（ChipGroup/Controlled Inputでもスキーマ検証を回すため）
  register("isActive");
  register("employeeId");
  register("department");
  register("birthDate");
  register("joinDate");
  register("retireDate");
  register("retireReason");
  register("remark");
  register("workStatus");
  register("client");

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

  const updateAutoEmployeeIdIfNeeded = (nextJoinDate: string) => {
    const current = String(form["社員ID"] ?? "").trim();
    const isAuto = !current || current === initialEmployeeIdRef.current;
    if (!isAuto) return;

    const nextId = buildNextEmployeeIdByJoinYear({ rows, joinDate: nextJoinDate, today: new Date(), preferHyphen: true });
    initialEmployeeIdRef.current = nextId;
    setForm((p) => ({ ...p, "社員ID": nextId }));
    setValue("employeeId", nextId, { shouldDirty: true, shouldValidate: true });
  };

  useEffect(() => {
    const current = String(form["社員ID"] ?? "").trim();
    if (!current) {
      clearErrors("employeeId");
      return;
    }
    if (current === initialEmployeeIdRef.current) {
      // 初期採番値は重複対象外（生成時は既存setに含めない想定）
      clearErrors("employeeId");
      return;
    }
    if (existingEmployeeIdSet.has(current)) {
      setError("employeeId", { type: "custom", message: managerAddMessages.employeeIdDuplicate });
      return;
    }
    if (errors.employeeId?.type === "custom") {
      clearErrors("employeeId");
    }
  }, [clearErrors, errors.employeeId?.type, existingEmployeeIdSet, form, setError]);

  return {
    form,
    setForm,
    isActive,
    hasStatusColumn,
    canSave,
    isValid,
    registerName,
    employeeIdError: errors.employeeId?.message,
    departmentError: errors.department?.message,
    nameError: errors.name?.message,
    genderError: errors.gender?.message,
    birthDateError: errors.birthDate?.message,
    joinDateError: errors.joinDate?.message,
    retireDateError: errors.retireDate?.message,
    isActiveError: errors.isActive?.message,
    reasonError: errors.retireReason?.message,
    remarkError: (errors as any).remark?.message,
    statusError: errors.workStatus?.message,
    clientError: errors.client?.message,
    handleSubmit,
    setEmployeeId: (value: string) => {
      setForm((p) => ({ ...p, "社員ID": value }));
      setValue("employeeId", value, { shouldDirty: true, shouldValidate: true });
    },
    setDepartment: (value: string) => {
      setForm((p) => ({ ...p, "部署": value }));
      setValue("department", value, { shouldDirty: true, shouldValidate: true });
    },
    setName,
    setGender: (value: ManagerRowInput["性別"]) => {
      setForm((p) => ({ ...p, "性別": value }));
      setValue("gender", String(value ?? ""), { shouldDirty: true, shouldValidate: true });
    },
    setBirthDate: (value: string) => {
      setForm((p) => ({ ...p, "生年月日": value }));
      setValue("birthDate", value, { shouldDirty: true, shouldValidate: true });
    },
    setJoinDate: (value: string) => {
      setForm((p) => ({ ...p, "入社日": value }));
      setValue("joinDate", value, { shouldDirty: true, shouldValidate: true });

      // 社員IDを手動変更していない場合のみ、入社年 + 連番で採番を更新
      updateAutoEmployeeIdIfNeeded(value);
    },
    setRetireDate: (value: string) => {
      setForm((p) => {
        // 退職日を消したら、退職理由も一緒にクリア（UI/バリデーション整合）
        if (!value) return { ...p, "退職日": "", "退職理由": "" };
        return { ...p, "退職日": value };
      });
      setValue("retireDate", value, { shouldDirty: true, shouldValidate: true });
      if (!value) {
        setValue("retireReason", "", { shouldDirty: true, shouldValidate: true });
      }
    },
    setStatus: (value: string) => {
      setForm((p) => ({ ...p, "ステータス": value }));
      setValue("workStatus", value, { shouldDirty: true, shouldValidate: true });
    },
    setReason: (value: string) => {
      setForm((p) => ({ ...p, "退職理由": value }));
      setValue("retireReason", value, { shouldDirty: true, shouldValidate: true });
    },
    setRemark: (value: string) => {
      setForm((p) => ({ ...p, "備考": value }));
      setValue("remark", value, { shouldDirty: true, shouldValidate: true });
    },
    setClient: (value: string) => {
      setForm((p) => ({ ...p, "当時のクライアント": value }));
      setValue("client", value, { shouldDirty: true, shouldValidate: true });
    },

    setIsActive: (next: boolean) => {
      setIsActiveState(next);
      setValue("isActive", next, { shouldDirty: true, shouldValidate: true });

      // 在籍中へ戻した場合は、退職項目をフォームから外す（非表示でも残っていると誤エラーになり得る）
      if (next) {
        setForm((p) => ({ ...p, "退職日": "", "退職理由": "", "備考": "" }));
        setValue("retireDate", "", { shouldDirty: true, shouldValidate: true });
        setValue("retireReason", "", { shouldDirty: true, shouldValidate: true });
        setValue("remark", "", { shouldDirty: true, shouldValidate: true });
      }
    },
  };
};

export default useManagerAddForm;
