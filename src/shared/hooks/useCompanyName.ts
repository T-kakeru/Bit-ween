import { useEffect, useState } from "react";

import { getSessionCompanyId } from "@/services/common/sessionCompany";
import { fetchCompanyName } from "@/services/company/companyService";

const FALLBACK_COMPANY_NAME = "-";

// hooks: 会社名の取得（ヘッダー等の表示用）
export const useCompanyName = (companyId?: string) => {
  const [companyName, setCompanyName] = useState<string>(FALLBACK_COMPANY_NAME);

  useEffect(() => {
    let disposed = false;

    const resolvedCompanyId = String(companyId ?? "").trim() || getSessionCompanyId();

    const load = async () => {
      const name = await fetchCompanyName(resolvedCompanyId);
      if (disposed) return;
      setCompanyName(name || FALLBACK_COMPANY_NAME);
    };

    void load();

    return () => {
      disposed = true;
    };
  }, [companyId]);

  return { companyName };
};
