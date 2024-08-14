import { useState, type FC, useMemo } from 'react';
import { Card, Checkbox, Popconfirm, Tooltip, message } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { ProjectTypes } from '@modules/Project/types';
import { QuotationModule } from '@modules/Quotation';
import Typography from '@atoms/Headings';
import { MilestoneStatus } from '@helpers/commonEnums';
import { handleError } from '@helpers/common';
import styles from './styles.module.scss';
import CustomEmpty from '@atoms/CustomEmpty';

interface ProjectInfoSectionProps {
  data: ProjectTypes
  onRefresh: <QueryType = any>(query?: QueryType) => void
}

const ProjectInfoSection: FC<ProjectInfoSectionProps> = ({ data, onRefresh }) => {
  const quotation = data?.Quotation

  const [selected, setSelected] = useState<{ open: boolean; ids: number[] }>({
    open: false, ids: []
  })
  const module = useMemo(() => new QuotationModule(), [])

  const checkUncheck = (id: number) => {
    const ids = selected.ids.filter((key) => key !== id)
    setSelected((prev) => ({ ...prev, open: false, ids }))
  }

  const onCompleteMilestone = (id: number) => {
    module.completeMilestone(id).then((res) => {
      message.success(res?.data?.message || 'Milestone completed successfully')
      const ids = selected.ids.filter((key) => key !== id)
      setSelected((prev) => ({ ...prev, open: false, ids }))
      onRefresh()
    }).catch((err) => {
      const errMessage = handleError(err)
      message.error(errMessage || 'Something went wrong')
    })
  }

  return (
    <Card className={styles.info_wrapper} style={{ borderRadius: 5, marginTop: 10 }}>
      <div className={styles.info}>
          <div style={{ backgroundColor: 'var(--color-primary-main)'}}>
            <Typography weight='semi' style={{ color: 'white' }} className='ml-2 my-2'>
              Scope of Work
            </Typography>
          </div>
          {quotation?.map((item, index) => (
            <div className={styles.info_item} key={`quotation-${index}`}>
              <p className={styles.info_item_value}>
                <Checkbox />  {item.scopeOfWork}
              </p>
            </div>
          ))}

          {quotation?.length === 0 && (
            <CustomEmpty
              description='No scope of work found'
              imageStyle={{ height: 50 }}
            />
          )}
          
        </div>
      <div className={styles.infoWrapperInner}>
        
        <div className={styles.info}>
          {/* <div style={{ backgroundColor: 'var(--color-light)' }}> */}
          <div style={{ backgroundColor: 'var(--color-primary-main)' }}>
            <Typography weight='semi' style={{ color: 'white' }} className='ml-2 my-2'>
              Milestones
            </Typography>
          </div>

          {quotation?.length === 0 && (
            <CustomEmpty
              description='No milestones found'
              imageStyle={{ height: 50 }}
            />
          )}

          {quotation?.map((item) => {
            const milestones = item?.QuotationMilestone
            return (
              <div key={`quotation-item-${item.id}`}>
                {milestones?.length === 0 && (
                  <CustomEmpty
                    description='No milestones found'
                    imageStyle={{ height: 50 }}
                  />
                )}
                {milestones?.map((milestone, index) => (
                  <div
                    className={styles.milestone_item}
                    key={`milestone-${index}`}
                    style={{ alignItems: "flex-start" }}
                  >
                    {milestone.status !== MilestoneStatus['Not Completed'] ? (
                      <Tooltip title="This milestone is already completed">
                        <CheckOutlined
                          style={{ color: 'var(--color-primary-main)' }}
                        />
                      </Tooltip>
                    ) : (
                      <Popconfirm
                        title="This will mark the milestone as completed. Are you sure?"
                        okText="Yes" cancelText="No"
                        onConfirm={() => {
                          checkUncheck(milestone.id)
                          onCompleteMilestone(milestone.id)
                        }}
                        onCancel={() => checkUncheck(milestone.id)}
                        onOpenChange={(open) => !open && checkUncheck(milestone.id)}
                      >
                        <Checkbox
                          checked={selected.ids.includes(milestone.id)}
                          onChange={() => setSelected((prev) => ({
                            ...prev, open: true, ids: [...prev.ids, milestone.id]
                          }))}
                        />
                      </Popconfirm>
                    )}

                    <div className={styles.milestone_item_content}>
                      <p
                        className={styles.milestone_item_value}
                        style={{
                          textDecoration: milestone.status !== MilestoneStatus['Not Completed'] ? 'line-through' : 'none'
                        }}
                      >
                        <span style={{ width: '70%' }}>{milestone.title}</span>
                        <span className={styles.milestone_item_status}>
                          {MilestoneStatus[milestone.status]}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      <div className={styles.info}>
          <div style={{ backgroundColor: 'var(--color-primary-main)' }}>
            <Typography weight='semi' style={{ color: 'white' }} className='ml-2 my-2'>
              Tasks Assign By Me
            </Typography>
          </div>
          
            <CustomEmpty
              description='No Task Found!'
              imageStyle={{ height: 50 }}
            />
        </div>

        <div className={styles.info}>
          <div style={{ backgroundColor: 'var(--color-primary-main)' }}>
            <Typography weight='semi' style={{ color: 'white' }} className='ml-2 my-2'>
              Tasks Assign To Me
            </Typography>
          </div>
          
          <CustomEmpty
            description='No Task Found!'
            imageStyle={{ height: 50 }}
          />

        </div>
    </Card >
  );
}
export default ProjectInfoSection;