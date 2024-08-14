import { FC, useEffect, useMemo, useState } from "react";
import { Card, Divider, Skeleton, message, Dropdown, Space, Avatar } from "antd";
import { DownOutlined, UserOutlined } from "@ant-design/icons";
import { useDebounce } from "@helpers/useDebounce";
import { LeadsModule } from "@modules/Leads";
import { LeadsPermissionsEnum } from "@modules/Leads/permissions";
import { LeadsTypes } from "@modules/Leads/types";
import { UserTypes } from "@modules/User/types";
import { Typography, CustomInput, CustomEmpty } from "@atoms/";
import { RESOURCE_BASE_URL } from "@helpers/constants";
import styles from "./styles.module.scss";

type UserDropDownProps = {
  AssignedTo: LeadsTypes['AssignedTo'];
  users: Partial<UserTypes[]>
  getUsers: (query: { name: string }) => void;
  leadId: number;
  loading: boolean
  reloadTableData: (query?: { [key: string]: any }) => void
  permissions: { [key in LeadsPermissionsEnum]: boolean };
  avatarSize?: number;
};

const UserDropDown: FC<UserDropDownProps> = (props) => {
  const {
    AssignedTo, users, loading, permissions: { assignLeads },
    getUsers, leadId, reloadTableData, avatarSize
  } = props;
  const [messageApi, contextHolder] = message.useMessage();

  const module = useMemo(() => new LeadsModule(), []);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const openMessage = (data: {
    key: string;
    type: "success" | "error" | "info" | "warning" | "loading";
    content: string
  }) => {
    messageApi.open({
      key: data.key, type: data.type,
      content: data.content,
      duration: data.type === "loading" ? 0 : 2,
    });
  };

  // controls the dropdown visibility
  const [visible, setVisible] = useState<boolean>(false);

  // handle dropdown menu visibility change event
  const onVisibleChange = (flag: boolean) => setVisible(flag);

  useEffect(() => {
    if (debouncedSearchTerm) {
      getUsers({ name: debouncedSearchTerm });
    }
  }, [debouncedSearchTerm]);

  const onUserChange = (userId: number) => {
    if (userId && assignLeads === true) {
      openMessage({
        key: "update", type: "loading",
        content: "Updating..."
      });

      module.assignLead({ assignedToId: userId }, leadId).then((res) => {
        if (res?.data?.data) {
          openMessage({
            key: "update", type: "success",
            content: res?.data?.message
          });
          setVisible(!visible)

          reloadTableData();
        }
      }).catch((err) => {
        openMessage({
          key: "update", type: "error",
          content: err?.response?.data?.message || "Something went wrong"
        });
      });
    } else {
      openMessage({
        key: "update", type: "error",
        content: "You don't have permission to assign leads"
      });
    }
  }

  const overlay = (
    <Card className={`${styles.overlay} pa-2`}>
      <CustomInput
        placeHolder="Search User..."
        value={searchTerm} size="w100"
        onChange={(e: any) => {
          const { value } = e.target;
          searchTerm !== value && setSearchTerm(value);
        }}
        icon={<img src="/images/searchIcon.svg" alt="Search Icon" />}
      />

      {loading ? (
        <Skeleton active className="mt-1" />
      ) : (
        <>
          {users?.length > 0 ? (
            <>
              {users?.map((user) => {
                return (
                  <div
                    key={`users-${user?.id}`}
                    className={styles.overlay_item}
                    onClick={() => {
                      if ((AssignedTo?.id !== user?.id) && (assignLeads === true)) {
                        const selectedUser = Number(user?.id)
                        onUserChange(selectedUser)
                      }
                    }}
                  >
                    <span className={(AssignedTo?.id === user?.id) ? styles.disabledButton : ""}>
                      {user?.firstName} {user?.lastName} - {`(${user?.email})`}
                    </span>
                    <Divider className="my-0" />
                  </div>
                )
              })}
            </>
          ) : (
            <div className={styles.overlay_item_noData}>
              <CustomEmpty
                description={debouncedSearchTerm ? "No results found, please modify your search term" : `Please search for a user to assign this lead to`}
              />
            </div>
          )}
        </>
      )}
    </Card>
  )

  return (
    <>
      {contextHolder}
      <Dropdown
        dropdownRender={() => overlay}
        trigger={assignLeads === true ? ["click"] : []}
        open={assignLeads === true ? visible : false}
        onOpenChange={onVisibleChange}
        className={styles.dropdown}
      >
        <Space>
          <div
            style={{
              display: "flex", alignItems: "center", width: "100%",
              cursor: assignLeads === true ? "pointer" : "default"
            }}
          >
            <Avatar
              src={`${RESOURCE_BASE_URL}${AssignedTo?.profile}`}
              icon={<UserOutlined />}
              size={avatarSize || 30}
            />
            <Typography color="dark-sub" size="sm" className="ml-1">
              {`${(AssignedTo?.firstName && AssignedTo?.lastName) ? `${AssignedTo?.firstName} ${AssignedTo?.lastName}` : "Assign To"}`}
            </Typography>
          </div>
        </Space>
      </Dropdown>
    </>
  );
}

export default UserDropDown;