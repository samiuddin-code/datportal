import { useState, type FC } from 'react';
import { Dropdown, Popconfirm } from 'antd';
import { MoreOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { LeadsTypes } from '@modules/Leads/types';
import styles from './styles.module.scss';

interface ActionsDropdownProps {
  item: LeadsTypes
  onDelete: (id: number) => void
  onEdit: (id: number) => void
}

const ActionsDropdown: FC<ActionsDropdownProps> = (props) => {
  const { item, onDelete, onEdit } = props
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>({})
  const [deleteConfirmation, setDeleteConfirmation] = useState(false)

  return (
    <Dropdown
      trigger={['click']} open={dropdownOpen[item.id]}
      onOpenChange={(open) => setDropdownOpen({ [item.id]: open })}
      menu={{
        items: [
          {
            key: 'edit',
            label: 'Edit',
            icon: <EditOutlined />,
            onClick: () => {
              onEdit(item.id)
              setDropdownOpen({ [item.id]: false })
            }
          },
          {
            key: 'delete',
            label: (
              <Popconfirm
                title="Are you sure to delete this lead?"
                onConfirm={() => {
                  onDelete(item.id)
                  // Close the dropdown and delete confirmation
                  setDeleteConfirmation(false)
                  setDropdownOpen({ [item.id]: false })
                }}
                okText="Yes"
                cancelText="No"
                placement='bottomLeft'
                open={deleteConfirmation}
                onOpenChange={(open) => setDeleteConfirmation(open)}
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
        className={styles.lead_item_header_actions_more}
        onClick={(e) => e.preventDefault()}
      />
    </Dropdown>
  );
}
export default ActionsDropdown;