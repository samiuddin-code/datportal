import { FC, ReactNode } from "react";
import Layout from "../Layout";

interface SiteSettingsProps {
	children?: ReactNode;
	className?: string;
	permissionSlug?: string[]
}

const SiteSettingsTemplate: FC<SiteSettingsProps> = ({ children, className, permissionSlug }) => {
	return (
		<Layout
			showAddProject={false}
			adminNav
			className={className}
			permissionSlug={permissionSlug}
		>
			{children}
		</Layout>
	);
};

export default SiteSettingsTemplate;
