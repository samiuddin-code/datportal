import { FC, useEffect, useMemo, useState } from 'react';
import {
  Badge, Popover, Switch, message, Input, Button, Form, Avatar,
} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { ProjectModule } from '@modules/Project';
import { ProjectTypes } from '@modules/Project/types';
import { ProjectPermissionsEnum } from '@modules/Project/permissions';
import { handleError } from '@helpers/common';
import { RESOURCE_BASE_URL } from '@helpers/constants';
import { UserPopover } from '@atoms/UserPopver';
import styles from './styles.module.scss';

const { TextArea } = Input

interface ChangeStatusProps {
  data: {
    project: ProjectTypes
    onRefresh: <QueryType = any>(query?: QueryType) => void
  }
  permissions: { [key in ProjectPermissionsEnum]: boolean }
}

type HoldProjectTypes = {
  loading?: boolean;
  onHold: boolean;
}

/** Change Status component */
const ChangeStatus: FC<ChangeStatusProps> = ({ data, permissions }) => {
  const { project, onRefresh } = data

  const module = useMemo(() => new ProjectModule(), [])
  const [form] = Form.useForm()

  const [holdProject, setHoldProject] = useState<HoldProjectTypes>({
    loading: false,
    onHold: false
  })

  const onStatusChange = (values: { comment: string }) => {
    if (permissions.updateProject === true) {
      const data = { comment: values?.comment }

      setHoldProject(prev => ({ ...prev, loading: true }))

      if (project?.onHold === false) {
        module.holdProject(data, project?.id).then(res => {
          const data = res?.data
          message.success(data?.message || 'Project is now on hold')
          onRefresh()
          form.resetFields()
        }).catch(err => {
          const errorMessage = handleError(err)
          message.error(errorMessage || 'Something went wrong')
        }).finally(() => {
          setHoldProject(prev => ({ ...prev, loading: false }))
        })
      } else {
        module.unholdProject(data, project?.id).then(res => {
          const data = res?.data
          message.success(data?.message || 'Project is now active')
          onRefresh()
          form.resetFields()
        }).catch(err => {
          const errorMessage = handleError(err)
          message.error(errorMessage || 'Something went wrong')
        }).finally(() => {
          setHoldProject(prev => ({ ...prev, loading: false }))
        })
      }
    } else {
      message.error('You do not have permission to hold project, please contact your administrator')
    }
  }

  useEffect(() => {
    setHoldProject(prev => ({ ...prev, onHold: project?.onHold }))
  }, [project])

  return (
    <Popover
      destroyTooltipOnHide
      title={
        <>
          <div className={styles.title}>
            Project Status
            <Switch
              defaultChecked={project?.onHold}
              checkedChildren="On Hold" unCheckedChildren="Active"
              className={holdProject.onHold ? 'on-hold-switch' : 'active'}
              onChange={(checked) => setHoldProject((prev) => ({
                ...prev, onHold: checked
              }))}
            />
          </div>

          {project?.comment && (
            <div style={{ marginTop: 10 }}>
              <span style={{ fontWeight: 600, fontStyle: "italic" }}>
                Reason: &nbsp;
              </span>
              <span className='font-size-sm' style={{ fontWeight: 'normal' }}>
                {project?.comment}
              </span>
            </div>
          )}

          {project?.ProjectHoldBy && (
            <div className={styles.holdBy}>
              <span style={{ fontStyle: "italic" }}>
                {project?.onHold ? 'Hold By:' : 'Resumed By:'}
              </span>
              <UserPopover type='user' user={project?.ProjectHoldBy} className={styles.holdBy_user}>
                <Avatar
                  size={28}
                  src={`${RESOURCE_BASE_URL}${project?.ProjectHoldBy?.profile}`}
                  icon={<UserOutlined />}
                  style={{ border: '1px solid var(--color-border)' }}
                />
                <p className={styles.holdBy_user_name}>
                  {`${project?.ProjectHoldBy?.firstName} ${project?.ProjectHoldBy?.lastName}`}
                </p>
              </UserPopover>
            </div>
          )}
        </>
      }
      content={
        <Form form={form} onFinish={onStatusChange} layout='vertical' >
          <Form.Item
            name='comment'
            rules={[{ required: true, message: 'Please enter reason' }]}
            style={{ marginBottom: 10, width: '100%' }}
          >
            <TextArea
              placeholder="Reason" style={{ width: '100%' }}
              autoSize={{ minRows: 1, maxRows: 4 }}
            />
          </Form.Item>
          <Button
            type="ghost" size='small' htmlType='submit'
            loading={holdProject?.loading}
          >
            Save
          </Button>
        </Form>
      }
      overlayClassName='change-width'
    >
      <Badge
        count={
          <div
            style={{
              background: project?.onHold ? "#F5222D" : "radial-gradient(#1C6758, #367E18, #5BB318)",
              boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.4)",
              fontSize: 20, width: 20, height: 20, borderRadius: '50%',
            }}
          />
        }
      />
    </Popover >
  )
}

export default ChangeStatus;