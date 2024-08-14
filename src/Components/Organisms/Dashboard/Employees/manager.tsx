import { FC, useEffect, useMemo, useState } from "react";
import { Card, Divider, Skeleton, message, Dropdown, Space, Avatar } from "antd";
import { DownOutlined, UserOutlined } from "@ant-design/icons";
import { useDebounce } from "@helpers/useDebounce";
import { UserTypes } from "@modules/User/types";
import { CustomEmpty, CustomInput, Typography } from "@atoms/";
import { RESOURCE_BASE_URL } from "@helpers/constants";
import styles from "./styles.module.scss";
import { handleError } from "@helpers/common";
import { UserModule } from "@modules/User";
import { UserPermissionsEnum } from "@modules/User/permissions";

type UserDropDownProps = {
  Manager: UserTypes['Manager'];
  users: Partial<UserTypes[]>
  getUsers: (query: { name: string }) => void;
  userId: number;
  loading: boolean
  reloadTableData: (query?: { [key: string]: any }) => void
  permissions: { [key in UserPermissionsEnum]: boolean };
};

const UserDropDown: FC<UserDropDownProps> = (props) => {
  const {
    Manager, users, loading, permissions: { updateUser },
    getUsers, userId, reloadTableData,
  } = props;
  const [messageApi, contextHolder] = message.useMessage();

  const module = useMemo(() => new UserModule(), []);
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

  const onUserChange = (managerId: number) => {
    if (managerId && updateUser === true) {
      openMessage({
        key: "update", type: "loading",
        content: "Updating..."
      });

      module.updateRecord({ managerId: managerId }, userId).then((res) => {
        if (res?.data?.data) {
          openMessage({
            key: "update", type: "success",
            content: res?.data?.message
          });
          setVisible(!visible)

          reloadTableData();
        }
      }).catch((err) => {
        const errorMessage = handleError(err);
        openMessage({
          key: "update", type: "error",
          content: errorMessage || "Something went wrong"
        });
      });
    } else {
      openMessage({
        key: "update", type: "error",
        content: "You don't have permission to assign enquiry"
      });
    }
  }


  const overlay = (
    <Card className={`${styles.overlay} pa-2`}>
      <CustomInput
        label="Assign this employee to"
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
                      if ((Manager?.id !== user?.id) && (updateUser === true)) {
                        const selectedUser = Number(user?.id)
                        onUserChange(selectedUser)
                      }
                    }}
                  >
                    <span className={(Manager?.id === user?.id) ? styles.disabledButton : ""}>
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
                description={debouncedSearchTerm ? "No results found, please modify your search term" : `Please search for a manager to assign this employee to`}
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
        trigger={updateUser === true ? ["click"] : []}
        open={updateUser === true ? visible : false}
        onOpenChange={onVisibleChange}
        className={styles.dropdown}
      >
        <Space>
          <div style={{
            display: "flex", alignItems: "center", width: "100%",
            cursor: updateUser === true ? "pointer" : "default"
          }}>
            <Avatar
              src={`${RESOURCE_BASE_URL}${Manager?.profile}`}
              icon={<UserOutlined />}
              size={30}
              style={{ border: '0.5px solid var(--color-border)' }}
            />
            <Typography
              color="dark-sub" size="sm"
              className="ml-1"
            >
              {`${(Manager?.firstName && Manager?.lastName) ? `${Manager?.firstName} ${Manager?.lastName}` : "Assign To"}`}
            </Typography>
          </div>

          {updateUser === true && <DownOutlined />}
        </Space>
      </Dropdown>
    </>
  );
}

export default UserDropDown;