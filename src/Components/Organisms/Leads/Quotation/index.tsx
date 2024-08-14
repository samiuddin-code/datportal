import { Dispatch, SetStateAction, type FC } from 'react';
import { Button, Empty, Tooltip } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import { Typography } from '@atoms/';
import { QuotationDrawerTypes } from '@organisms/Quotations/Drawer/types';
import QuotationStatusComp from '@organisms/Quotations/status';
import { LeadsTypes } from '@modules/Leads/types';
import { QuotationPermissionsEnum } from '@modules/Quotation/permissions';
import { ProjectPermissionsEnum } from '@modules/Project/permissions';
import styles from './styles.module.scss';
import CardDropDown from '@organisms/Quotations/Card/Dropdown';
import { formatCurrency } from '@helpers/common';

type PermissionsType = { [key in QuotationPermissionsEnum]: boolean } & {
  [key in ProjectPermissionsEnum]: boolean
}

type NewProjectModalTypes = {
  isOpen: boolean
  quoteId: number
  loading: boolean
  submissionById: number
  projectTypeId: number
}

interface LeadsQuotationProps {
  items: LeadsTypes
  /** The function to set the drawer state */
  setDrawer: Dispatch<SetStateAction<QuotationDrawerTypes>>
  onRefresh: <QueryType = any>(query?: QueryType) => void
  permissions: PermissionsType
  /** The state of the modal for creating project from quotation */
  setNewProject: Dispatch<SetStateAction<NewProjectModalTypes>>
}

const LeadsQuotation: FC<LeadsQuotationProps> = (props) => {
  const {
    items, setDrawer, onRefresh, permissions, setNewProject
  } = props;

  // prepare the data and add Lead?.SubmissionBy?.id to the Quotation
  const Quotation = items?.Quotation?.map((item) => {
    return {
      ...item,
      Lead: {
        ...item?.Lead,
        SubmissionBy: {
          ...item?.Lead?.SubmissionBy,
          id: items?.submissionById!
        },
        ProjectType: {
          ...item?.Lead?.ProjectType,
          id: items?.projectTypeId!
        }
      }
    }
  })

  return (
    <CardDropDown
      label={
        <div className={styles.quotation_title}>
          <div className='d-flex align-center'>
            <Typography color="dark-main" size="sm">Quotation</Typography>
            {Quotation?.length > 0 && (
              <Tooltip title="Add Quotation">
                <PlusCircleOutlined
                  className='ml-2'
                  style={{ fontSize: '1rem' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDrawer((prev) => ({
                      ...prev, open: true, type: "create",
                      submissionById: items?.submissionById,
                      leadId: items?.id
                    }))
                  }}
                />
              </Tooltip>
            )}
          </div>
        </div>
      }
    >
      <div className={styles.quotation_container}>
        {Quotation?.length > 0 ? Quotation?.map((item, index) => (
          <div
            key={`notes-${index}`} className="mb-2 cursor-pointer"
            style={{
              borderBottom: index === Quotation?.length - 1 ? '' : '1px solid var(--color-border)',
              paddingBottom: index === Quotation?.length - 1 ? '' : '0.5rem'
            }}
            onClick={() => setDrawer((prev) => ({ ...prev, open: true, type: "preview", quoteId: item?.id }))}
          >
            <div className='d-flex justify-space-between align-center'>
              <span className="font-size-sm color-dark-800">
                {item?.quoteNumber || "No Quote Number"}
              </span>
              <span className="font-size-sm color-dark-800">
                Amount: {formatCurrency(item?.total || 0)}
              </span>
            </div>

            <div className='d-flex justify-space-between align-center'>
              <span className="font-size-xs color-dark-sub">
                {item.sentDate ? `Sent ${moment(item?.sentDate).fromNow()}` : "Not yet sent"}
              </span>
              <QuotationStatusComp
                item={item}
                onRefresh={onRefresh}
                permissions={permissions}
                setDrawer={setDrawer}
                setNewProject={setNewProject}
              />
            </div>
          </div>
        )) : (
          <Empty
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            imageStyle={{ height: 50 }}
            description={<span className="font-size-xs color-dark-sub">No Quotation</span>}
          >
            <Button
              type="link"
              onClick={() => setDrawer((prev) => ({
                ...prev, open: true, type: "create",
                submissionById: items?.submissionById,
                leadId: items?.id
              }))}
            >
              Create Now
            </Button>
          </Empty>
        )}
      </div>
    </CardDropDown>
  );
}
export default LeadsQuotation;