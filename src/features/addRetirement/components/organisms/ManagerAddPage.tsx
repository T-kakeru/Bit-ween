import type { FormEvent } from "react";
import Heading from "@/shared/ui/Heading";
import Divider from "@/shared/ui/Divider";
import Button from "@/shared/ui/Button";

import useManagerAddForm from "@/features/addRetirement/hooks/useManagerAddForm";
import type { ManagerColumn, ManagerRowInput } from "@/features/addRetirement/hooks/useManagerAddForm";
import useManagerAddOptionLists from "@/features/addRetirement/hooks/useManagerAddOptionLists";

import {
	FieldText,
	FieldDate,
	FieldNumber,
	FieldChipGroup,
	FieldCombobox,
} from "@/features/addRetirement/components/molecules";


type Props = {
	columns: ManagerColumn[];
	onCancel: () => void;
	onSave: (input: ManagerRowInput) => void;
};

const GENDER_OPTIONS: Array<ManagerRowInput["性別"]> = ["男性", "女性", "その他"];

// organisms: フォーム画面の実装（見た目/入力）を担う
const ManagerAddPage = ({ columns, onCancel, onSave }: Props) => {
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

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (!canSave) return;
		onSave(form);
	};

	return (
		<section className="screen manager-screen">
			<div className="mx-auto w-full max-w-2xl px-4 py-6">
				<div className="flex items-center justify-between gap-3">
					<div>
						<nav className="text-sm mb-1" aria-label="Breadcrumb">
							<button
								type="button"
								onClick={onCancel}
								className="text-emerald-600 hover:text-emerald-800 font-medium"
							>
								管理画面
							</button>
							<span className="px-2 text-slate-400">›</span>
							<span className="text-emerald-800 font-semibold">新規登録</span>
						</nav>
						<Heading level={1} className="text-[22px] font-bold">
							新規従業員の登録
						</Heading>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="mt-6 space-y-8">
					<div className="space-y-5">
						<FieldText label="名前" value={form["名前"]} onChange={setName} required />

						<FieldChipGroup
							label="性別"
							value={form["性別"]}
							options={GENDER_OPTIONS}
							onChange={(v: string) => setGender(v as ManagerRowInput["性別"])}
						/>

						<FieldDate label="生年月日" value={form["生年月日"]} onChange={setBirthDate} />
					</div>

					<Divider className="border-slate-200" />

					<div className="space-y-5">
						<FieldDate label="入社日" value={form["入社日"]} onChange={setJoinDate} />
						<FieldDate label="退職日" value={form["退職日"]} onChange={setRetireDate} />

						<FieldCombobox
							label="ステータス"
							value={form["ステータス"]}
							options={statusOptions}
							onChange={setStatus}
							onAddOption={addStatusOption}
							helper={hasStatusColumn ? "検索して選択 / 新規追加" : "（COLUMNSに無い場合でも保存可能）"}
							placeholder="検索 or 追加"
						/>

						<FieldCombobox
							label="当時のクライアント"
							value={form["当時のクライアント"]}
							options={clientOptions}
							onChange={setClient}
							onAddOption={addClientOption}
							placeholder="検索 or 追加"
						/>

						<FieldCombobox
							label="退職理由"
							value={form["退職理由"]}
							options={reasonOptions}
							onChange={setReason}
							onAddOption={addReasonOption}
							placeholder="検索 or 追加"
						/>
					</div>

					<Divider className="border-slate-200" />

					<div className="space-y-5">
						<FieldNumber label="学歴point" value={form["学歴point"]} onChange={setEducationPoint} />
						<FieldNumber label="経歴point" value={form["経歴point"]} onChange={setCareerPoint} />
					</div>

					<div className="flex items-center justify-end gap-3 pt-2">
						<Button type="button" variant="outline" onClick={onCancel}>
							キャンセル
						</Button>
						<Button type="submit" disabled={!canSave}>
							保存する
						</Button>
					</div>
				</form>
			</div>
		</section>
	);
};

export default ManagerAddPage;
