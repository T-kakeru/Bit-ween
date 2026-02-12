export type EmployeeCsvField =
  | "name"
  | "gender"
  | "birthDate"
  | "email"
  | "employeeId"
  | "department"
  | "joinDate"
  | "employmentStatus"
  | "workStatus"
  | "workLocation"
  | "retirementDate"
  | "retirementReason";

export type EmployeeCsvErrorField = EmployeeCsvField | "row" | "file" | "header";

export type EmployeeCsvRawRow = Partial<Record<EmployeeCsvField, string>>;

export type EmployeeCsvNormalizedRow = {
  name: string;
  gender: string;
  birthDate: string | null;
  email: string | null;
  employeeId: string | null;
  department: string | null;
  joinDate: string | null;
  employmentStatus: string | null;
  workStatus: string;
  workLocation: string | null;
  retirementDate: string;
  retirementReason: string;
};

export type EmployeeCsvError = {
  rowNumber: number;
  field: EmployeeCsvErrorField;
  code?: "unknownDepartment" | "unknownWorkLocation" | "unknownWorkStatus";
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
