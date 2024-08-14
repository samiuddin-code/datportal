import { Dispatch, FC, SetStateAction, useMemo, useState } from "react";
import { Dropdown, Popconfirm, message } from "antd";
import { MoreOutlined, DeleteOutlined, EditOutlined, LinkOutlined } from '@ant-design/icons';
import { ActionComponentProps } from "@organisms/Common/common-types";
import { InvoiceTypes } from "@modules/Invoice/types";
import { InvoicePermissionsEnum } from "@modules/Invoice/permissions";
import { InvoiceModule } from "@modules/Invoice";
import styles from "./styles.module.scss";
import { InvoiceDrawerTypes } from "./Drawer/types";
import { InvoiceStatus } from "@helpers/commonEnums";

type QuickUpdateTypes = {
  open: boolean
  invoiceId: number
  initialProjectId: number
}

interface _ActionComponentProps extends Partial<ActionComponentProps> {
  record: InvoiceTypes;
  permissions: { [key in InvoicePermissionsEnum]: boolean };
  setDrawer: Dispatch<SetStateAction<InvoiceDrawerTypes>>
  setQuickUpdate: Dispatch<SetStateAction<QuickUpdateTypes>>
}

const ActionComponent: FC<_ActionComponentProps> = (props) => {
  const {
    record, setDrawer, reloadTableData, permissions: { deleteInvoice },
    setQuickUpdate
  } = props;

  const module = useMemo(() => new InvoiceModule(), []);

  const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>({})
  const [deleteConfirmation, setDeleteConfirmation] = useState(false)

  const handleDelete = () => {
    if (deleteInvoice === false) {
      message.error("You don't have permission to delete this record, please contact your admin.");
      return;
    }

    module.deleteRecord(record.id).then(() => {
      message.success("Invoice has been deleted successfully.");
      reloadTableData && reloadTableData();
    }).catch((err) => {
      const errorMessage = err?.response?.data?.message
      message.error(errorMessage || "Something went wrong, please try again later.");
    });
  };

  return (
    <Dropdown
      trigger={['click']} open={dropdownOpen[record.id]}
      onOpenChange={(open) => setDropdownOpen({ ...dropdownOpen, [record.id]: open })}
      menu={{
        items: [
          {
            label: 'Edit',
            key: 'edit',
            icon: <EditOutlined />,
            onClick: (e) => {
              e.domEvent.preventDefault()
              if (record.status === InvoiceStatus.Generated) {
                setDrawer({ open: true, id: record.id, type: "edit" })
              } else {
                message.error(`You cannot edit this invoice because it is already ${InvoiceStatus[record.status]}`);
              }
            }
          },
          {
            key: 'link-to-project',
            icon: <LinkOutlined />,
            label: " Link To Project",
            onClick: (e) => {
              e.domEvent.preventDefault()
              setQuickUpdate({ open: true, invoiceId: record.id, initialProjectId: record.projectId })
              setDropdownOpen({ [record.id]: false })
            },
          },
          { type: 'divider' },
          {
            label: (
              <Popconfirm
                title="Are you sure to delete this invoice?"
                onConfirm={() => {
                  handleDelete()
                  // Close the dropdown and delete confirmation
                  setDeleteConfirmation(false)
                  setDropdownOpen({ ...dropdownOpen, [record.id]: false })
                }}
                okText="Yes" cancelText="No" placement='bottomLeft'
                open={deleteConfirmation}
                onOpenChange={(open) => setDeleteConfirmation(open)}
              >
                Delete
              </Popconfirm>
            ),
            key: 'delete',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: (e) => {
              e.domEvent.preventDefault()
              setDeleteConfirmation(!deleteConfirmation)
            },
          },
        ]
      }}
    >
      <MoreOutlined
        className={styles.actions}
        onClick={(e) => e.preventDefault()}
      />
    </Dropdown>
  );
};

export default ActionComponent;