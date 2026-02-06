import { useEffect } from "react";

import type { ManagerColumn, ManagerRowInput } from "@/features/addRetirement/hooks/useManagerAddForm";
import ManagerAddPageOrganism from "@/features/addRetirement/components/organisms/ManagerAddPage";

type Props = {
	columns: ManagerColumn[];
	rows: Array<Record<string, any>>;
	onCancel: () => void;
	onSave: (input: ManagerRowInput) => void;
};

// pages: ページ枠（配置/ページタイトルなど）だけを持つ
const ManagerAddPage = (props: Props) => {
	useEffect(() => {
		window.dispatchEvent(new CustomEvent("app:page-title", { detail: "新規従業員登録" }));
		return () => {
			window.dispatchEvent(new CustomEvent("app:page-title", { detail: null }));
		};
	}, []);

	return <ManagerAddPageOrganism {...props} />;
};

export default ManagerAddPage;
