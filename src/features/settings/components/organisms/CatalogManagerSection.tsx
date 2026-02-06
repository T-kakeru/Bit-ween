import { useMemo, useState } from "react";
import Card from "@/shared/ui/Card";
import TextCaption from "@/shared/ui/TextCaption";
import Button from "@/shared/ui/Button";
import departments from "@/shared/data/mock/departments.json";
import clients from "@/shared/data/mock/clients.json";

type CatalogKey = "departments" | "clients";

type CatalogItem = {
  id: string;
  name: string;
};

type Props = {
  title: string;
  description: string;
  keyName: CatalogKey;
  itemLabel: "部署" | "稼働先";
};

export const CatalogManagerSection = ({ title, description, keyName, itemLabel }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const items = useMemo<CatalogItem[]>(() => {
    const source = keyName === "departments" ? (departments as any) : (clients as any);
    return (Array.isArray(source) ? source : [])
      .map((x) => ({ id: String(x?.id ?? "").trim(), name: String(x?.name ?? "").trim() }))
      .filter((x) => x.id && x.name);
  }, [keyName]);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <Card className="settings-panel">
      <div className="settings-row">
        <div>
          <p className="settings-title">{title}</p>
          <TextCaption>{description}</TextCaption>
          <TextCaption className="mt-1">登録数: {items.length}</TextCaption>
        </div>

			<div className="flex items-center gap-2">
				<Button type="button" variant="outline" size="sm" onClick={toggleOpen} aria-expanded={isOpen}>
					{isOpen ? "閉じる" : "管理する"}
				</Button>
			</div>
      </div>

      {isOpen ? <div className="px-6 pb-5">
        <div className="mt-4 space-y-2">
          {items.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <TextCaption>まだ登録がありません。</TextCaption>
            </div>
          ) : null}

          {items.map((item) => {
            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900 truncate">{item.name}</div>
                  <div className="mt-0.5 text-xs text-slate-500">ID: {item.id}</div>
                </div>
              </div>
            );
          })}
        </div>
		</div> : null}
    </Card>
  );
};
