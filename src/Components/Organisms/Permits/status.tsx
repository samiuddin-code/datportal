import { FC, useMemo, useState } from "react";
import { Card, Dropdown, Space, message } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { PermitClientStatus, PermitFinanceStatus } from "@helpers/commonEnums";
import { ClientStatusOptions, FinanceStatusOptions } from "@helpers/options";
import { PermitsModule } from "@modules/Permits";
import styles from "./styles.module.scss";
import { PermitsPermissionsEnum } from "@modules/Permits/permissions";
import { QueryType } from "@modules/Common/common.interface";
import { PermitsQueryType } from "@modules/Permits/types";
import { handleError } from "@helpers/common";

type StatusDropdownProps = {
  status: number;
  recordId: number;
  reloadTableData: (query?: QueryType<PermitsQueryType>) => void;
  permissions: { [key in PermitsPermissionsEnum]: boolean };
  type: "finance" | "client"
}

type StatusEnumTypes = {
  finance: {
    enum: typeof PermitFinanceStatus;
    options: { label: string; value: string }[];
    colors: { [key: number]: string }
  },
  client: {
    enum: typeof PermitClientStatus;
    options: { label: string; value: string }[];
    colors: { [key: number]: string }
  }
}

const statusEnum: StatusEnumTypes = {
  finance: {
    enum: PermitFinanceStatus,
    options: FinanceStatusOptions,
    colors: {
      [PermitFinanceStatus["Pending Payment"]]: "var(--color-yellow-dark)",
      [PermitFinanceStatus.Paid]: "var(--color-primary-main)",
      [PermitFinanceStatus.Canceled]: "var(--color-red-yp)",
    }
  },
  client: {
    enum: PermitClientStatus,
    options: ClientStatusOptions,
    colors: {
      [PermitClientStatus["To be sent"]]: "var(--color-yellow-dark)",
      [PermitClientStatus.Sent]: "var(--color-primary-main)",
    },
  }
}

/** Status Dropdown */
const StatusDropdown: FC<StatusDropdownProps> = (props) => {
  const {
    status, recordId, reloadTableData, type,
    permissions: { updatePermit }
  } = props

  const [messageApi, contextHolder] = message.useMessage();

  const module = useMemo(() => new PermitsModule(), []);

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

  const onStatusChange = (_status: number) => {
    if (recordId && updatePermit === true) {
      openMessage({
        key: "update", type: "loading",
        content: "Updating..."
      });

      const data = {
        financeStatus: type === "finance" ? _status : undefined,
        clientStatus: type === "client" ? _status : undefined,
      }

      module.updateRecord(data, recordId).then((res) => {
        if (res?.data?.data) {
          openMessage({
            key: "update", type: "success",
            content: res?.data?.message
          });
          setVisible(!visible)

          reloadTableData()
        }
      }).catch((err) => {
        const errorMessage = handleError(err)
        openMessage({
          key: "update", type: "error",
          content: errorMessage
        });
      });
    } else {
      openMessage({
        key: "update", type: "error",
        content: "You don't have permission to change status"
      });
    }
  }

  const overlay = (
    <Card className={`${styles.overlay} pa-2`}>
      {statusEnum[type].options.map((option, index) => {
        const value = Number(option.value)
        const isSelected = status === value

        return (
          <div
            key={`Permits-status-${index}`} className={styles.overlay_item}
            onClick={() => {
              if (!isSelected) {
                onStatusChange(value)
              }
            }}
          >
            <span
              className={isSelected ? styles.disabledButton : ""}
              style={{ width: "100%" }}
            >
              {option.label}
            </span>
          </div>
        )
      })}
    </Card>
  )

  return (
    <>
      {contextHolder}
      <Dropdown
        dropdownRender={() => overlay}
        trigger={updatePermit === true ? ["click"] : []}
        open={updatePermit === true ? visible : false}
        onOpenChange={onVisibleChange}
        className={styles.dropdown}
      >
        <Space
          style={{
            color: statusEnum[type].colors[status],
            padding: "0.2rem 0.5rem",
            borderRadius: "0.25rem",
            fontSize: "0.8rem",
          }}
        >
          {statusEnum[type].enum[status]}

          {updatePermit === true && <DownOutlined />}
        </Space>
      </Dropdown>
    </>
  );
}

export default StatusDropdown;