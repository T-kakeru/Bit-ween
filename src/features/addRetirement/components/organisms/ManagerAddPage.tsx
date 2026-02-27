import { useCallback, useMemo, useRef, useState } from "react";

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
import EmployeeCsvImportPanel from "@/features/csvImport/components/organisms/EmployeeCsvImportPanel";
import type { ManagerRow } from "@/features/retirement/types";
import { createEmployee, importEmployeesFromManagerRows } from "@/services/employee/employeesService";
import { isSupabaseConfigured } from "@/services/common/supabaseClient";
import { ERROR_MESSAGES } from "@/shared/constants/messages/appMessages";

type Props = {
	columns: ManagerColumn[];
	rows: Array<Record<string, any>>;
	onCancel: () => void;
	onSave: (input: Record<string, any>) => void;
	enableCsvImport?: boolean;
	showCredentialsOnComplete?: boolean;
};

const GENDER_OPTIONS: Array<ManagerRowInput["性別"]> = ["男性", "女性", "その他"];

type Step = "form" | "confirm" | "credentials";

// organisms: 機能コンテナ（Hooks/Logic を統合し、Viewへpropsで渡す）

const ManagerAddPage = ({ columns, rows, onCancel, onSave, enableCsvImport = true, showCredentialsOnComplete = false }: Props) => {
	const [step, setStep] = useState<Step>("form");
	const [pendingPayload, setPendingPayload] = useState<ManagerAddPayload | null>(null);
	const [credentials, setCredentials] = useState<EmployeeCredentials | null>(null);
	const csvImportAnchorRef = useRef<HTMLDivElement | null>(null);

	const {
		departmentOptions,
		statusOptions,
		reasonOptions,
		clientOptions,
	} = useManagerAddOptionLists();

	const {
		form,
		canSave,
		registerName,
		employeeIdError,
		departmentError,
		nameError,
		employmentStatusError,
		genderError,
		birthDateError,
		joinDateError,
		retireDateError,
		reasonError,
		remarkError,
		statusError,
		clientError,
		handleSubmit,
		setEmployeeId,
		setDepartment,
		setGender,
		setBirthDate,
		setJoinDate,
		setEmploymentStatus,
		setRetireDate,
		setStatus,
		setClient,
		setReason,
		setRemark,
	} = useManagerAddForm({ columns, rows });

	// ラベル用のパンくずリストを生成
	const breadcrumbs = useMemo(
		() =>
			buildEpisodeBreadcrumbItems({
				baseItems: [{ label: "社員情報管理", onClick: onCancel }],
				episodes: showCredentialsOnComplete
					? [
						{ id: "form", label: "新規従業員登録" },
						{ id: "confirm", label: "登録確認画面" },
						{ id: "credentials", label: "登録完了画面" },
					]
					: [
						{ id: "form", label: "新規従業員登録" },
						{ id: "confirm", label: "登録確認画面" },
					],
				currentEpisodeId: step,
				onEpisodeClick: (episodeId) => {
					if (episodeId === "form") setStep("form");
					if (episodeId === "confirm") setStep("confirm");
				},
			}),
		[onCancel, showCredentialsOnComplete, step]
	);

	const onSubmit = handleSubmit((values) => {
		if (!canSave) return;
		const payload = normalizeManagerAddPayload(form, values);
		setPendingPayload(payload);
		setStep("confirm");
	}, () => {
		// 無効時でもエラーを表示する
	});

	const handleScrollToCsvImport = useCallback(() => {
		csvImportAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
	}, []);

	const handleImportRows = useCallback(
		async (importedRows: ManagerRow[]) => {
			const result = await importEmployeesFromManagerRows(importedRows);
			if (!result.ok) return result;

			for (const row of importedRows) {
				onSave(row as any);
			}

			return { ok: true as const, count: result.count ?? importedRows.length };
		},
		[onSave]
	);
	// CSVインポート後の処理（完了画面への遷移や、完了画面を表示しない場合はフォームにスクロールする）
	const handleAfterCsvImport = useCallback(() => {
		try {
			window.sessionStorage.setItem(
				"managerSortPreset",
				JSON.stringify({ key: "入社日", direction: "desc" })
			);
		} catch {
			// 何もしない（sessionStorageが使えない環境でも登録自体は成功しているため）
		}
		onCancel();
	}, [onCancel]);

	// 登録確定時の処理
	const handleConfirm = async () => {
		if (!pendingPayload) return;

		if (!isSupabaseConfigured()) {
			onSave(pendingPayload);

			if (!showCredentialsOnComplete) {
				onCancel();
				return;
			}

			const nextCredentials = buildEmployeeCredentials(pendingPayload);
			setCredentials(nextCredentials);
			setStep("credentials");
			return;
		}

		const result = await createEmployee({
			employeeCode: String(pendingPayload["社員ID"] ?? "").trim(),
			fullName: String(pendingPayload["名前"] ?? "").trim(),
			gender: String(pendingPayload["性別"] ?? "").trim() || null,
			birthDate: String(pendingPayload["生年月日"] ?? "").trim() || null,
			joinDate: String(pendingPayload["入社日"] ?? "").trim() || null,
			retireDate: String(pendingPayload["退職日"] ?? "").trim() || null,
			departmentName: String(pendingPayload["部署"] ?? "").trim(),
			workStatusName: String(pendingPayload["ステータス"] ?? "").trim(),
			clientName: String(pendingPayload["当時のクライアント"] ?? "").trim() || null,
			retirementReasonName: String(pendingPayload["退職理由"] ?? "").trim() || null,
			retirementReasonText: String(pendingPayload["退職理由"] ?? "").trim() || null,
		});

		if (!result.ok) {
			window.alert(result.message || ERROR_MESSAGES.EMPLOYEE.UI_CREATE_FAILED_DOT);
			return;
		}

		onSave(result.employee ?? pendingPayload);

		// 社員情報登録では完了画面（初期パスワード）は表示しない
		if (!showCredentialsOnComplete) {
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
				showCredentialsHint={showCredentialsOnComplete}
			/>
		);
	}

	if (step === "credentials" && pendingPayload && credentials) {
		return (
			<ManagerAddCredentialsView
				breadcrumbs={breadcrumbs}
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
			csvImportSection={
				enableCsvImport ? (
					<div ref={csvImportAnchorRef}>
						<EmployeeCsvImportPanel title="一括登録" onImportRows={handleImportRows} onAfterImport={handleAfterCsvImport} />
					</div>
				) : undefined
			}
			registerName={registerName}
			employeeIdError={employeeIdError}
			departmentError={departmentError}
			nameError={nameError}
			employmentStatusError={employmentStatusError}
			genderError={genderError}
			birthDateError={birthDateError}
			joinDateError={joinDateError}
			retireDateError={retireDateError}
			statusError={statusError}
			clientError={clientError}
			reasonError={reasonError}
			remarkError={remarkError}
			genderOptions={GENDER_OPTIONS}
			departmentOptions={departmentOptions}
			statusOptions={statusOptions}
			reasonOptions={reasonOptions}
			clientOptions={clientOptions}
			onChangeEmployeeId={setEmployeeId}
			onChangeDepartment={setDepartment}
			onChangeGender={(v) => setGender(v as ManagerRowInput["性別"])}
			onChangeBirthDate={setBirthDate}
			onChangeJoinDate={setJoinDate}
			onChangeEmploymentStatus={(v) => setEmploymentStatus(v as ManagerRowInput["在籍状態"])}
			onChangeRetireDate={setRetireDate}
			onChangeStatus={setStatus}
			onChangeClient={setClient}
			onChangeReason={setReason}
			onChangeRemark={setRemark}
			canSubmit={canSave}
			onSubmit={onSubmit}
			onCancel={onCancel}
		/>
	);
};

export default ManagerAddPage;
