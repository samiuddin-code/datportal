import { useState, type FC, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown, Popconfirm, message } from 'antd';
import { MoreOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { ProjectTypes } from '@modules/Project/types';
import styles from './styles.module.scss';
import { ProjectModule } from '@modules/Project';
import { ProjectPermissionsEnum } from '@modules/Project/permissions';

interface ActionsDropdownProps {
  item: ProjectTypes
  onRefresh: () => void
  permissions: { [key in ProjectPermissionsEnum]: boolean }
}

const ActionsDropdown: FC<ActionsDropdownProps> = ({ item, onRefresh, permissions }) => {
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>({})
  const [deleteConfirmation, setDeleteConfirmation] = useState(false)

  const module = useMemo(() => new ProjectModule(), []);


  /**Function to delete a project
 * @param {number} id id of the project to be deleted
 */
  const onDelete = (id: number) => {
    if (permissions?.deleteProject === true) {
      module.deleteRecord(id).then(() => {
        onRefresh();
      }).catch((err) => {
        const errorMessages = err.response.data.message || "Something went wrong!"
        message.error(errorMessages)
      })
    } else {
      message.error("You don't have permission to delete this project, Please contact your admin")
    }
  };

  return (
    <Dropdown
      trigger={['click']} open={dropdownOpen[item.id]}
      onOpenChange={(open) => setDropdownOpen({ [item.id]: open })}
      menu={{
        items: [
          {
            label: 'Edit',
            key: 'edit',
            icon: <EditOutlined />,
            onClick: (e) => {
              e.domEvent.preventDefault()
              navigate(`/projects/edit?id=${item.id}`)
            }
          },
          {
            label: (
              <Popconfirm
                title="Are you sure to delete this project?"
                onConfirm={() => {
                  onDelete(item.id)
                  // Close the dropdown and delete confirmation
                  setDeleteConfirmation(false)
                  setDropdownOpen({ [item.id]: false })
                }}
                okText="Yes" cancelText="No" placement='bottom'
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
        className={styles.project_item_header_actions_more}
        onClick={(e) => e.preventDefault()}
      />
    </Dropdown>
  );
}
export default ActionsDropdown;