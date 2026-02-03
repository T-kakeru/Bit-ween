import { useEffect, useMemo, useState } from "react";
import { searchUsersByName, type UserProfile } from "@/shared/api/usersService";

import useManagerAddForm from "@/features/addRetirement/hooks/useManagerAddForm";
import type { ManagerColumn, ManagerRowInput } from "@/features/addRetirement/hooks/useManagerAddForm";
import useManagerAddOptionLists from "@/features/addRetirement/hooks/useManagerAddOptionLists";
import { normalizeManagerAddPayload } from "@/features/addRetirement/logic/normalizeManagerAddPayload";
import { ManagerAddFormView } from "@/features/addRetirement/components/views/ManagerAddFormView";

type Props = {
	columns: ManagerColumn[];
	onCancel: () => void;
	onSave: (input: ManagerRowInput) => void;
};

const GENDER_OPTIONS: Array<ManagerRowInput["性別"]> = ["男性", "女性", "その他"];

type EmploymentMode = "retired" | "active";

const toHyphenDate = (value: any): string => {
	if (!value) return "";
	const raw = String(value).trim();
	if (!raw) return "";
	if (raw.includes("-")) return raw;
	if (raw.includes("/")) {
		const [y, m, d] = raw.split("/");
		if (!y || !m || !d) return "";
		return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
	}
	return "";
};

// organisms: 機能コンテナ（Hooks/Logic を統合し、Viewへpropsで渡す）
const ManagerAddPage = ({ columns, onCancel, onSave }: Props) => {
	const [employmentMode, setEmploymentMode] = useState<EmploymentMode>("retired");
	const [employeeQuery, setEmployeeQuery] = useState("");
	const [selectedEmployee, setSelectedEmployee] = useState<UserProfile | null>(null);

	const {
		statusOptions,
		reasonOptions,
		clientOptions,
		addStatusOption,
		addReasonOption,
		addClientOption,
	} = useManagerAddOptionLists();

	const {
		form,
		hasStatusColumn,
		canSave,
		registerName,
		nameError,
		genderError,
		handleSubmit,
		setName,
		setGender,
		setBirthDate,
		setJoinDate,
		setRetireDate,
		setStatus,
		setClient,
		setReason,
		setEducationPoint,
		setCareerPoint,
	} = useManagerAddForm({ columns });

	const activeCandidates = useMemo(() => {
		return searchUsersByName(employeeQuery, { limit: 10, activeOnly: true });
	}, [employeeQuery]);

	useEffect(() => {
		// 在籍モードでは退職関連は常に「なし」
		if (employmentMode !== "active") return;
		setRetireDate("");
		setReason("");
	}, [employmentMode, setReason, setRetireDate]);

	const selectEmployee = (user: UserProfile) => {
		setSelectedEmployee(user);
		setName(String(user?.name ?? ""));
		setGender((String(user?.gender ?? "") as any) || "");
		setBirthDate(toHyphenDate(user?.birthDate));
		setJoinDate(toHyphenDate(user?.joinDate));
		// 既存社員は基本的にread-only表示（紐づけ）なので、ステータスも固定値で表示
		setStatus(String(user?.status ?? ""));
		setRetireDate("");
		setReason("");
	};

	const isFormLocked = employmentMode === "active";
	const canSubmit = employmentMode === "active" ? Boolean(selectedEmployee) && canSave : canSave;
	const shouldShowDetails = employmentMode === "retired" || Boolean(selectedEmployee);

	const onSubmit = handleSubmit((values) => {
		if (!canSubmit) return;
		const payload = normalizeManagerAddPayload(form, values);
		onSave(payload);
	});

	return (
		<ManagerAddFormView
			breadcrumbs={[{ label: "離職者情報一覧", onClick: onCancel }, { label: "新規従業員登録" }]}
			employmentMode={employmentMode}
			onChangeEmploymentMode={(next) => {
				setEmploymentMode(next);
				setEmployeeQuery("");
				setSelectedEmployee(null);
				if (next === "active") {
					setRetireDate("");
					setReason("");
				}
			}}
			employeeQuery={employeeQuery}
			onChangeEmployeeQuery={setEmployeeQuery}
			selectedEmployee={selectedEmployee}
			activeCandidates={activeCandidates}
			onSelectEmployee={selectEmployee}
			shouldShowDetails={shouldShowDetails}
			isFormLocked={isFormLocked}
			form={form}
			registerName={registerName}
			nameError={nameError}
			genderError={genderError}
			genderOptions={GENDER_OPTIONS}
			onChangeGender={(v) => setGender(v as ManagerRowInput["性別"])}
			onChangeBirthDate={setBirthDate}
			onChangeJoinDate={setJoinDate}
			onChangeRetireDate={setRetireDate}
			statusOptions={statusOptions}
			reasonOptions={reasonOptions}
			clientOptions={clientOptions}
			onAddStatusOption={addStatusOption}
			onAddReasonOption={addReasonOption}
			onAddClientOption={addClientOption}
			hasStatusColumn={hasStatusColumn}
			onChangeStatus={setStatus}
			onChangeClient={setClient}
			onChangeReason={setReason}
			onChangeEducationPoint={setEducationPoint}
			onChangeCareerPoint={setCareerPoint}
			canSubmit={canSubmit}
			onSubmit={onSubmit}
			onCancel={onCancel}
		/>
	);
};

export default ManagerAddPage;
