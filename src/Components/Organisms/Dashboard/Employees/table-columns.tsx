import { useMemo, useState } from "react";
import {
  Popconfirm, Table, Image, Tooltip, message, Card,
  Dropdown, Space, Typography as AntdTypography, MenuProps,
} from "antd";
import { DeleteOutlined, AppstoreAddOutlined } from "@ant-design/icons";
import { Typography } from "@atoms/";
import { DownOutlined } from "@ant-design/icons";
import styles from "@organisms/Common/styles.module.scss";
import componentStyles from "./styles.module.scss";
import { TableProps, ActionComponentProps } from "@organisms/Common/common-types";
import { RESOURCE_BASE_URL } from "@helpers/constants";
import { UserTypes } from "@modules/User/types";
import { UserModule } from "@modules/User";
import { useSelector } from "react-redux";
import { RootState } from "Redux/store";
import { CalenderIcon, PasswordUnlock, MoreIcon } from "@icons/";
import ResetPasswordModal from "./ResetPassword";
import LoginAsModal from "./LoginAs";
import { SuperAdminEmails, UserStatus } from "@helpers/commonEnums";
import { capitalize, cleanup, getTableRowNumber } from "@helpers/common";
import { convertDate } from "@helpers/dateHandler";
import { UserPermissionsEnum } from "@modules/User/permissions";
import UserDropDown from "./manager";
import { ColumnsType } from "antd/es/table";
import TokenService from "@services/tokenService";
import { Switch } from "../../../Atoms/Switch";

const { Paragraph } = AntdTypography;

type PermissionType = { [key in UserPermissionsEnum]: boolean };

interface _ActionComponentProps extends ActionComponentProps {
  record: UserTypes,
  onPasswordResetClick: (record: UserTypes) => void;
  onLoginAsClick: (record: UserTypes) => void;
  permissions: PermissionType;
}

const ActionComponent = (props: _ActionComponentProps) => {
  const {
    record, onEditIconClick, reloadTableData, onLoginAsClick,
    onPasswordResetClick, permissions: { deleteUser,
      updateUser, loginAsOtherUser
    }
  } = props;

  const { loggedInUserData } = useSelector((state: RootState) => state.usersReducer);

  const userData = loggedInUserData?.data;

  const [actionState, setActionState] = useState({
    confirmLoading: false,
    openPopConfirm: false,
  });

  const module = useMemo(() => new UserModule(), []);

  const handleDelete = () => {
    setActionState({
      ...actionState,
      confirmLoading: true,
    });

    if (deleteUser === false) {
      message.error("You don't have permission to delete this user, please contact your admin.");
      setActionState({
        ...actionState,
        openPopConfirm: false,
      });
      return;
    }

    module.deleteRecord(record.id).then((_res) => {
      setActionState({
        ...actionState,
        openPopConfirm: false,
        confirmLoading: false,
      });
      reloadTableData();
    }).catch((_err) => {
      setActionState({
        ...actionState,
        confirmLoading: false,
      });
    });
  };

  const showPopconfirm = () => {
    setActionState({
      ...actionState,
      openPopConfirm: true,
    });
  };

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: updateUser && (
        <Tooltip title="Edit">
          <div className={`${styles.actions} ${componentStyles.overlay_card_item}`} onClick={() => onEditIconClick(record)}>
            <span >
              <img src="/images/editicon.svg" alt="" />
            </span>
            Edit
          </div>
        </Tooltip>
      ),
    },

    {
      key: '2',
      label: (updateUser === true) ? (
        <>
          {(!SuperAdminEmails?.includes(record.email)) ? (
            <Tooltip title="Reset Password for this user.">
              <div className={`${styles.actions} ${componentStyles.overlay_card_item}`} onClick={() => onPasswordResetClick(record)}>

                <span>
                  <PasswordUnlock

                    color="#fff"
                    width={18}
                    height={18}
                  />
                </span>
                Reset Password
              </div>
            </Tooltip>
          ) : (
            <Tooltip
              title="You cannot reset password for super admin."
            >
              <div className={`${styles.actions} ${componentStyles.overlay_card_item}`}>

                <span>
                  <PasswordUnlock
                    color="#fff"
                    width={18}
                    height={18}
                    style={{ cursor: "not-allowed", opacity: "0.6" }}
                  />
                </span>
                Reset Password
              </div>
            </Tooltip>
          )}
        </>
      ) : null,
    },
    {
      key: '3',
      label: (updateUser === true) ? (
        <Tooltip title="Allocate resources to this user.">
          <div className={`${styles.actions} ${componentStyles.overlay_card_item}`} onClick={() => onEditIconClick(record, '4')}>

            <span>
              <AppstoreAddOutlined

                style={{ color: "#fff" }}
                width={18}
                height={18}
              />
            </span>
            Allocate Resources
          </div>
        </Tooltip>
      ) : null
    },
    {
      key: '4',
      label: loginAsOtherUser === true && (
        <Tooltip
          title={`Login as ${record?.firstName} ${record?.lastName}`}
          placement="left"
        >
          <div className={`${styles.actions} ${componentStyles.overlay_card_item}`} onClick={() => onLoginAsClick(record)}>

            <span >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                color="#fff"
                width={20}
                height={20}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                />
              </svg>
            </span>
            Login as {record?.firstName} {record?.lastName}
          </div>
        </Tooltip>
      )
    }, {
      key: '5',
      label: (deleteUser && userData?.id === record?.id) ? (
        <Tooltip title="You cannot delete yourself.">
          <div className={`${styles.actions} ${componentStyles.overlay_card_item}`}>
            <DeleteOutlined
              className={styles.bg__red}
              style={{ cursor: "not-allowed", opacity: "0.2" }}
            />
            Delete
          </div>
        </Tooltip>
      ) : (
        <Popconfirm
          open={actionState.openPopConfirm}
          placement="top"
          title="Are you sure?"
          onConfirm={handleDelete}
          onCancel={() => setActionState({ ...actionState, openPopConfirm: false })}
          okButtonProps={{ loading: actionState.confirmLoading }}
          okText="Yes"
          cancelText="No"
          onOpenChange={(visible) => {
            if (!visible) {
              setActionState({ ...actionState, openPopConfirm: false });
            }
          }}
        >
          <div className={`${styles.actions} ${componentStyles.overlay_card_item}`} onClick={showPopconfirm}>
            <DeleteOutlined className={styles.bg__red} />
            Delete
          </div>
        </Popconfirm>
      ),
    },
  ]
  return (
    <Dropdown menu={{ items }} trigger={["click"]}>
      <span style={{ cursor: "pointer", padding: '5px' }}>
        <MoreIcon
          height={25} width={25} color="#7e869a"
        />
      </span>
    </Dropdown>
  );
};

type StatusComponentProps = {
  record: UserTypes;
  status: number;
  reloadTableData: (query?: any) => void;
  permissions: PermissionType
};

const statusColors: any = {
  1: '#00A884',
  2: "#f50",
}

const StatusComponent = (props: StatusComponentProps) => {
  const {
    record, status, reloadTableData,
    permissions: { updateUser }
  } = props;
  const [messageApi, contextHolder] = message.useMessage();
  const module = useMemo(() => new UserModule(), []);

  const openMessage = (data: {
    key: string;
    type: "success" | "error" | "info" | "warning" | "loading";
    content: string
  }) => {
    messageApi.open({
      key: data.key,
      type: data.type,
      content: data.content,
      duration: data.type === "loading" ? 0 : 2,
    });
  };

  // controls the dropdown visibility
  const [visible, setVisible] = useState<boolean>(false);

  // handle dropdown menu visibility change event
  const onVisibleChange = (flag: boolean) => {
    setVisible(flag);
  };

  const onStatusChange = (status: number) => {
    if (record?.id && updateUser === true) {
      openMessage({
        key: "update",
        type: "loading",
        content: "Updating..."
      });

      module.updateRecord({ status: status }, record?.id).then((res) => {
        if (res?.data?.data) {
          openMessage({
            key: "update",
            type: "success",
            content: res?.data?.message
          });
          setVisible(!visible)

          reloadTableData()
        }
      }).catch((err) => {
        openMessage({
          key: "update",
          type: "error",
          content: err?.response?.data?.message
        });
      });
    } else {
      openMessage({
        key: "update",
        type: "error",
        content: "You don't have permission to change status"
      });
    }
  }

  const overlay = (
    <Card className={`${componentStyles.overlay} pa-2`}>
      {contextHolder}
      {Object.entries(UserStatus).map(([key, value]) => {
        return (
          <div
            key={`user-status-${key}`}
            className={componentStyles.overlay_item}
            onClick={() => {
              if (status !== Number(value) && updateUser === true) {
                const selectedStatus = Number(value)
                onStatusChange(selectedStatus)
              }
            }}
          >
            <span className={(status === Number(value)) ? componentStyles.disabledButton : ""}>
              {capitalize(key)}
            </span>
          </div>
        )
      })}
    </Card>
  )

  return (
    <div>
      <Dropdown
        dropdownRender={() => overlay}
        trigger={updateUser === true ? ["click"] : []}
        open={updateUser === true ? visible : false}
        onOpenChange={onVisibleChange}
        className={componentStyles.dropdown}
      >
        <div>
          <Space
            style={{
              backgroundColor: statusColors[status],
              color: "#fff",
              padding: "0.2rem 0.5rem",
              borderRadius: "0.25rem",
              fontSize: "0.8rem",
              display: "flex",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            {Object.entries(UserStatus).map(([key, value]) => {
              return value === String(status) && capitalize(key)
            })}

            {updateUser === true && <DownOutlined />}
          </Space>
        </div>
      </Dropdown >
    </div>
  );
}

type SearchedUserType = {
  data: UserTypes[];
  loading: boolean;
}


export default function TableComponent(props: TableProps & {
  tableData: UserTypes[],
  onManageRolesClick: (record: UserTypes) => void,
}) {
  const {
    tableData, tableLoading, onEditIconClick, reloadTableData,
    onManageRolesClick, meta
  } = props;
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as PermissionType;
  const { updateUser, loginAsOtherUser } = permissions

  const userModule = useMemo(() => new UserModule(), [])
  const [users, setUsers] = useState<SearchedUserType>({
    data: [], loading: false
  });

  const user = TokenService.getUserData();

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

  const onEnableRemoteCheckinChange = (checked: boolean, recordId: number) => {
		return userModule.updateRecord({ enableRemoteCheckin: checked }, recordId);
	};

  // controls the password reset modal visibility
  const [passwordResetModal, setPasswordResetModal] = useState<{
    isOpen: boolean; record?: UserTypes;
  }>({ isOpen: false, record: undefined });

  const onPasswordResetClick = (record: UserTypes) => {
    if (updateUser === true) {
      setPasswordResetModal({
        isOpen: true,
        record: record,
      });
    } else {
      message.error(`You don't have permission to reset password for ${record?.firstName} ${record?.lastName}`);
      return;
    }
  };

  // controls the login as modal visibility
  const [loginAsModal, setLoginAsModal] = useState<{
    isOpen: boolean; record?: UserTypes;
  }>({ isOpen: false, record: undefined });

  const onLoginAsClick = (record: UserTypes) => {
    if (loginAsOtherUser === true) {
      setLoginAsModal({
        isOpen: true,
        record: record,
      });
      cleanup()
    } else {
      message.error(`You don't have permission to login as ${record?.firstName} ${record?.lastName}`);
      return;
    }
  };

  const columns: ColumnsType<UserTypes> = [
    {
      title: "S.No",
      dataIndex: "index",
      key: "index",
      render: (_text: string, _record: UserTypes, index: number) => (
        <>
          {getTableRowNumber(index, meta)}
        </>
      ),
      width: "5%",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_text: string, record: UserTypes) => (
        <div>
          <div style={{ display: "flex" }}>
            <a href={(user.id === record.id || permissions?.manageAllUser ) ? ("/employees/" + record.id) : undefined}>
              <Typography color="dark-main" size="sm" weight="bold" className="my-auto mr-1">
                {`${record.firstName} ${record.lastName}`}
              </Typography>
            </a>
          </div>

          <div>
            <Paragraph
              ellipsis={{
                rows: 1,
                expandable: false,
              }}
              className="my-0 color-dark-sub"
            >
              <a href={`mailto:${record.email}`} className="font-size-xs">
                <span className="color-dark-sub">{record.email}</span>
              </a>
            </Paragraph>
          </div>

          <div>
            {record.phone ? (
              <a href={`tel:${record.phone}`} className="color-dark-sub font-size-xs">
                {record.phone !== null && record.phoneCode !== null
                  ? "+" + record?.phoneCode + record.phone
                  : "N/A"}
              </a>
            ) : (
              <Typography color="dark-sub" size="xs">
                N/A
              </Typography>
            )}
          </div>

          <div>
            <Paragraph
              className="font-size-xs color-dark-sub mb-0"
              title={record.id.toString()}
            >
              Employee ID: {record.id}
            </Paragraph>
          </div>
          {record.addedDate && (
            <div className="d-flex mt-2">
              <CalenderIcon className="mr-2" />
              <Typography color="dark-sub" size="sm">
                {`${convertDate(record.addedDate, "dd MM yy")}`}
              </Typography>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Profile",
      dataIndex: "profile",
      key: "profile",
      render: (profile: string) =>
        profile ? (
          <Image
            width={80}
            height={80}
            src={`${RESOURCE_BASE_URL}${profile}`}
            preview={false}
            rootClassName="object-fit-cover"
            style={{
              borderRadius: "50%",
              border: '0.5px solid var(--color-border)',
            }}
          />
        ) : (
          <></>
        ),
    },
    {
      title: "Designation",
      dataIndex: "designation",
      key: "designation",
      render: (designation: string) =>
        <Typography color="dark-sub" size="xs">
          {designation || ""}
        </Typography>
    }
  ];

  if (permissions.manageAllUser) {
    columns.push({
      title: "Manager",
      dataIndex: "Manager",
      key: "Manager",
      render: (Manager: UserTypes['Manager'], record: UserTypes) => (
        <UserDropDown
          Manager={Manager}
          userId={record.id}
          permissions={permissions}
          loading={users.loading}
          users={users.data}
          getUsers={getUsers}
          reloadTableData={reloadTableData}
        />
      ),
      // width: "250px",
    },
      {
        title: "Role",
        dataIndex: "role",
        key: "role",
        render: (_text: string, record: UserTypes) => (
          <>
            <Paragraph
              ellipsis={{
                rows: 1,
                expandable: false,
              }}
              className="my-0 color-dark-sub"
            >
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                }}
              >
                {record.userRole?.map((item) => (
                  <li className="font-size-xs ml-0">{item.Role.title}</li>
                ))}
              </ul>
            </Paragraph>

            <p
              className="color-dark-main font-weight-bold font-size-sm mb-0 ml-1 cursor-pointer"
              onClick={() => onManageRolesClick(record)}
            >
              Manage Roles
            </p>
          </>
        ),
      },
      {
        title: "Remote Checkin",
        dataIndex: "enableRemoteCheckin",
        key: "enableRemoteCheckin",
        render: (checked: boolean | undefined, record: UserTypes) => (
          <Switch
            checked={checked}
            onChange={onEnableRemoteCheckinChange}
            recordId={record.id}
          />
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status: number, record: UserTypes) => (
          <StatusComponent
            status={status}
            record={record}
            reloadTableData={reloadTableData}
            permissions={permissions}
          />
        ),
        width: "150px"
      },
    )
  }

  if (permissions?.manageAllUser || permissions?.deleteUser) {
    columns.push({
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_text: string, record: UserTypes) => (
        <ActionComponent
          record={record}
          onEditIconClick={onEditIconClick}
          reloadTableData={reloadTableData}
          onPasswordResetClick={onPasswordResetClick}
          onLoginAsClick={onLoginAsClick}
          permissions={permissions}
        />
      ),
      width: "7.5%"
    });
  }

  return (
    <>
      <div className={styles.antdTableWrapper}>
        <Table
          sticky
          dataSource={tableData}
          columns={columns}
          pagination={false}
          scroll={{ x: 991 }}
          loading={tableLoading}
          rowKey={(record: UserTypes) => `site-user-${record.id}`}
        />
      </div>

      {passwordResetModal.isOpen && (
        <ResetPasswordModal
          isOpen={passwordResetModal.isOpen}
          handleCancel={() => setPasswordResetModal({ ...passwordResetModal, isOpen: false })}
          record={passwordResetModal.record!}
          updateUser={updateUser}
        />
      )}

      {loginAsModal.isOpen && (
        <LoginAsModal
          isOpen={loginAsModal.isOpen}
          handleCancel={() => setLoginAsModal({ ...loginAsModal, isOpen: false })}
          record={loginAsModal.record!}
          loginAsOtherUser={loginAsOtherUser}
        />
      )}
    </>
  );
}
