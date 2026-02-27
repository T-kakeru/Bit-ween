import type { AppUserRecord, UserRole } from "@/shared/types/erModels";
import { supabaseClient } from "@/services/common/supabaseClient";
import { DEFAULT_COMPANY_ID } from "@/services/common/defaultCompany";

export type EmploymentStatus = "active" | "retired";

export type UserProfile = AppUserRecord & {
  name?: string;
  role?: UserRole;
  department?: string;
  team?: string;
  status?: string;
  icon?: string;
  gender?: "男性" | "女性" | "その他" | "";
  birthDate?: string;
  joinDate?: string;
  employmentStatus?: EmploymentStatus;
  retireDate?: string;
  bio?: string;
  smallTalk?: {
    hobbies?: string[];
    oneLiner?: string;
  };
};


export type SettingsProfile = {
  name: string;
  department: string;
  email: string;
  role: string;
  password: string;
};

const findUserFromSupabaseByEmail = async (email: string): Promise<any | null> => {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient
    .from("users")
    .select("id, company_id, employee_id, email, password, role")
    .eq("company_id", DEFAULT_COMPANY_ID)
    .eq("email", email)
    .maybeSingle();
  if (error) return null;
  return data ?? null;
};

const findEmployeeFromSupabaseById = async (employeeId: string): Promise<any | null> => {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient
    .from("employees")
    .select("id, full_name, department_id")
    .eq("id", employeeId)
    .maybeSingle();
  if (error) return null;
  return data ?? null;
};

const findDepartmentFromSupabaseById = async (departmentId: string): Promise<any | null> => {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient
    .from("departments")
    .select("id, name")
    .eq("id", departmentId)
    .maybeSingle();
  if (error) return null;
  return data ?? null;
};

const roleToLabel = (role: string) => (String(role ?? "").trim().toLowerCase() === "admin" ? "管理者" : "一般");

export const fetchSettingsProfileByEmail = async (email: string): Promise<SettingsProfile | null> => {
  const targetEmail = String(email ?? "").trim().toLowerCase();

  if (!supabaseClient) return null;

  const userRow = await findUserFromSupabaseByEmail(targetEmail);
  if (!userRow) return null;

  const employeeId = String((userRow as any)?.employee_id ?? "").trim();
  const employeeRow = employeeId ? await findEmployeeFromSupabaseById(employeeId) : null;

  const departmentId = String((employeeRow as any)?.department_id ?? "").trim();
  const departmentRow = departmentId ? await findDepartmentFromSupabaseById(departmentId) : null;

  const name = String((employeeRow as any)?.full_name ?? "").trim() || String((userRow as any)?.email ?? "").trim();
  const profile: SettingsProfile = {
    name,
    department: String((departmentRow as any)?.name ?? "").trim(),
    email: String((userRow as any)?.email ?? "").trim(),
    role: roleToLabel(String((userRow as any)?.role ?? "")),
    password: String((userRow as any)?.password ?? ""),
  };

  return profile;
};