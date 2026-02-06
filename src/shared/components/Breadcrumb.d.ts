declare module "@/shared/components/Breadcrumb" {
  import { MouseEventHandler } from "react";
  export type BreadcrumbItem = {
    label: string;
    href?: string;
    onClick?: MouseEventHandler;
  };

	export type BreadcrumbEpisode = {
		id: string;
		label: string;
	};

	type BuildEpisodeBreadcrumbItemsArgs = {
		baseItems?: BreadcrumbItem[];
		episodes: BreadcrumbEpisode[];
		currentEpisodeId: string;
		onEpisodeClick?: (episodeId: string) => void;
	};

	export const buildEpisodeBreadcrumbItems: (args: BuildEpisodeBreadcrumbItemsArgs) => BreadcrumbItem[];
  type Props = {
    items?: BreadcrumbItem[];
  };
  const Breadcrumb: (props: Props) => JSX.Element;
  export default Breadcrumb;
}
