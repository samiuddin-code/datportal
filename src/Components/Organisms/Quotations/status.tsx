import { Dispatch, FC, SetStateAction, useMemo, useState } from "react";
import { Button, Popconfirm, message } from "antd";
import { QuotationStatus } from "@helpers/commonEnums";
import { handleError } from "@helpers/common";
import { QuotationModule } from "@modules/Quotation";
import { QuotationPermissionsEnum } from "@modules/Quotation/permissions";
import { AutoCreateFromApprovedQuotationTypes } from "@modules/Project/types";
import { QuotationTypes } from "@modules/Quotation/types";
import { QuotationDrawerTypes } from "./Drawer/types";
import { DropdownWithLabel } from "@atoms/";

type PermissionsType = { [key in QuotationPermissionsEnum]: boolean }

export type NewProjectModalTypes = {
  isOpen: boolean
  quoteId: number
  submissionById: number
  projectTypeId: number
  loading: boolean
}

type QuotationStatusCompProps = {
  item: QuotationTypes;
  onRefresh: <QueryType = any>(query?: QueryType) => void;
  /** The function to set the drawer state */
  setDrawer: Dispatch<SetStateAction<QuotationDrawerTypes>>
  permissions: PermissionsType
  /** The state of the modal for creating project from quotation */
  setNewProject: Dispatch<SetStateAction<NewProjectModalTypes>>
}

const QuotationStatusComp: FC<QuotationStatusCompProps> = (props) => {
  const {
    item, onRefresh, permissions, setDrawer, setNewProject
  } = props;
  const { updateQuotation } = permissions;

  const module = useMemo(() => new QuotationModule(), []);

  /** This function is used to create project from approved quotation
   * @param values The values to be passed to the api
   * project and `existing` will link the quotation to an existing project
   */
  const onCreateProjectFromQuotation = (values: AutoCreateFromApprovedQuotationTypes) => {
    if (updateQuotation === true) {
      module.autoCreateFromApprovedQuotation(values).then(() => {
        message.success("Quotation linked to project successfully");
        onRefresh();
      }).catch((err) => {
        const errMessage = handleError(err)
        message.error(errMessage || "Something went wrong");
      })
    } else {
      message.error("You don't have permission to link quotation to project, please contact your administrator");
    }
  }

  const onChangeQuotationStatus = (id: number, status: QuotationStatus) => {
    if (updateQuotation === true) {
      module.changeStatus(id, status).then((res) => {
        message.success(res?.data?.message || "Quotation status updated successfully");
        onRefresh();
      }).catch((err) => {
        const errorMessage = handleError(err);
        message.error(errorMessage || "Something went wrong");
      })
    } else {
      message.error("You don't have permission to update quotation status");
    }
  }

  /** This function is used to mark quotation as sent */
  const markAsSent = (id: number) => {
    if (updateQuotation === true) {
      module.markAsSent(id).then((res) => {
        message.success(res?.data?.message || "Quotation marked as sent successfully");
        onRefresh();
      }).catch((err) => {
        const errorMessage = handleError(err);
        message.error(errorMessage || "Something went wrong");
      })
    } else {
      message.error("You don't have permission to mark quotation as sent");
    }
  }

  return (
    <div className="d-flex flex-column align-center font-size-sm color-dark-800">
      {(item?.status !== QuotationStatus['New'] && item?.status !== QuotationStatus['Sent']) && (
        <span>
          {QuotationStatus[item?.status]}
        </span>
      )}

      {item?.status === QuotationStatus['New'] && (
        <DropdownWithLabel
          trigger={["click"]} size='small'
          type="ghost" label={"Submit Now"}
          onClick={(e) => {
            e.stopPropagation();
            setDrawer((prev) => ({
              ...prev, open: true, quoteId: item?.id,
              type: "preview", quotation: item
            }))
          }}
          items={[{ label: "Mark as sent", value: "markAsSent" }].map((option, index) => {
            return {
              key: `option-${index}`,
              label: option.label,
              onClick: () => markAsSent(item?.id!)
            }
          })}
        />
      )}

      {item?.status === QuotationStatus['Sent'] && (
        <div className='d-flex'>
          {item.projectId > 0 ? (
            <Popconfirm
              title={"Approving this quotation will link it to the existing project. Are you sure?"}
              okText="Yes" cancelText="No" placement="bottomRight" zIndex={10000}
              onCancel={(e) => e?.stopPropagation()}
              onConfirm={(e) => {
                e?.stopPropagation();
                const values: AutoCreateFromApprovedQuotationTypes = {
                  quoteId: item?.id,
                  title: "Existing Project",
                }
                onCreateProjectFromQuotation(values)
              }}
              destroyTooltipOnHide
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
                Approve
              </Button>
            </Popconfirm>
          ) : (
            <Button
              type="ghost" size='small'
              style={{
                fontSize: '0.8rem', borderColor: 'var(--color-primary-main)',
                color: 'var(--color-primary-main)'
              }}
              onClick={(e) => {
                e.stopPropagation()
                // close drawer
                setDrawer((prev) => ({ ...prev, open: false }))
                setNewProject && setNewProject({
                  isOpen: true, quoteId: item?.id, loading: false,
                  submissionById: item?.Lead?.SubmissionBy?.id,
                  projectTypeId: item?.Lead?.ProjectType?.id
                })
              }}
            >
              Approve
            </Button>
          )}

          <Button
            type="ghost" size='small'
            style={{ fontSize: '0.8rem', borderColor: "#FFA000", color: "#FFA000" }}
            className='ml-1' onClick={(e) => {
              e?.stopPropagation()
              setDrawer((prev) => ({
                ...prev, open: true, quoteId: item?.id,
                type: "revise", quotation: item
              }))
            }}
          >
            Revise & Resend
          </Button>

          <Popconfirm
            title={"Are you sure you want to reject this quotation?"}
            okText="Yes" cancelText="No" placement="bottomRight"
            onCancel={(e) => e?.stopPropagation()}
            onConfirm={(e) => {
              e?.stopPropagation();
              onChangeQuotationStatus(item?.id!, QuotationStatus.Rejected)
            }}
            destroyTooltipOnHide zIndex={10000}
          >
            <Button
              type="ghost" size='small' danger className='ml-1'
              style={{ fontSize: '0.8rem' }}
              onClick={(e) => e.stopPropagation()}
            >
              Reject
            </Button>
          </Popconfirm>
        </div>
      )}
    </div>
  );
}

export default QuotationStatusComp;