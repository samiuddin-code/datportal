import { FC, useMemo, useState } from "react";
import { Card, Dropdown, Space, message } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { TransactionsModule } from "@modules/Transactions";
import { TransactionQueryType } from "@modules/Transactions/types";
import styles from "./styles.module.scss";
import { TransactionsPermissionsEnum } from "@modules/Transactions/permissions";
import { QueryType } from "@modules/Common/common.interface";
import { TransactionStatusOptions } from "@helpers/options";
import { TransactionStatus } from "@helpers/commonEnums";

type StatusDropdownProps = {
  status: number;
  recordId: number;
  reloadTableData: (query?: QueryType<TransactionQueryType>) => void;
  permissions: { [key in TransactionsPermissionsEnum]: boolean };
}

/** Status Dropdown */
const StatusDropdown: FC<StatusDropdownProps> = (props) => {
  const {
    status, recordId, reloadTableData,
    permissions: { updateTransaction }
  } = props

  const [messageApi, contextHolder] = message.useMessage();

  const module = useMemo(() => new TransactionsModule(), []);

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
  const onVisibleChange = (flag: boolean) => setVisible(flag);

  const onStatusChange = (_status: number) => {
    if (recordId && updateTransaction === true) {
      openMessage({
        key: "update", type: "loading",
        content: "Updating..."
      });

      const data = { status: _status }

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
        openMessage({
          key: "update", type: "error",
          content: err?.response?.data?.message
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
      {TransactionStatusOptions.map((option, index) => {
        const value = Number(option.value)
        const isSelected = status === value

        return (
          <div
            key={`transactions-status-${index}`}
            className={styles.overlay_item}
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
        trigger={updateTransaction === true ? ["click"] : []}
        open={updateTransaction === true ? visible : false}
        onOpenChange={onVisibleChange}
        className={styles.dropdown}
      >
        <Space
          style={{
            // backgroundColor: statusColors[status as keyof TransactionsStatusColors],
            padding: "0.2rem 0.5rem",
            borderRadius: "0.25rem",
            fontSize: "0.8rem",
          }}
        >
          {TransactionStatus[status]}

          {updateTransaction === true && <DownOutlined />}
        </Space>
      </Dropdown>
    </>
  );
}

export default StatusDropdown;