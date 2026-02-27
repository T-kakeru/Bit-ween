import { ERROR_MESSAGES } from "@/shared/constants/messages/appMessages";

export type EmploymentStatusConsistencyErrorCode =
	| "EMPLOYMENT_STATUS_INVALID"
	| "EMPLOYMENT_STATUS_ACTIVE_DISALLOW_RETIRE_DATE"
	| "EMPLOYMENT_STATUS_ACTIVE_DISALLOW_RETIRE_REASON"
	| "EMPLOYMENT_STATUS_ACTIVE_DISALLOW_REMARK";

export type EmploymentStatusConsistencyErrorField = "employmentStatus" | "retireDate" | "retireReason" | "remark";

export type EmploymentStatusConsistencyError = {
	field: EmploymentStatusConsistencyErrorField;
	code: EmploymentStatusConsistencyErrorCode;
	message: string;
};

const normalizeValue = (value: unknown) => String(value ?? "").trim();

const isBlank = (value: unknown) => normalizeValue(value) === "";

const toEmploymentStatus = (raw: unknown): "在籍" | "退職" | null => {
	const v = normalizeValue(raw);
	if (!v) return null;
	if (v === "在籍") return "在籍";
	if (v === "退職") return "退職";
	return null;
};

/**
 * 在籍状態と退職関連入力（退職日/退職理由/備考）の矛盾チェック。
 * - 在籍の場合: 退職日/退職理由/備考 は入力禁止
 * - 退職の場合: ここでは必須チェックは行わない（各機能の既存必須チェックに委譲）
 *
 * ※ employmentStatus が未指定の場合は、retireDate/retireReason の有無から在籍/退職を推定する。
 */
export const validateEmploymentStatusConsistency = (args: {
	employmentStatus?: unknown;
	retireDate?: unknown;
	retireReason?: unknown;
	remark?: unknown;
}): EmploymentStatusConsistencyError[] => {
	const employmentStatus = normalizeValue(args.employmentStatus);
	const retireDate = normalizeValue(args.retireDate);
	const retireReason = normalizeValue(args.retireReason);
	const remark = normalizeValue(args.remark);

	const normalizedStatus = toEmploymentStatus(employmentStatus);

	// 在籍状態が入力されているのに、想定外の値
	if (employmentStatus && !normalizedStatus) {
		return [
			{
				field: "employmentStatus",
				code: "EMPLOYMENT_STATUS_INVALID",
				message: ERROR_MESSAGES.VALIDATION.EMPLOYMENT_STATUS_INVALID,
			},
		];
	}

	// 在籍状態が無い場合は、退職情報の有無で推定する（CSV互換用）
	const inferredStatus: "在籍" | "退職" = !isBlank(retireDate) || !isBlank(retireReason) ? "退職" : "在籍";
	const status = normalizedStatus ?? inferredStatus;

	if (status !== "在籍") return [];

	const errors: EmploymentStatusConsistencyError[] = [];

	if (!isBlank(retireDate)) {
		errors.push({
			field: "retireDate",
			code: "EMPLOYMENT_STATUS_ACTIVE_DISALLOW_RETIRE_DATE",
			message: ERROR_MESSAGES.VALIDATION.EMPLOYMENT_STATUS_ACTIVE_DISALLOW_RETIRE_DATE,
		});
	}

	if (!isBlank(retireReason)) {
		errors.push({
			field: "retireReason",
			code: "EMPLOYMENT_STATUS_ACTIVE_DISALLOW_RETIRE_REASON",
			message: ERROR_MESSAGES.VALIDATION.EMPLOYMENT_STATUS_ACTIVE_DISALLOW_RETIRE_REASON,
		});
	}

	if (!isBlank(remark)) {
		errors.push({
			field: "remark",
			code: "EMPLOYMENT_STATUS_ACTIVE_DISALLOW_REMARK",
			message: ERROR_MESSAGES.VALIDATION.EMPLOYMENT_STATUS_ACTIVE_DISALLOW_REMARK,
		});
	}

	return errors;
};
