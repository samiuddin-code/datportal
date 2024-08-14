import { FC, ReactNode } from "react";
import Layout from "../../../Templates/Layout";

interface AccountSettingsProps {
    children?: ReactNode;
    className?: string;
    permissionSlug?: string[]
}

const AccountSettingsTemplate: FC<AccountSettingsProps> = ({ children, className, permissionSlug }) => {
    return (
        <Layout
            adminNav
            className={className}
            profileNav={true}
            // permissionSlug={["readOrganization", "updateOrganization"]}
        >
            {children}
        </Layout>
    );
};

export default AccountSettingsTemplate;
