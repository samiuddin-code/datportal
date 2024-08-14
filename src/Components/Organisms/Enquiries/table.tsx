import { useState, type FC, useMemo } from 'react';
import {
  Table, Typography as AntdTypography, Card, Tooltip, Button, message, Tag
} from 'antd';
import moment from 'moment';
import { CustomButton, Typography } from '@atoms/';
import { CalenderIcon } from '@icons/';
import { EnquirySource } from '@helpers/commonEnums';
import { convertDate } from '@helpers/dateHandler';
import { TableProps } from '@organisms/Common/common-types';
import { EnquiryType } from '@modules/Enquiry/types';
import { EnquiryPermissionsEnum } from '@modules/Enquiry/permissions';
import { UserTypes } from '@modules/User/types';
import { UserModule } from '@modules/User';
import { ProjectTypeType } from '@modules/ProjectType/types';
import UserDropDown from './assign-to';
import ActionComponent from './actions';
import StatusDropdown from './status';
import { getTableRowNumber } from '@helpers/common';

const { Paragraph } = AntdTypography;

interface EnquiriesTableProps extends TableProps<EnquiryType> {
  onAddNoteClick: (record: EnquiryType) => void;
  permissions: { [key in EnquiryPermissionsEnum]: boolean };
  projectTypeData: ProjectTypeType[];
  onAttachmentClick: (record: EnquiryType) => void;
}

type SearchedUserType = {
  data: UserTypes[];
  loading: boolean;
}

const EnquiriesTable: FC<EnquiriesTableProps> = (props) => {
  const {
    tableLoading, tableData, onEditIconClick, reloadTableData, meta,
    onAddNoteClick, projectTypeData, permissions, onAttachmentClick
  } = props;
  const { updateEnquiry, deleteEnquiry } = permissions

  const userModule = useMemo(() => new UserModule(), [])

  const [users, setUsers] = useState<SearchedUserType>({
    data: [], loading: false
  });

  const getUsers = (query?: { name: string }) => {
    setUsers((prev) => ({ ...prev, loading: true }));
    query = {
      name: query?.name || '',
    }

    userModule.getAllRecords(query).then((res) => {
      const data = res?.data?.data;
      setUsers({ data: data, loading: false });
    }).catch((err) => {
      message.error(err?.response?.data?.message || "Something went wrong");
      setUsers((prev) => ({ ...prev, loading: false }));
    })
  }

  const columns = [
    {
      title: "S.No",
      dataIndex: "index",
      key: "index",
      render: (_text: string, _record: {}, index: number) => getTableRowNumber(index, meta),
      width: "60px",
    },
    {
      title: 'User',
      dataIndex: "user",
      key: "user",
      render: (_user: string, record: EnquiryType) => (
        <div className="d-flex">
          <div className="my-auto">
            <Typography color="dark-main" weight='bold' size="sm">
              {`${record.name}`}
            </Typography>

            {record?.email && (
              <Paragraph
                title={record.email}
                ellipsis={{
                  rows: 1,
                  expandable: false,
                }}
                copyable={{ text: record.email }}
                className="font-size-xs color-dark-sub mb-0 mt-1"
              >
                {record.email}
              </Paragraph>
            )}

            {record?.phone && record?.phone !== "undefined" && (
              <Paragraph
                title={`+${record.phoneCode}${record.phone}`}
                ellipsis={{
                  rows: 1,
                  expandable: false,
                }}
                copyable={{ text: `+${record.phoneCode}${record.phone}` }}
                className="font-size-xs color-dark-sub mb-0 mt-1"
              >
                {`+${record.phoneCode}${record.phone}`}
              </Paragraph>
            )}

            <Typography color="dark-sub" size="xs">
              {`Source: ${EnquirySource[record.source]}`}
            </Typography>

            <div className="d-flex flex-column">
              {record?.addedDate && (
                <div className="d-flex mt-1 align-center">
                  <CalenderIcon className="mr-2" width={13} />
                  <Typography color="dark-sub" size="xs" className="mt-1">
                    {`Added: ${convertDate(record.addedDate, "dd MM yy")}` || "N/A"}
                  </Typography>
                </div>
              )}

              {record?.modifiedDate && (
                <div className="d-flex align-center">
                  <CalenderIcon className="mr-2" width={13} />
                  <Typography color="dark-sub" size="xs" className="mt-1">
                    {`Modified: ${convertDate(record.modifiedDate, "dd MM yy")}` || "N/A"}
                  </Typography>
                </div>
              )}
            </div>
          </div>
        </div>
      ),
      width: "200px",
    },
    {
      title: 'Assigned To',
      dataIndex: "AssignedTo",
      key: "AssignedTo",
      render: (AssignedTo: EnquiryType['AssignedTo'], record: EnquiryType) => (
        <UserDropDown
          AssignedTo={AssignedTo}
          enquiryId={record.id}
          permissions={permissions}
          loading={users.loading}
          users={users.data}
          getUsers={getUsers}
          reloadTableData={reloadTableData}
        />
      ),
      width: "200px",
    },
    {
      title: "Message/Note",
      dataIndex: "message",
      key: "message",
      render: (message: string, record: EnquiryType) => {
        const { LeadEnquiryFollowUp } = record;
        return (
          <>
            <div
              style={{
                backgroundColor: "var(--color-border)",
                padding: "10px",
                borderRadius: "2px",
                fontSize: "var(--font-size-sm)",
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: message }} />
              <span className="font-size-sm color-dark-main font-weight-bold">
                Project Type: {record?.ProjectType?.title}
              </span>
              <div>
                {LeadEnquiryFollowUp?.length === 0 && (
                  <CustomButton
                    size='xs' fontSize='xs' type='plain' className='mt-1'
                    onClick={() => onAddNoteClick(record)}
                  >
                    Add Note
                  </CustomButton>
                )}
              </div>
            </div>
            {/** Notes */}
            {LeadEnquiryFollowUp?.length > 0 && (
              <Card
                size="small"
                title={
                  <div className="d-flex justify-space-between align-center">
                    <Typography color="dark-main" size="sm" weight='semi'>Notes</Typography>
                    <Tooltip
                      title={updateEnquiry === false ? "You don't have permission to add notes" : ""}
                    >
                      <Button
                        type="link" size='small'
                        onClick={() => onAddNoteClick(record)}
                        style={{
                          padding: "0px 0.5rem", margin: 0,
                          fontSize: '12px', fontWeight: 500,
                          color: "var(--color-dark-sub)",
                          backgroundColor: "var(--color-inactive)",
                        }}
                        disabled={updateEnquiry === false}
                      >
                        Manage Notes
                      </Button>
                    </Tooltip>
                  </div>
                }
                headStyle={{ padding: "0px 0.5rem", margin: 0 }}
                className={"mt-2"}
              >
                {LeadEnquiryFollowUp?.length > 0 ? LeadEnquiryFollowUp?.map((item, index) => (
                  <div
                    key={`notes-${index}`} className="mb-2"
                    style={{
                      borderBottom: index === LeadEnquiryFollowUp?.length - 1 ? '' : '1px solid var(--color-border)',
                      paddingBottom: index === LeadEnquiryFollowUp?.length - 1 ? '' : '0.5rem'
                    }}
                  >
                    <div className='d-flex align-center'>
                      <span className="font-size-sm color-dark-800">
                        {item.AddedBy.firstName + " " + item.AddedBy.lastName}
                      </span>
                      <span
                        className="font-size-xs color-dark-sub ml-2"
                        style={{ opacity: 0.7 }}
                      >
                        {moment(item?.addedDate).fromNow()}

                        {item.isConcern && (
                          <Tag color="warning" className="ml-2">
                            Concern
                          </Tag>
                        )}

                        {item.isResolved && (
                          <Tag color="green" className="ml-2">
                            Resolved
                          </Tag>
                        )}
                      </span>
                    </div>
                    <Paragraph
                      ellipsis={{ rows: 2, expandable: true }}
                      className="font-size-xs color-dark-sub mb-0"
                    >

                      {item?.note}
                    </Paragraph>
                  </div>
                )) : (
                  <div className="font-size-xs color-dark-sub text-center">No Notes</div>
                )}
              </Card>
            )}
          </>
        )
      },
      width: "450px",
    },
    {
      title: 'Status',
      dataIndex: "status",
      key: "status",
      render: (status: number, record: EnquiryType) => (
        <StatusDropdown
          record={record} status={status}
          permissions={permissions}
          reloadTableData={reloadTableData}
          projectTypeData={projectTypeData!}
        />
      ),
      width: "200px",
    },
    {
      title: 'Attachments',
      dataIndex: "Attachments",
      key: "Attachments",
      render: (Attachments: EnquiryType['Attachments'], record: EnquiryType) => (
        <Typography
          color={`${Attachments?.length > 0 ? "dark-main" : "dark-sub"}`}
          className="text-underline cursor-pointer"
          onClick={() => onAttachmentClick(record)}
        >
          {`${Attachments?.length > 0 ? Attachments?.length + " files" : "  No Attachments"} `}
        </Typography>
      ),
      width: "200px",
    },
  ];

  if (updateEnquiry === true || deleteEnquiry) {
    columns.push({
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_actions: string, record: EnquiryType) => (
        <ActionComponent
          record={record}
          onEditIconClick={onEditIconClick}
          reloadTableData={reloadTableData}
          onAddNoteClick={onAddNoteClick}
          permissions={permissions}
        />
      ),
      width: "120px",
    })
  }

  return (
    <Table
      sticky
      dataSource={tableData}
      columns={columns}
      pagination={false}
      scroll={{ x: 991 }}
      loading={tableLoading}
      rowKey={(record) => `enquiry-${record.id}`}
    />
  );
}
export default EnquiriesTable;