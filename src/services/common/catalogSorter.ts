import type { CatalogItem } from "@/shared/logic/catalogStorage";

const collator = new Intl.Collator("ja");

export const sortJa = (names: string[]) => names.slice().sort((a, b) => collator.compare(a, b));

export const sortJaCatalogItems = (items: CatalogItem[]) =>
  items.slice().sort((a, b) => collator.compare(a.name, b.name));