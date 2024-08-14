import { useMemo, type FC, useState } from 'react';
import { message, Typography as AntdTypography, Tooltip } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { LeadsPermissionsEnum } from '@modules/Leads/permissions';
import { LeadsTypes } from '@modules/Leads/types';
import { UserModule } from '@modules/User';
import { UserTypes } from '@modules/User/types';
import { QuotationPermissionsEnum } from '@modules/Quotation/permissions';
import { ProjectPermissionsEnum } from '@modules/Project/permissions';
import { CustomEmpty, Typography } from '@atoms/';
import { CalenderIcon } from '@icons/';
import { convertDate } from '@helpers/dateHandler';
import StatusDropdown from '../status';
import ActionsDropdown from './actions';
import UserDropDown from '../assign-to';
import LeadsNote from '../Notes';
import LeadsQuotation from '../Quotation';
import { handleError, isDateGreaterThan } from '@helpers/common';
import QuotationDrawer from '@organisms/Quotations/Drawer';
import { QuotationDrawerTypes } from '@organisms/Quotations/Drawer/types';
import styles from './styles.module.scss';
import NewProject from '@organisms/Quotations/new-project';
import { LeadsStatus } from '@helpers/commonEnums';
import { useNewProjectModal, useQuotationDrawer } from 'hooks';

const { Paragraph } = AntdTypography;

type PermissionsType = { [key in LeadsPermissionsEnum]: boolean }
  & { [key in QuotationPermissionsEnum]: boolean }
  & { [key in ProjectPermissionsEnum]: boolean }

type ModalOpenType = {
  type: "new" | "edit" | "notes";
  recordId: number;
  open: boolean;
}

interface LeadsCardProps {
  data: {
    allLeads: LeadsTypes[]
    onRefresh: <QueryType = any>(query?: QueryType) => void
  }
  onDelete: (id: number) => void
  onEdit: (id: number) => void
  permissions: PermissionsType
  onOpenNoteModal: (props: ModalOpenType) => void
  onAttachmentClick: (record: LeadsTypes) => void
}

type SearchedUserType = {
  data: UserTypes[];
  loading: boolean;
}

const LeadsCards: FC<LeadsCardProps> = (props) => {
  const {
    data, onDelete, onEdit, permissions, onOpenNoteModal, onAttachmentClick
  } = props;
  const { onRefresh, allLeads } = data

  const userModule = useMemo(() => new UserModule(), [])

  const [users, setUsers] = useState<SearchedUserType>({
    data: [], loading: false
  });

  const { drawer, setDrawer } = useQuotationDrawer()

  // Create Project Modal State
  const { newProject, setNewProject } = useNewProjectModal()

  /**This function is used to search users by name
   * @param query: { name: string }
  */
  const getUsers = (query?: { name: string }) => {
    setUsers((prev) => ({ ...prev, loading: true }));
    query = { name: query?.name || '' }

    userModule.getAllRecords(query).then((res) => {
      const data = res?.data?.data;
      setUsers({ data: data, loading: false });
    }).catch((err) => {
      const errMessage = handleError(err)
      message.error(errMessage || "Something went wrong");
      setUsers((prev) => ({ ...prev, loading: false }));
    })
  }

  return (
    <>
      {allLeads?.length === 0 && (
        <CustomEmpty description="No leads found" className='my-5' />
      )}
      <section className={styles.leads}>
        {allLeads?.map((item, index) => {
          const { AssignedTo, Client } = item

          return (
            <div key={`leads-${index}`} className={styles.lead_item}>
              <div className={styles.lead_item_header}>
                <div className={styles.lead_item_header_left}>
                  <div>
                    <h4 className={styles.lead_item_header_title}>
                      {Client?.name}
                    </h4>

                    {/** Email */}
                    {Client?.email && (
                      <Paragraph
                        className={styles.lead_item_header_email}
                        ellipsis={{ rows: 1, expandable: false, }}
                        copyable={{ text: Client?.email }}
                      >
                        {Client?.email}
                      </Paragraph>
                    )}

                    {/** Phone number */}
                    {(Client.phone !== "undefined" && Client.phone) && (
                      <Paragraph
                        className={styles.lead_item_header_phone}
                        ellipsis={{ rows: 1, expandable: false, }}
                        copyable={{ text: Client?.phone }}
                      >
                        {`+${Client?.phoneCode}${Client?.phone}`}
                      </Paragraph>
                    )}
                  </div>
                </div>

                <div className={styles.lead_item_header_actions}>
                  <div className={styles.lead_item_header_actions_items}>
                    {/** Assign to */}
                    <UserDropDown
                      AssignedTo={AssignedTo}
                      avatarSize={24} leadId={item.id}
                      permissions={permissions}
                      loading={users.loading}
                      users={users.data}
                      getUsers={getUsers}
                      reloadTableData={onRefresh}
                    />
                    {/** Change Status */}
                    <StatusDropdown
                      recordId={item.id} status={item.status}
                      permissions={permissions}
                      reloadTableData={onRefresh}
                    />

                    {/** Dropdown for more actions */}
                    <ActionsDropdown item={item} onDelete={onDelete} onEdit={onEdit} />
                  </div>

                  <div className="d-flex flex-column">
                    {item?.addedDate && (
                      <div className="d-flex mt-1 align-center">
                        <CalenderIcon className="mr-2" width={13} />
                        <Typography color="dark-sub" size="xs" className="mt-1">
                          {`Added: ${convertDate(item.addedDate, "dd MM yy")}` || "N/A"}
                        </Typography>
                      </div>
                    )}

                    {item?.dueDateForSubmissions && (
                      <div className="d-flex mt-1 align-center">
                        <CalenderIcon className="mr-2" width={13} />
                        <Typography
                          color={(isDateGreaterThan(item.dueDateForSubmissions, new Date()) && [LeadsStatus['In Progress'], LeadsStatus.New].includes(item.status)) ? "red-yp" : "dark-sub"}
                          size="xs" className="mt-1"
                        >
                          {`Due Date: ${convertDate(item.dueDateForSubmissions, "dd MM yy")}` || "N/A"}
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
              </div>

              <div>
                <Typography color="dark-main" size="sm" className="mt-1 text-underline">
                  Requirements
                </Typography>
                <Typography color="dark-sub" size="xs" className="mt-1 mb-3">
                  {item.message || "N/A"}
                </Typography>

                <Typography color="dark-sub" size="sm">
                  {`Project Type: ${item?.ProjectType?.title || "N/A"}`}
                </Typography>
                <div className="d-inline-flex align-center mt-1" onClick={() => onAttachmentClick(item)}>
                  <Typography color="dark-sub" size="sm" className="cursor-pointer">
                    {`${item?.Attachments?.length > 0 ? item?.Attachments?.length + " files Attached" : "  No Attachments"} `}
                  </Typography>
                  <Tooltip title="Manage Attachments">
                    <EditOutlined
                      className="ml-2 cursor-pointer"
                    />
                  </Tooltip>
                </div>
              </div>

              <div className={styles.lead_item_cards}>
                <LeadsQuotation
                  items={item}
                  onRefresh={onRefresh}
                  permissions={permissions} setDrawer={setDrawer}
                  setNewProject={setNewProject}
                />
                <LeadsNote
                count={item._count.LeadEnquiryFollowUp}
                  LeadEnquiryFollowUp={item.LeadEnquiryFollowUp}
                  onOpenNoteModal={() => onOpenNoteModal({
                    open: true, type: "notes", recordId: item.id
                  })}
                />
              </div>
            </div>
          )
        })}
      </section>

      {drawer.open && (
        <QuotationDrawer
          drawer={drawer}
          setDrawer={setDrawer}
          permissions={permissions}
          onRefresh={onRefresh}
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
export default LeadsCards;