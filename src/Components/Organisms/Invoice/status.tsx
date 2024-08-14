import { Dispatch, FC, SetStateAction, useMemo, useState } from "react";
import { Button, Checkbox, Popconfirm, message } from "antd";
import { InvoiceStatus } from "@helpers/commonEnums";
import { InvoicePermissionsEnum } from "@modules/Invoice/permissions";
import { InvoiceModule } from "@modules/Invoice";
import { InvoiceTypes } from "@modules/Invoice/types";
import { handleError } from "@helpers/common";
import { InvoiceDrawerTypes } from "./Drawer/types";

type InvoiceStatusCompProps = {
  /** The invoice record */
  item: InvoiceTypes
  /** Function to refresh the data */
  onRefresh: <QueryType = any>(query?: QueryType) => void;
  /** The function to set the drawer state */
  setDrawer: Dispatch<SetStateAction<InvoiceDrawerTypes>>
  /** The permissions of the user */
  permissions: { [key in InvoicePermissionsEnum]: boolean };
}

const InvoiceStatusComp: FC<InvoiceStatusCompProps> = (props) => {
  const {
    item, onRefresh, setDrawer, permissions: { changeInvoiceStatus }
  } = props

  const [messageApi, contextHolder] = message.useMessage();
  const [resumeProject, setResumeProject] = useState(true);

  const module = useMemo(() => new InvoiceModule(), []);

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

  const onStatusChange = (_status: number) => {
    if (item.id && changeInvoiceStatus === true) {
      openMessage({
        key: "update", type: "loading",
        content: "Updating..."
      });

      const data = {
        status: _status,
        resumeProject: resumeProject
      }

      module.changeStatus(item.id, data).then((res) => {
        if (res?.data?.data) {
          openMessage({
            key: "update", type: "success",
            content: res?.data?.message
          });

          onRefresh()
          // close the drawer
          setDrawer({ type: "create", open: false, id: 0 })
        }
      }).catch((err) => {
        const errorMessage = handleError(err)
        openMessage({
          key: "update", type: "error",
          content: errorMessage || "Something went wrong, please try again later."
        });
      });
    } else {
      openMessage({
        key: "update", type: "error",
        content: "You don't have permission to change status"
      });
    }
  }

  return (
    <>
      {contextHolder}

      <div className="d-flex flex-column align-center font-size-sm color-dark-800">
        {(item?.status !== InvoiceStatus['Generated'] && item?.status !== InvoiceStatus['Sent']) && (
          <span>
            {InvoiceStatus[item?.status]}
          </span>
        )}

        {item?.status === InvoiceStatus['Generated'] && (
          <Button
            size='small' type='ghost' style={{ fontSize: '0.7rem' }}
            onClick={(e) => {
              e.stopPropagation();
              setDrawer({
                type: "preview", open: true, id: item.id,
              })
            }}
          >
            Send Invoice
          </Button>
        )}

        {item?.status === InvoiceStatus['Sent'] && (
          <div className='d-flex'>
            <Popconfirm
              title={(
                <div>
                  Are you sure you want to mark this invoice as paid?
                  <div className="mt-2">
                    <Checkbox checked={resumeProject} onChange={(e) => { setResumeProject(e.target.checked) }}>
                      Resume Project
                    </Checkbox>
                  </div>
                </div>
              )}
              okText="Yes" cancelText="No"
              placement="bottomRight"
              onConfirm={(e) => {
                e?.stopPropagation();
                onStatusChange(InvoiceStatus.Paid)
              }}
              zIndex={10000}
            >
              <Button
                type="ghost" size='small'
                style={{
                  fontSize: '0.7rem',
                  borderColor: 'var(--color-primary-main)',
                  color: 'var(--color-primary-main)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                Mark as Paid
              </Button>
            </Popconfirm>
            <Popconfirm
              title="Are you sure you want to cancel this invoice?"
              okText="Yes" cancelText="No"
              placement="bottomRight"
              onConfirm={(e) => {
                e?.stopPropagation();
                onStatusChange(InvoiceStatus.Canceled)
              }}
              onCancel={(e) => e?.stopPropagation()}
              zIndex={10000}
            >
              <Button
                type="ghost" size='small' danger style={{ fontSize: '0.7rem' }}
                className='ml-1' onClick={(e) => e?.stopPropagation()}
              >
                Mark as Cancelled
              </Button>
            </Popconfirm>
          </div>
        )}
      </div>
    </>
  );
}

export default InvoiceStatusComp;