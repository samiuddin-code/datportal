import { useMemo, type FC, useState } from 'react';
import { Segmented } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from 'Redux/store';
import { useConditionFetchData, useNewProjectModal, useQuotationDrawer } from 'hooks';
import Typography from '@atoms/Headings';
import { QuotationStatus } from '@helpers/commonEnums';
import { QuotationTypes } from '@modules/Quotation/types';
import { QuotationModule } from '@modules/Quotation';
import { QuotationPermissionsEnum } from '@modules/Quotation/permissions';
import QuotationsCard from '@organisms/Quotations/Card';
import { Pagination } from '@atoms/Pagination';
import { InvoicePermissionsEnum } from '@modules/Invoice/permissions';
import { ProjectPermissionsEnum } from '@modules/Project/permissions';
import { CardShimmer } from '@atoms/CardShimmer';
import CustomEmpty from '@atoms/CustomEmpty';
import { QuotationDrawerTypes } from '@organisms/Quotations/Drawer/types';

interface ClientQuotationsProps {
  clientId: number;
}

type PermissionType = { [key in QuotationPermissionsEnum]: boolean } & {
  [key in InvoicePermissionsEnum]: boolean
} & { [key in ProjectPermissionsEnum]: boolean }

enum SegmentedValues {
  all = 'all',
  active = 'active',
  confirmed = 'confirmed',
  rejected = 'rejected',
  draft = 'draft',
  revised = 'revised'
}

// Status Filters
const statusValues: { [key in SegmentedValues]: QuotationStatus[] | undefined } = {
  all: undefined,
  active: [QuotationStatus.New, QuotationStatus.Sent],
  confirmed: [QuotationStatus.Confirmed],
  rejected: [QuotationStatus.Rejected],
  draft: [QuotationStatus.New],
  revised: [QuotationStatus.Revised]
}

const ClientQuotations: FC<ClientQuotationsProps> = ({ clientId }) => {
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as PermissionType
  const { readQuotation } = permissions;

  const module = useMemo(() => new QuotationModule(), []);

  const condition = useMemo(() => clientId && readQuotation === true, [readQuotation, clientId]);

  const { data, loading, meta, onRefresh } = useConditionFetchData<QuotationTypes[]>({
    method: module.getAllRecords,
    initialQuery: { clientId, __status: statusValues.active },
    condition,
  });

  const { drawer, setDrawer } = useQuotationDrawer()

  // Create Project Modal State
  const { newProject, setNewProject } = useNewProjectModal()

  return (
    <>
      {readQuotation === true && (
        <>
          <div className='d-flex align-center'>
            <Typography
              color="dark-main" size="sm" weight="bold"
              className='mr-2'
            >
              Quotations
            </Typography>
            <div style={{ overflow: "auto" }}>
              <Segmented
                defaultValue='active'
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Active', value: 'active' }
                ]}
                onChange={(value) => {
                  if (value === 'all') return onRefresh({ clientId, perPage: 10 })
                  const _value = value as SegmentedValues;
                  onRefresh({
                    __status: statusValues[_value], clientId, perPage: 10
                  })
                }}
              />
            </div>
          </div>

          {/**Loading Shimmers */}
          {(!data && loading) && (
            <div style={{ display: "flex", flexWrap: "wrap", width: "100%", gap: 10, justifyContent: "center" }}>
              {Array(3).fill(0).map((_item, index) => (
                <CardShimmer key={`shimmerItem-${index}`} />
              ))}
            </div>
          )}

          {(!loading && data?.length === 0) && (
            <CustomEmpty description='No Quotations Found' />
          )}

          {(data && data?.length > 0) && (
            <>
              <QuotationsCard
                permissions={permissions}
                data={{
                  allQuotation: data!,
                  onRefresh: () => onRefresh({ clientId, onlyGovernmentFees: true }),
                }}
                quotationDrawer={drawer}
                setQuotationDrawer={setDrawer}
                setNewProject={setNewProject}
                newProject={newProject}
              />
              <Pagination
                total={meta?.total || 0}
                current={meta?.page || 1}
                defaultPageSize={meta?.pageCount || 10}
                pageSizeOptions={[10, 20, 50, 100]}
                onChange={(page, perPage) => {
                  onRefresh({ page, perPage, clientId })
                }}
              />
            </>
          )}
        </>
      )}
    </>
  )
}
export default ClientQuotations;