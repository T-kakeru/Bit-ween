import { useEffect, useMemo, useState } from "react";
import Divider from "@/shared/ui/Divider";
import Button from "@/shared/ui/Button";
import Breadcrumb from "@/shared/components/Breadcrumb";
import { searchUsersByName } from "@/shared/api/usersService";

import useManagerAddForm from "@/features/addRetirement/hooks/useManagerAddForm";
import useManagerAddOptionLists from "@/features/addRetirement/hooks/useManagerAddOptionLists";
import { normalizeManagerAddPayload } from "@/features/addRetirement/logic/normalizeManagerAddPayload";

import {
	FieldDate,
	FieldNumber,
	FieldChipGroup,
	FieldCombobox,
	FieldShell,
	NameField,
} from "@/features/addRetirement/components/molecules";

const GENDER_OPTIONS = ["男性", "女性", "その他"];

const toHyphenDate = (value) => {
	if (!value) return "";
	const raw = String(value).trim();
	if (!raw) return "";
	if (raw.includes("-")) return raw;
	if (raw.includes("/")) {
		const [y, m, d] = raw.split("/");
		if (!y || !m || !d) return "";
		return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
	}
	return "";
};

// organisms: フォーム画面の実装（見た目/入力）を担う
const ManagerAddPage = ({ columns, onCancel, onSave }) => {
	useEffect(() => {
		window.dispatchEvent(new CustomEvent("app:page-title", { detail: "新規従業員登録" }));
		return () => {
			window.dispatchEvent(new CustomEvent("app:page-title", { detail: null }));
		};
	}, []);

	const [employmentMode, setEmploymentMode] = useState("retired");
	const [employeeQuery, setEmployeeQuery] = useState("");
	const [selectedEmployee, setSelectedEmployee] = useState(null);

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
		birthDateError,
		joinDateError,
		retireDateError,
		statusError,
		clientError,
		reasonError,
		educationPointError,
		careerPointError,
		handleSubmit,
		setDefaultValues,
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
	}, [employmentMode]);

	const selectEmployee = (user) => {
		setSelectedEmployee(user);
		setDefaultValues({
			"名前": String(user?.name ?? ""),
			"性別": String(user?.gender ?? ""),
			"生年月日": toHyphenDate(user?.birthDate),
			"入社日": toHyphenDate(user?.joinDate),
			"ステータス": String(user?.status ?? ""),
			"退職日": "",
			"退職理由": "",
		});
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
		<section className="screen manager-screen">
			<div className="mx-auto w-full max-w-2xl px-4 py-6">
				<div className="flex items-center justify-between gap-3">
					<div>
						<div className="mb-1">
							<Breadcrumb
								items={[{ label: "離職者情報一覧", onClick: onCancel }, { label: "新規従業員登録" }]}
							/>
						</div>
					</div>
				</div>

				<form onSubmit={onSubmit} className="mt-6 space-y-8">
					<div className="space-y-5">
						<FieldChipGroup
							label="登録する社員の状態"
							required
							helper="退職者を登録するか、既存（在籍）社員に紐づけて登録するかを選択します"
							value={employmentMode === "retired" ? "退職者" : "在籍"}
							options={["退職者", "在籍"]}
							allowEmpty={false}
							onChange={(v) => {
								if (v === "退職者") {
									setEmploymentMode("retired");
									setEmployeeQuery("");
									setSelectedEmployee(null);
									return;
								}
								setEmploymentMode("active");
								setSelectedEmployee(null);
								setEmployeeQuery("");
								setRetireDate("");
								setReason("");
							}}
						/>

						<Divider className="border-slate-200" />

						{employmentMode === "active" ? (
							<FieldShell
								label="社員を検索する"
								required
								helper="名前で検索して既存（在籍）社員を選択してください"
							>
								<div className="space-y-2">
									<input
										type="text"
										value={employeeQuery}
										onChange={(e) => setEmployeeQuery(e.target.value)}
										placeholder="例）山田"
										className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none"
									/>

									{selectedEmployee ? (
										<div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
											選択中: {String(selectedEmployee?.name ?? "")}
										</div>
									) : null}

									{activeCandidates.length ? (
										<ul className="max-h-44 overflow-auto rounded-lg border border-slate-200 bg-white">
											{activeCandidates.map((u) => (
												<li key={u.id}>
													<button
														type="button"
														onClick={() => selectEmployee(u)}
														className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-slate-900 hover:bg-slate-50"
													>
														<span className="font-medium">{String(u?.name ?? "")}</span>
														<span className="text-xs text-slate-500">{String(u?.status ?? "")}</span>
													</button>
												</li>
											))}
										</ul>
									) : (
										<p className="text-xs text-slate-500">候補がありません</p>
									)}
								</div>
							</FieldShell>
						) : null}
					</div>

					{shouldShowDetails ? (
						<>
							<div className="space-y-5">
								{isFormLocked ? (
									<>
										<FieldShell label="名前" required>
											<input
												type="text"
												value={form["名前"]}
												disabled
												className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400"
											/>
										</FieldShell>
										<FieldShell label="性別">
											<input
												type="text"
												value={form["性別"] || ""}
												disabled
												className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400"
											/>
										</FieldShell>
										<FieldShell label="生年月日">
											<input
												type="text"
												value={form["生年月日"] || ""}
												disabled
												className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400"
											/>
										</FieldShell>
									</>
								) : (
									<>
										<NameField label="名前" register={registerName} errorMessage={nameError} required />
										<FieldChipGroup
											label="性別"
											required
											value={form["性別"]}
											options={GENDER_OPTIONS}
											onChange={setGender}
											allowEmpty={false}
											errorMessage={genderError}
										/>
										<FieldDate
											label="生年月日"
											value={form["生年月日"]}
											onChange={setBirthDate}
											errorMessage={birthDateError}
										/>
									</>
								)}
							</div>

							<Divider className="border-slate-200" />

							<div className="space-y-5">
								{isFormLocked ? (
									<FieldShell label="入社日">
										<input
											type="text"
											value={form["入社日"] || ""}
											disabled
											className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400"
										/>
									</FieldShell>
								) : (
									<FieldDate
										label="入社日"
										value={form["入社日"]}
										onChange={setJoinDate}
										errorMessage={joinDateError}
									/>
								)}

								{employmentMode === "retired" ? (
									<FieldDate
										label="退職日"
										value={form["退職日"]}
										onChange={setRetireDate}
										errorMessage={retireDateError}
									/>
								) : null}

								{isFormLocked ? (
									<FieldShell label="ステータス">
										<input
											type="text"
											value={form["ステータス"] || ""}
											disabled
											className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400"
										/>
									</FieldShell>
								) : (
									<FieldCombobox
										label="ステータス"
										value={form["ステータス"]}
										options={statusOptions}
										onChange={setStatus}
										onAddOption={addStatusOption}
										helper={hasStatusColumn ? "検索して選択 / 新規追加" : "（COLUMNSに無い場合でも保存可能）"}
										placeholder="検索 or 追加"
										errorMessage={statusError}
									/>
								)}

								<FieldCombobox
									label="当時のクライアント"
									value={form["当時のクライアント"]}
									options={clientOptions}
									onChange={setClient}
									onAddOption={addClientOption}
									placeholder="検索 or 追加"
									errorMessage={clientError}
								/>

								{employmentMode === "retired" ? (
									<FieldCombobox
										label="退職理由"
										value={form["退職理由"]}
										options={reasonOptions}
										onChange={setReason}
										onAddOption={addReasonOption}
										placeholder="検索 or 追加"
										errorMessage={reasonError}
									/>
								) : null}
							</div>

							<Divider className="border-slate-200" />

							<div className="space-y-5">
								<FieldNumber
									label="学歴point"
									value={form["学歴point"]}
									onChange={setEducationPoint}
									errorMessage={educationPointError}
								/>
								<FieldNumber
									label="経歴point"
									value={form["経歴point"]}
									onChange={setCareerPoint}
									errorMessage={careerPointError}
								/>
							</div>
						</>
					) : (
						<p className="text-sm text-slate-500">社員を選択すると入力内容が表示されます。</p>
					)}

					<div className="flex items-center justify-end gap-3 pt-2">
						<Button type="button" variant="outline" onClick={onCancel}>
							キャンセル
						</Button>
						<Button type="submit" disabled={!canSubmit}>
							保存する
						</Button>
					</div>
				</form>
			</div>
		</section>
	);
};

export default ManagerAddPage;

