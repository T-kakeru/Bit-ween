export type EmployeeCsvField =
  | "name"
  | "gender"
  | "birthDate"
  | "employeeId"
  | "department"
  | "joinDate"
  | "employmentStatus"
  | "workStatus"
  | "workLocation"
  | "retirementDate"
  | "retirementReason"
  | "remark";

export type EmployeeCsvErrorField = EmployeeCsvField | "row" | "file" | "header";

export type EmployeeCsvRawRow = Partial<Record<EmployeeCsvField, string>>;

export type EmployeeCsvNormalizedRow = {
  name: string;
  gender: string;
  birthDate: string;
  employeeId: string | null;
  department: string | null;
  joinDate: string;
  employmentStatus?: string;
  workStatus: string;
  workLocation: string | null;
  retirementDate: string;
  retirementReason: string;
  remark: string;
};

export type EmployeeCsvError = {
  rowNumber: number;
  field: EmployeeCsvErrorField;
  code?:
    | "unknownDepartment"
    | "unknownWorkLocation"
    | "invalidEmploymentStatus"
    | "activeDisallowRetirementDate"
    | "activeDisallowRetirementReason"
    | "activeDisallowRemark";
  value?: string;
  message: string;
};

export type EmployeeCsvValidationResult = {
  validRows: EmployeeCsvNormalizedRow[];
  errors: EmployeeCsvError[];
  rowCount: number;
};

export type EmployeeCsvParseResult = {
  headers: string[];
  rows: string[][];
};
