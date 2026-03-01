const toRole = (value) => String(value ?? "general").trim().toLowerCase();

export const AUTH_ROLES = {
  ADMIN: "admin",
  GENERAL: "general",
};

export const PERMISSION_POLICY = {
  [AUTH_ROLES.ADMIN]: {
    employeeWrite: true,
    systemUsersWrite: true,
    masterDataWrite: true,
    profileWrite: true,
    profileCredentialsWrite: true,
  },
  [AUTH_ROLES.GENERAL]: {
    employeeWrite: false,
    systemUsersWrite: false,
    masterDataWrite: false,
    profileWrite: false,
    profileCredentialsWrite: true,
  },
};

const getPermissionsByRole = (role) => {
  const normalizedRole = toRole(role);
  return PERMISSION_POLICY[normalizedRole] ?? PERMISSION_POLICY[AUTH_ROLES.GENERAL];
};

// ここが「権限の真実（single source of truth）」
// 画面や機能が増えたら、まずここに権限を追加してから各所で参照する。
export const buildPermissionsByRole = (rawRole) => {
  const role = toRole(rawRole);

  const isAdmin = role === AUTH_ROLES.ADMIN;
  const permissions = getPermissionsByRole(role);

  const canWrite = Object.values(permissions).some(Boolean);

  return {
    role,
    isAdmin,
    permissions,
    canWrite,
    readOnly: !canWrite,
  };
};
