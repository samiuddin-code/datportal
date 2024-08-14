import { FC, useMemo, useState } from "react";
import { Popconfirm, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { ActionComponentProps } from "@organisms/Common/common-types";
import styles from "@organisms/Common/styles.module.scss";
import { ClientType } from "@modules/Client/types";
import { ClientModule } from "@modules/Client";
import { ClientPermissionsEnum } from "@modules/Client/permissions";

interface _ActionComponentProps extends ActionComponentProps {
  record: ClientType,
  permissions: { [key in ClientPermissionsEnum]: boolean };
}

const ActionComponent: FC<_ActionComponentProps> = (props) => {
  const {
    record, onEditIconClick, reloadTableData,
    permissions: { deleteClient }
  } = props;

  const [actionState, setActionState] = useState({
    confirmLoading: false, openPopConfirm: false,
  });
  const module = useMemo(() => new ClientModule(), []);

  const handleDelete = () => {
    setActionState({
      ...actionState,
      confirmLoading: true,
    });

    if (deleteClient === false) {
      message.error("You don't have permission to delete this record, please contact your admin.");
      setActionState({
        ...actionState,
        openPopConfirm: false,
      });
      return;
    }

    module.deleteRecord(record.id).then((res) => {
      setActionState({
        ...actionState,
        openPopConfirm: false,
        confirmLoading: false,
      });
      reloadTableData();
    }).catch((err) => {
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

  return (
    <div className={styles.actions}>
      <span onClick={() => onEditIconClick(record)}>
        <img src="/images/editicon.svg" alt="" />
      </span>
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
        <DeleteOutlined className={styles.bg__red} onClick={showPopconfirm} />
      </Popconfirm>
    </div>
  );
};

export default ActionComponent;