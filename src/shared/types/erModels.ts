export type Uuid = string;
export type Timestamp = string;

export type UserRole = "admin" | "general";

export type CompanyRecord = {
  id: Uuid;
  company_name: string;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type DepartmentRecord = {
  id: Uuid;
  company_id: Uuid;
  code: string | null;
  name: string;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type ClientRecord = {
  id: Uuid;
  company_id: Uuid;
  name: string;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type WorkStatusRecord = {
  id: Uuid;
  name: string;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type RetirementReasonRecord = {
  id: Uuid;
  name: string;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type EmployeeRecord = {
  id: Uuid;
  employee_code: string;
  full_name: string;
  gender: string | null;
  birth_date: string | null;
  join_date: string | null;
  retire_date: string | null;
  retirement_reason_id: Uuid | null;
  retirement_reason_text: string | null;
  department_id: Uuid | null;
  work_status_id: Uuid | null;
  client_id: Uuid | null;
  deleted_at: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type AppUserRecord = {
  id: Uuid;
  company_id: Uuid;
  employee_id: Uuid | null;
  email: string;
  role: UserRole;
  created_at: Timestamp;
  updated_at: Timestamp;
};
