import { useState, type FC } from 'react';
import { Dropdown, Popconfirm } from 'antd';
import { MoreOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { LeadsTypes } from '@modules/Leads/types';
import styles from './styles.module.scss';

interface ActionsDropdownProps {
  item: LeadsTypes
  onDelete: (id: number) => void
}

const ActionsDropdown: FC<ActionsDropdownProps> = ({ item, onDelete }) => {
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>({})
  const [deleteConfirmation, setDeleteConfirmation] = useState(false)

  return (
    <Dropdown
      trigger={['click']} open={dropdownOpen[item.id]}
      onOpenChange={(open) => setDropdownOpen({ ...dropdownOpen, [item.id]: open })}
      menu={{
        items: [
          {
            label: 'Edit',
            key: 'edit',
            icon: <EditOutlined />,
            // onClick: (e) => {
            //   e.domEvent.preventDefault()
            //   navigate(`/projects/edit?id=${item.id}`)
            // }
          },
          {
            label: (
              <Popconfirm
                title="Are you sure to delete this project?"
                onConfirm={() => {
                  onDelete(item.id)
                  // Close the dropdown and delete confirmation
                  setDeleteConfirmation(false)
                  setDropdownOpen({ ...dropdownOpen, [item.id]: false })
                }}
                okText="Yes"
                cancelText="No"
                placement='bottom'
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
        className={styles.lead_item_header_actions_more}
        onClick={(e) => e.preventDefault()}
      />
    </Dropdown>
  );
}
export default ActionsDropdown;