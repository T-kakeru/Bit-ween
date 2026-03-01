import { useMemo } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { buildPermissionsByRole } from "@/features/auth/logic/authorization";

// hooks: 権限判定（UI/更新ガードで共通利用）
const useAuthorization = () => {
  const { user } = useAuth();

  return useMemo(() => {
    return buildPermissionsByRole(user?.role);
  }, [user?.role]);
};

export default useAuthorization;
