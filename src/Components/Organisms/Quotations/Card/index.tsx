import { type FC, useState, Dispatch, SetStateAction, useMemo } from 'react';
import { Typography as AntdTypography, Tooltip, message } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { QuotationPermissionsEnum } from '@modules/Quotation/permissions';
import { QuotationTypes } from '@modules/Quotation/types';
import { InvoicePermissionsEnum } from '@modules/Invoice/permissions';
import { ProjectPermissionsEnum } from '@modules/Project/permissions';
import { CustomEmpty, Typography } from '@atoms/';
import { CalenderIcon } from '@icons/';
import { convertDate } from '@helpers/dateHandler';
import InvoiceDrawer from '@organisms/Invoice/Drawer';
import ActionsDropdown from './actions';
import { QuotationDrawerTypes } from '../Drawer/types';
import CardDropDown from './Dropdown';
import MilestonesAndInvoices from './Dropdown/milestones';
import ScopeOfWork from './Dropdown/scope-of-work';
import QuotationStatusComp from '../status';
import styles from './styles.module.scss';
import { formatCurrency, handleError } from '@helpers/common';
import QuickUpdate from '../quick-update';
import NewProject from '../new-project';
import { QuotationModule } from '@modules/Quotation';
import { useInvoiceDrawer } from 'hooks';

const { Paragraph } = AntdTypography;

type PermissionType = { [key in QuotationPermissionsEnum]: boolean } & {
  [key in InvoicePermissionsEnum]: boolean
} & {
    [key in ProjectPermissionsEnum]: boolean
  }

interface QuotationsCardProps {
  data: {
    allQuotation: QuotationTypes[]
    onRefresh: <QueryType = any>(query?: QueryType) => void
  }
  permissions: PermissionType
  setQuotationDrawer: Dispatch<SetStateAction<QuotationDrawerTypes>>
  quotationDrawer: QuotationDrawerTypes
  setNewProject: Dispatch<SetStateAction<NewProjectModalTypes>>
  newProject: NewProjectModalTypes
}

type NewProjectModalTypes = {
  isOpen: boolean
  quoteId: number
  submissionById: number
  projectTypeId: number
  loading: boolean
}

type QuickUpdateTypes = {
  open: boolean
  quoteId: number
  initialProjectId: number
  initialSubmissionById: number,
  initialProjectTypeId: number
}

const QuotationsCard: FC<QuotationsCardProps> = (props) => {
  const {
    data, permissions, setQuotationDrawer, setNewProject, newProject
  } = props;
  const { onRefresh, allQuotation } = data

  const module = useMemo(() => new QuotationModule(), []);

  // Invoice Drawer State
  const { drawer, setDrawer } = useInvoiceDrawer()

  // Quick Update Modal State
  const [quickUpdate, setQuickUpdate] = useState<QuickUpdateTypes>({
    open: false, quoteId: 0, initialProjectId: 0, initialSubmissionById: 0,
    initialProjectTypeId: 0
  })

  /**Function to delete a lead
  * @param {number} id id of the lead to be deleted
  */
  const onDelete = (id: number) => {
    if (permissions.deleteQuotation === true) {
      module.deleteRecord(id).then(() => onRefresh()).catch((err) => {
        const errorMessages = handleError(err)
        message.error(errorMessages || "Something went wrong, please try again later.")
      })
    } else {
      message.error("You don't have permission to delete this quotation, Please contact your admin")
    }
  };

  const onEdit = (record: QuotationTypes) => {
    if (permissions.updateQuotation === false) {
      message.error("You don't have permission to update record");
      return;
    }

    setQuotationDrawer(() => ({
      open: true, type: "edit",
      quoteId: record?.id, leadId: record?.leadId,
      submissionById: record?.Lead?.SubmissionBy?.id
    }))
  };

  return (
    <>
      {allQuotation?.length === 0 && (
        <CustomEmpty description="No quotation found" className='my-5' />
      )}
      <section className={styles.quotations}>
        {allQuotation?.map((item, index) => {
          return (
            <div key={`invoice-${index}`} className={styles.quotation_item}>
              <div className={styles.quotation_item_header}>
                <div className={styles.quotation_item_header_left}>
                  <div>
                    <Typography
                      className={styles.quotation_item_header_title}
                      onClick={() => setQuotationDrawer((prev) => ({
                        ...prev, open: true, quoteId: item?.id,
                        type: "preview", quotation: item
                      }))}
                      color='dark-main' size='sm'
                    >
                      {item?.quoteNumber || "No Quote Number"}
                    </Typography>

                    Amount: {formatCurrency(item?.total || 0)}

                    <div className="d-flex flex-column">
                      {item?.Lead?.Client?.name && (
                        <Typography color="dark-sub" size="sm" className="mt-1 mb-0">
                          {item?.Lead?.Client?.name}
                        </Typography>
                      )}

                      {item?.Lead?.Client?.email && (
                        <Paragraph
                          ellipsis={{ rows: 1, expandable: false }}
                          copyable={{ text: item.Lead.Client.email }}
                          className="font-size-xs color-dark-sub mb-0"
                        >
                          {item?.Lead?.Client?.email}
                        </Paragraph>
                      )}

                      {(item.Lead.Client.phone !== "undefined" && item.Lead.Client.phone) && (
                        <Paragraph
                          ellipsis={{ rows: 1, expandable: false }}
                          copyable={{ text: `${item.Lead.Client.phoneCode}${item.Lead.Client.phone}` }}
                          className="font-size-xs color-dark-sub mb-0"
                        >
                          {`+${item.Lead.Client.phoneCode}${item.Lead.Client.phone}`}
                        </Paragraph>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.quotation_item_header_actions}>
                  <div className={styles.quotation_item_header_actions_items}>
                    <QuotationStatusComp
                      item={item} onRefresh={onRefresh}
                      permissions={permissions}
                      setDrawer={setQuotationDrawer}
                      setNewProject={setNewProject}
                    />

                    {/** Dropdown for more actions */}
                    <ActionsDropdown
                      item={item}
                      onDelete={onDelete} onEdit={onEdit}
                      setNewProject={setNewProject}
                      setQuickUpdate={setQuickUpdate}
                    />
                  </div>

                  {item?.sentDate && (
                    <div className="d-flex align-center">
                      <CalenderIcon className="mr-2" width={13} />
                      <Typography color="dark-sub" size="xs" className="mt-1">
                        {`Sent: ${convertDate(item.addedDate, "dd MM yy")}` || "N/A"}
                      </Typography>
                    </div>
                  )}

                  {item?.addedDate && (
                    <div className="d-flex align-center">
                      <CalenderIcon className="mr-2" width={13} />
                      <Typography color="dark-sub" size="xs" className="mt-1">
                        {`Created: ${convertDate(item.addedDate, "dd MM yy")}` || "N/A"}
                      </Typography>
                    </div>
                  )}

                  {item?.modifiedDate && (
                    <div className="d-flex align-center">
                      <CalenderIcon className="mr-2" width={13} />
                      <Typography color="dark-sub" size="xs" className="mt-1">
                        {`Modified: ${convertDate(item.modifiedDate, "dd MM yy")}` || "N/A"}
                      </Typography>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.quotation_item_body}>
                <CardDropDown
                  label={
                    <div className={styles.quotation_title}>
                      <div className='d-flex align-center'>
                        <Typography color="dark-main" size="sm">Milestones & Invoices</Typography>
                        <Tooltip title="Add Quotation">
                          <PlusCircleOutlined
                            className='ml-2'
                            style={{ fontSize: '1rem' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDrawer((prev) => ({
                                ...prev, open: true,
                                type: "create",
                                quotation: item,
                                projectId: item?.projectId,
                              }))
                            }}
                          />
                        </Tooltip>
                      </div>
                    </div>
                  }
                >
                  <MilestonesAndInvoices
                    item={item}
                    setDrawer={setDrawer}
                    onRefresh={onRefresh}
                  />
                </CardDropDown>
                {/** Scope of work */}
                <CardDropDown label='Scope Of Work' placement='bottomRight'>
                  <ScopeOfWork item={item} />
                </CardDropDown>
              </div>
            </div>
          )
        })}
      </section>

      {/** Invoice Drawer */}
      {drawer.open && (
        <InvoiceDrawer
          drawer={drawer}
          setDrawer={setDrawer}
          onRefresh={onRefresh}
          permissions={permissions}
        />
      )}

      {/** Quick Update */}
      {quickUpdate?.open && (
        <QuickUpdate
          open={quickUpdate.open}
          quickUpdate={quickUpdate}
          onClose={() => {
            setQuickUpdate({
              open: false, quoteId: 0, initialProjectId: 0,
              initialSubmissionById: 0, initialProjectTypeId: 0
            })
            onRefresh()
          }}
        />
      )}

      {/** Create Project Modal */}
      {newProject?.isOpen && (
        <NewProject
          setNewProject={setNewProject}
          newProject={newProject}
          onRefresh={onRefresh}
          permissions={permissions}
        />
      )}
    </>
  );
}
export default QuotationsCard;