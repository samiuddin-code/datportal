import { FC, useMemo, useState } from "react";
import { Card, Dropdown, Space, message } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { LeadsStatus, LeadsStatusOptions } from "@helpers/commonEnums";
import { LeadsModule } from "@modules/Leads";
import { LeadsParamTypes } from "@modules/Leads/types";
import styles from "./styles.module.scss";
import { LeadsPermissionsEnum } from "@modules/Leads/permissions";
import { QueryType } from "@modules/Common/common.interface";
import { handleError } from "@helpers/common";

type StatusDropdownProps = {
  status: number;
  recordId: number;
  reloadTableData: (query?: QueryType<LeadsParamTypes>) => void;
  permissions: { [key in LeadsPermissionsEnum]: boolean };
}

type LeadsStatusColors = {
  [key in LeadsStatus]: string;
};

const statusColors: LeadsStatusColors = {
  1: "#FFC107", // orange
  2: "#FFA000", // darker orange
  3: "#E53939", // red
  4: "#43A047", // green
  5: "#E53935", // red
  6: "#E53935", // darker red
  7: "#43A047", // darker green
};

/** Status Dropdown */
const StatusDropdown: FC<StatusDropdownProps> = (props) => {
  const {
    status, recordId, reloadTableData, permissions: { updateLeadsStatus }
  } = props

  const [messageApi, contextHolder] = message.useMessage();

  const module = useMemo(() => new LeadsModule(), []);

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
    if (recordId && updateLeadsStatus === true) {
      openMessage({
        key: "update", type: "loading",
        content: "Updating..."
      });

      module.changeStatus(recordId, _status).then((res) => {
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

  // Get the status options but remove the numbers from it and only keep the string values
  const options = Object.entries(LeadsStatusOptions).filter(([key]) => {
    return isNaN(Number(key)) === false
  }).map(([key, value]) => {
    return { value: key, label: value }
  })

  const overlay = (
    <Card className={`${styles.overlay} pa-2`}>
      {options.map((option, index) => {
        const value = Number(option.value)
        const isSelected = status === value

        return (
          <div
            key={`leads-status-${index}`}
            className={styles.overlay_item}
            onClick={() => !isSelected && onStatusChange(value)}
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
        trigger={updateLeadsStatus === true ? ["click"] : []}
        open={updateLeadsStatus === true ? visible : false}
        onOpenChange={onVisibleChange}
        className={styles.dropdown}
      >
        <Space
          style={{
            backgroundColor: statusColors[status as keyof LeadsStatusColors],
            color: "#fff",
            padding: "0.2rem 0.5rem",
            borderRadius: "0.25rem",
            fontSize: "0.8rem",
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          {LeadsStatus[status]}

          {updateLeadsStatus === true && <DownOutlined />}
        </Space>
      </Dropdown>
    </>
  );
}

export default StatusDropdown;