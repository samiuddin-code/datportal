import { FC, useMemo, useState } from "react";
import { Popconfirm, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { EnquiryModule } from "@modules/Enquiry";
import { EnquiryType } from "@modules/Enquiry/types";
import { EnquiryPermissionsEnum } from "@modules/Enquiry/permissions";
import { ActionComponentProps } from "@organisms/Common/common-types";
import styles from "./styles.module.scss";

interface _ActionComponentProps extends ActionComponentProps {
  record: EnquiryType;
  onAddNoteClick: (record: EnquiryType) => void;
  permissions: { [key in EnquiryPermissionsEnum]: boolean };
}

const ActionComponent: FC<_ActionComponentProps> = (props) => {
  const {
    record, onEditIconClick, onAddNoteClick,
    reloadTableData, permissions: { deleteEnquiry, updateEnquiry }
  } = props;

  const module = useMemo(() => new EnquiryModule(), []);

  const [actionState, setActionState] = useState({ confirmLoading: false, openPopConfirm: false, });

  const showPopconfirm = () => setActionState((prev) => ({ ...prev, openPopConfirm: true }));

  const handleDelete = () => {
    setActionState((prev) => ({ ...prev, confirmLoading: true }));

    if (deleteEnquiry === false) {
      message.error("You don't have permission to delete this record, please contact your admin.");
      setActionState((prev) => ({ ...prev, confirmLoading: false, openPopConfirm: false }));
      return;
    }

    module.deleteRecord(record.id).then(() => {
      setActionState((prev) => ({ ...prev, openPopConfirm: false, confirmLoading: false }));
      reloadTableData();
    }).catch((err) => {
      const errorMessage = err?.response?.data?.message
      message.error(errorMessage || "Something went wrong, please try again later.");
      setActionState((prev) => ({ ...prev, confirmLoading: false, openPopConfirm: false }));
    });
  };

  return (
    <div className={styles.actions}>
      {updateEnquiry && (
        <>
          <span onClick={() => onEditIconClick(record)}>
            <img src="/images/editicon.svg" alt="Edit Icon" />
          </span>
          <span onClick={() => onAddNoteClick(record)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="#fff"
              width={19}
              height={19}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
              />
            </svg>
          </span>
        </>
      )}
      {deleteEnquiry && (
        <Popconfirm
          open={actionState.openPopConfirm}
          placement="rightBottom" title="Are you sure?"
          onConfirm={handleDelete}
          onCancel={() => setActionState({ ...actionState, openPopConfirm: false })}
          okButtonProps={{ loading: actionState.confirmLoading }}
          okText="Yes" cancelText="No"
          onOpenChange={(visible) => {
            if (!visible) {
              setActionState({ ...actionState, openPopConfirm: false });
            }
          }}
        >
          <DeleteOutlined className={styles.bg__red} onClick={showPopconfirm} />
        </Popconfirm>
      )}
    </div>
  );
};

export default ActionComponent;