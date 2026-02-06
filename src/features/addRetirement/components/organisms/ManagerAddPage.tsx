import { useMemo, useState } from "react";

import useManagerAddForm from "@/features/addRetirement/hooks/useManagerAddForm";
import type { ManagerColumn, ManagerRowInput } from "@/features/addRetirement/hooks/useManagerAddForm";
import useManagerAddOptionLists from "@/features/addRetirement/hooks/useManagerAddOptionLists";
import { normalizeManagerAddPayload, type ManagerAddPayload } from "@/features/addRetirement/logic/normalizeManagerAddPayload";
import { ManagerAddFormView } from "@/features/addRetirement/components/views/ManagerAddFormView";
import { ManagerAddConfirmView } from "@/features/addRetirement/components/views/ManagerAddConfirmView";
import { ManagerAddCredentialsView } from "@/features/addRetirement/components/views/ManagerAddCredentialsView";
import {
	buildEmployeeCredentials,
	type EmployeeCredentials,
} from "@/features/addRetirement/logic/buildEmployeeCredentials";
import { buildEpisodeBreadcrumbItems } from "@/shared/components/Breadcrumb";

type Props = {
	columns: ManagerColumn[];
	rows: Array<Record<string, any>>;
	onCancel: () => void;
	onSave: (input: ManagerRowInput) => void;
};

const GENDER_OPTIONS: Array<ManagerRowInput["性別"]> = ["男性", "女性", "その他"];

type Step = "form" | "confirm" | "credentials";

// organisms: 機能コンテナ（Hooks/Logic を統合し、Viewへpropsで渡す）

const ManagerAddPage = ({ columns, rows, onCancel, onSave }: Props) => {
	const [step, setStep] = useState<Step>("form");
	const [pendingPayload, setPendingPayload] = useState<ManagerAddPayload | null>(null);
	const [credentials, setCredentials] = useState<EmployeeCredentials | null>(null);

	const { departmentOptions, statusOptions, reasonOptions, clientOptions, addDepartmentOption, addClientOption } =
		useManagerAddOptionLists();

	const {
		form,
		canSave,
		registerName,
		employeeIdError,
		departmentError,
		nameError,
		genderError,
		birthDateError,
		emailError,
		joinDateError,
		retireDateError,
		reasonError,
		statusError,
		clientError,
		educationPointError,
		careerPointError,
		handleSubmit,
		setEmployeeId,
		setDepartment,
		setGender,
		setBirthDate,
		setEmail,
		setJoinDate,
		setRetireDate,
		setStatus,
		setClient,
		setReason,
		setEducationPoint,
		setCareerPoint,
		isActive,
		setIsActive,
	} = useManagerAddForm({ columns, rows });

	// ラベル用のパンくずリストを生成
	const breadcrumbs = useMemo(
		() =>
			buildEpisodeBreadcrumbItems({
				baseItems: [{ label: "社員情報一覧", onClick: onCancel }],
				episodes: [
					{ id: "form", label: "新規従業員登録" },
					{ id: "confirm", label: "登録確認画面" },
					{ id: "credentials", label: "登録完了画面" },
				],
				currentEpisodeId: step,
				onEpisodeClick: (episodeId) => {
					if (episodeId === "form") setStep("form");
					if (episodeId === "confirm") setStep("confirm");
				},
			}),
		[onCancel, step]
	);

	const onSubmit = handleSubmit((values) => {
		if (!canSave) return;
		const payload = normalizeManagerAddPayload(form, values);
		setPendingPayload(payload);
		setStep("confirm");
	});

	// 登録確定時の処理
	const handleConfirm = () => {
		if (!pendingPayload) return;
		onSave(pendingPayload);

		const isEmployeeRegistration = pendingPayload.is_active;
		if (!isEmployeeRegistration) {
			onCancel();
			return;
		}

		const nextCredentials = buildEmployeeCredentials(pendingPayload);
		setCredentials(nextCredentials);
		setStep("credentials");
	};

	if (step === "confirm" && pendingPayload) {
		return (
			<ManagerAddConfirmView
				breadcrumbs={breadcrumbs}
				payload={pendingPayload}
				onBack={() => setStep("form")}
				onConfirm={handleConfirm}
			/>
		);
	}

	if (step === "credentials" && pendingPayload && credentials) {
		return (
			<ManagerAddCredentialsView
				breadcrumbs={breadcrumbs}
				email={credentials.email}
				initialPassword={credentials.initialPassword}
				copyText={credentials.copyText}
				onDone={onCancel}
			/>
		);
	}

	return (
		<ManagerAddFormView
			breadcrumbs={breadcrumbs}
			form={form}
				isActive={isActive}
			registerName={registerName}
			employeeIdError={employeeIdError}
			departmentError={departmentError}
			nameError={nameError}
			genderError={genderError}
			birthDateError={birthDateError}
			emailError={emailError}
			joinDateError={joinDateError}
			retireDateError={retireDateError}
			reasonError={reasonError}
			statusError={statusError}
			clientError={clientError}
			educationPointError={educationPointError}
			careerPointError={careerPointError}
			genderOptions={GENDER_OPTIONS}
			departmentOptions={departmentOptions}
			statusOptions={statusOptions}
			reasonOptions={reasonOptions}
			clientOptions={clientOptions}
			onAddDepartmentOption={addDepartmentOption}
			onAddClientOption={addClientOption}
			onChangeEmployeeId={setEmployeeId}
			onChangeDepartment={setDepartment}
			onChangeGender={(v) => setGender(v as ManagerRowInput["性別"])}
			onChangeBirthDate={setBirthDate}
			onChangeEmail={setEmail}
			onChangeJoinDate={setJoinDate}
			onChangeRetireDate={setRetireDate}
			onChangeStatus={setStatus}
			onChangeClient={setClient}
			onChangeReason={setReason}
			onChangeEducationPoint={setEducationPoint}
			onChangeCareerPoint={setCareerPoint}
				onChangeIsActive={setIsActive}
			canSubmit={canSave}
			onSubmit={onSubmit}
			onCancel={onCancel}
		/>
	);
};

export default ManagerAddPage;
