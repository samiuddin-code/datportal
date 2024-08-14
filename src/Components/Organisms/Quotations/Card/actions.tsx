import { useState, type FC, Dispatch, SetStateAction } from 'react';
import { Dropdown, Popconfirm, Popover, Radio, Space } from 'antd';
import {
  MoreOutlined, DeleteOutlined, EditOutlined, LinkOutlined
} from '@ant-design/icons';
import { QuotationTypes } from '@modules/Quotation/types';
import styles from './styles.module.scss';

type NewProjectModalTypes = {
  isOpen: boolean
  quoteId: number
  submissionById: number
  projectTypeId: number
  loading: boolean
}

type QuickUpdateTypes = {
  open: boolean
  quoteId: number
  initialProjectId: number
  initialSubmissionById: number
  initialProjectTypeId: number
}

interface ActionsDropdownProps {
  item: QuotationTypes
  onDelete: (id: number) => void
  onEdit: (record: QuotationTypes) => void
  setNewProject: Dispatch<SetStateAction<NewProjectModalTypes>>
  setQuickUpdate: Dispatch<SetStateAction<QuickUpdateTypes>>
}

const ActionsDropdown: FC<ActionsDropdownProps> = (props) => {
  const { item, onDelete, onEdit, setNewProject, setQuickUpdate } = props
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>({})
  const [deleteConfirmation, setDeleteConfirmation] = useState(false)

  return (
    <>
      <Dropdown
        trigger={['click']} open={dropdownOpen[item.id]} destroyPopupOnHide
        onOpenChange={(open) => setDropdownOpen({ [item.id]: open })}
        menu={{
          items: [
            {
              key: 'edit',
              label: 'Edit',
              icon: <EditOutlined />,
              onClick: () => {
                onEdit(item)
                setDropdownOpen({ [item.id]: false })
              }
            },
            {
              key: 'link-to-project',
              icon: <LinkOutlined />,
              label: (
                <Popover
                  placement='top' trigger="click" zIndex={9999}
                  destroyTooltipOnHide
                  content={(
                    <Radio.Group>
                      <Space direction="vertical">
                        <Radio
                          value={"existing"}
                          onClick={() => {
                            setQuickUpdate({
                              open: true, quoteId: item.id, initialProjectId: item.projectId,
                              initialSubmissionById: item?.Lead?.SubmissionBy?.id,
                              initialProjectTypeId: item?.Lead?.ProjectType?.id
                            })
                            setDropdownOpen({ [item.id]: false })
                          }}
                        >
                          Existing Project
                        </Radio>

                        <Radio
                          value={"new"}
                          onClick={() => {
                            setNewProject({
                              isOpen: true, quoteId: item.id, loading: false,
                              submissionById: 0, projectTypeId: 0,
                            })
                            setDropdownOpen({ [item.id]: false })
                          }}
                        >
                          New Project
                        </Radio>
                      </Space>
                    </Radio.Group>
                  )}
                >
                  Link To Project
                </Popover>
              ),
              // onClick: (e) => {
                // e.domEvent.stopPropagation()
                // setQuickUpdate({
                //   open: true, quoteId: item.id, initialProjectId: item.projectId,
                //   initialSubmissionById: item?.Lead?.SubmissionBy?.id,
                //   initialProjectTypeId: item?.Lead?.ProjectType?.id
                // })
                // setDropdownOpen({ [item.id]: false })
              // },
            },
            { type: 'divider' },
            {
              key: 'delete',
              label: (
                <Popconfirm
                  title="Are you sure to delete this quotation?"
                  onConfirm={() => {
                    onDelete(item.id)
                    // Close the dropdown and delete confirmation
                    setDeleteConfirmation(false)
                    setDropdownOpen({ [item.id]: false })
                  }}
                  okText="Yes" cancelText="No" placement='bottomLeft'
                  open={deleteConfirmation} destroyTooltipOnHide
                  onOpenChange={(open) => setDeleteConfirmation(open)}
                  zIndex={9999}
                >
                  Delete
                </Popconfirm>
              ),
              icon: <DeleteOutlined />,
              onClick: (e) => {
                e.domEvent.preventDefault()
                setDeleteConfirmation(!deleteConfirmation)
              },
              danger: true,
            },
          ]
        }}
      >
        <MoreOutlined
          className={styles.quotation_item_header_actions_more}
          onClick={(e) => e.preventDefault()}
        />
      </Dropdown>
    </>
  );
}
export default ActionsDropdown;