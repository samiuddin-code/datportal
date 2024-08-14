import { CSSProperties, FC, useEffect, useMemo, useState } from 'react';
import { Divider, Dropdown, Tag, Tooltip, message, Typography } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { ProjectStateType } from '@modules/ProjectState/types';
import { ProjectModule } from '@modules/Project';
import { ProjectTypes } from '@modules/Project/types';
import { ProjectPermissionsEnum } from '@modules/Project/permissions';
import styles from './styles.module.scss';
import CustomInput from '@atoms/Input';
import CustomEmpty from '@atoms/CustomEmpty';

const { Text } = Typography

interface ChangeStatesProps {
  data: {
    projectStates: ProjectStateType[]
    project: {
      data: ProjectTypes
      onRefresh: <QueryType = any>(query?: QueryType) => void
    }
  }
  permissions: { [key in ProjectPermissionsEnum]: boolean }
  style?: CSSProperties
}

type SearchedStatesType = {
  data: ProjectStateType[];
  query: string
}

/** Change States component */
const ChangeStates: FC<ChangeStatesProps> = ({ data, permissions, style }) => {
  const {
    projectStates, project: { data: project, onRefresh },
  } = data
  const module = useMemo(() => new ProjectModule(), [])
  const [searchedStates, setSearchedStates] = useState<SearchedStatesType>({
    data: projectStates, query: ''
  })

  const onStatesChange = (stateId: number) => {
    const updateData = { projectId: project.id, projectStateId: stateId }

    if (permissions.updateProject === true) {
      module.updateProjectStatus(updateData).then(res => {
        const { data } = res
        message.success(data?.message || 'States changed successfully')
        onRefresh()
      }).catch(err => {
        const errorMessages = err?.response?.data?.message
        message.error(errorMessages || 'Something went wrong')
      })
    } else {
      message.error('You do not have permission to update project States, please contact your administrator')
    }
  }

  useEffect(() => {
    setSearchedStates({ data: projectStates, query: '' })
  }, [projectStates])

  return (
    <Dropdown
      trigger={['click']}
      menu={{
        items: searchedStates.data?.map(state => ({
          key: `state-${state.id}`,
          label: state.title,
          onClick: () => onStatesChange(state.id),
          disabled: state.id === project?.ProjectState?.id,
        }))
      }}
      overlayClassName={styles.dropdownOverlay}
      dropdownRender={menu => (
        <div className={styles.dropdownContainer}>
          {/* Search */}
          <div className={styles.searchContainer}>
            <CustomInput
              placeHolder="Search" size='w100'
              value={searchedStates.query}
              onChange={(e: any) => {
                const value: string = e.target.value || ''
                const query = value?.trim()?.toLowerCase()
                const filteredStates = projectStates.filter(state => state.title.toLowerCase().includes(query))
                setSearchedStates({ data: filteredStates, query })
              }}
              className={styles.searchInput}
            />
          </div>
          <Divider style={{ marginBottom: 10, marginTop: 0 }} />
          {menu}

          {!searchedStates.data?.length && (
            <CustomEmpty description="No data found" />
          )}
        </div>
      )}
    >
      <Tooltip title={project?.ProjectState?.title}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: `${project?.ProjectState?.bgColor}`,
            cursor: "pointer",
            color: `${project?.ProjectState?.textColor || "var(--color-dark-sub"}`,
            padding: "5px 10px",
            borderRadius: "5px",
            fontSize: "14px",
            // add no wrap to prevent text overflow
            whiteSpace: "nowrap",
            ...style
          }}
        >
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "inline-block",
              maxWidth: window.innerWidth > 1500 ? "30ch" : "15ch",
            }}
          >
            {project?.ProjectState?.title || 'Select States'}
          </span>
          <DownOutlined style={{ marginLeft: 5 }} />
        </div>
      </Tooltip>
    </Dropdown>
  )
}

export default ChangeStates;