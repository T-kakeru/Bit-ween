declare module "@/shared/components/Breadcrumb" {
  import { MouseEventHandler } from "react";
  export type BreadcrumbItem = {
    label: string;
    href?: string;
    onClick?: MouseEventHandler;
  };
  type Props = {
    items?: BreadcrumbItem[];
  };
  const Breadcrumb: (props: Props) => JSX.Element;
  export default Breadcrumb;
}
