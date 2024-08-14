import { FC, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "Redux/store";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { ErrorCode403 } from "@atoms/ErrorCodes";
import Layout from "@templates/Layout";
import { useFetchData } from "hooks";
import { ClientType } from "@modules/Client/types";
import { ClientModule } from "@modules/Client";
import { ClientPermissionsEnum } from "@modules/Client/permissions";
import ClientDetailsOverview from "./overview";
import styles from "./styles.module.scss";
import ClientProjects from "./Projects";
import ClientQuotations from "./Quotations";
import ClientInvoice from "./Invoice";
import ClientGovernmentFees from "./Transactions";
import { InvoicePermissionsEnum } from "@modules/Invoice/permissions";
import { ProjectPermissionsEnum } from "@modules/Project/permissions";
import { QuotationPermissionsEnum } from "@modules/Quotation/permissions";
import { TransactionsPermissionsEnum } from "@modules/Transactions/permissions";
import { getPermissionSlugs } from "@helpers/common";

const ClientsDetails: FC = () => {
  // available permissions for this module
  const permissionSlug = getPermissionSlugs(ClientPermissionsEnum)
  const invoicePermissionSlug = getPermissionSlugs(InvoicePermissionsEnum)
  const projectsPermissionSlug = getPermissionSlugs(ProjectPermissionsEnum)
  const quotationsPermissionSlug = getPermissionSlugs(QuotationPermissionsEnum)
  const transactionsPermissionSlug = getPermissionSlugs(TransactionsPermissionsEnum)

  const allPermissionsSlug = [
    ...permissionSlug,
    ...invoicePermissionSlug,
    ...projectsPermissionSlug,
    ...quotationsPermissionSlug,
    ...transactionsPermissionSlug,
  ];
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as { [key in ClientPermissionsEnum]: boolean };
  const { readClient } = permissions;

  const [searchParams] = useSearchParams();
  const recordId = searchParams.get("id")

  const module = useMemo(() => new ClientModule(), []);

  const { data } = useFetchData<ClientType>({
    method: () => module.getRecordById(Number(recordId))
  })

  return (
    <Layout permissionSlug={allPermissionsSlug}>
      <div className={styles.container}>
        <Link className={styles.back} to="/clients">
          <ArrowLeftOutlined style={{ fontSize: 20, display: "flex" }} />
          <span>Back</span>
        </Link>
        {readClient === true && (
          <>
            <ClientDetailsOverview client={data!} />
            <ClientProjects clientId={Number(recordId)} />
            <ClientQuotations clientId={Number(recordId)} />
            <ClientInvoice clientId={Number(recordId)} />
            <ClientGovernmentFees clientId={Number(recordId)} />
          </>
        )}
      </div>

      {readClient === false && (
        <ErrorCode403
          mainMessage="You don't have permission to view this data"
        />
      )}
    </Layout>
  );
}
export default ClientsDetails;