import { useState, FC, useMemo, useEffect } from 'react';
import { Card, Checkbox, Popconfirm, Tooltip, message } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { ProjectTypes } from '@modules/Project/types';
import { QuotationModule } from '@modules/Quotation';
import Typography from '@atoms/Headings';
import { MilestoneStatus } from '@helpers/commonEnums';
import { handleError } from '@helpers/common';
import styles from './styles.module.scss';
import CustomEmpty from '@atoms/CustomEmpty';
import TaskProject from '@organisms/Dashboard/Overview/TaskProject';
import NotePad from 'Components/Notepad/Notepad';
import { PieChart, Pie, Cell, Tooltip as RechartTooltip, ResponsiveContainer } from 'recharts';


interface ProjectInfoSectionProps {
  data: ProjectTypes;
  onRefresh: <QueryType = any>(query?: QueryType) => void;
}

const ProjectInfoSection: FC<ProjectInfoSectionProps> = ({ data, onRefresh }) => {
  const quotation = data?.Quotation;
  const [selected, setSelected] = useState<{ open: boolean; ids: number[] }>({ open: false, ids: [] });
  const [paymentTerms, setPaymentTerms] = useState<string[]>([]);
  const module = useMemo(() => new QuotationModule(), []);
  useEffect(() => {
    if (data?.id) {
      module.fetchPaymentTermsByProjectId(data.id)
        .then((terms) => {
          setPaymentTerms(terms);
        })
        .catch((err) => {
          console.error("Failed to fetch payment terms:", err);
          message.error('Failed to fetch payment terms');
        });
    }
  }, [data?.id, module]);
  
  const paymentTermData = useMemo(() => {
    const termCount: { [key: string]: number } = {};
    
    paymentTerms.forEach(term => {
      if (termCount[term]) {
        termCount[term] += 1;
      } else {
        termCount[term] = 1;
      }
    });
    return Object.entries(termCount).map(([name, value]) => ({ name, value }));
  }, [paymentTerms]);

  const processPaymentTerms = (response: any): string[] => {
    try {
      console.log("Processing response:", response);
  
      // Handle different formats of response
      if (Array.isArray(response.data)) {
        return response.data.map((item: any) => item.paymentTerms || 'No payment terms available');
      } else if (response.data && response.data.someProperty) {
        // Adjust according to the actual structure
        return response.data.someProperty.map((item: any) => item.paymentTerms || 'No payment terms available');
      } else {
        console.error("Unexpected response format:", response);
        return [];
      }
    } catch (error) {
      console.error("Error processing payment terms:", error);
      return [];
    }
  };
  

  
  const handleCheckboxChange = (id: number) => {
    setSelected((prev) => {
      const isChecked = prev.ids.includes(id);
      return {
        ...prev,
        open: !isChecked,
        ids: isChecked ? prev.ids.filter(itemId => itemId !== id) : [...prev.ids, id]
      };
    });
  };

  const handleCompleteMilestone = (id: number) => {
    module.completeMilestone(id)
      .then((res) => {
        message.success(res?.data?.message || 'Milestone completed successfully');
        setSelected((prev) => ({
          ...prev,
          open: false,
          ids: prev.ids.filter(itemId => itemId !== id)
        }));
        onRefresh();
      })
      .catch((err) => {
        const errMessage = handleError(err);
        message.error(errMessage || 'Something went wrong');
      });
  };

  return (
    <Card className={styles.info_wrapper} style={{ borderRadius: 5, marginTop: 10 }}>
      <div className={styles.info}>
        <div style={{ backgroundColor: 'var(--color-primary-main)', width: '100%' }}>
          <Typography weight='semi' style={{ color: 'white' }} className='ml-2 my-2'>
            Scope of Work
          </Typography>
        </div>
        {quotation?.length > 0 ? (
          quotation.map((item, index) => (
            <div className={styles.info_item} key={`quotation-${index}`}>
              <p className={styles.info_item_value}>
                <Checkbox disabled /> {item.scopeOfWork}
              </p>
            </div>
          ))
        ) : (
          <CustomEmpty
            description='No scope of work found'
            imageStyle={{ height: 50 }}
          />
        )}
      </div>

      <div className={styles.infoWrapperInner}>
        <div className={styles.info}>
          <div style={{ backgroundColor: 'var(--color-primary-main)', width: '100%' }}>
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
            const milestones = item?.QuotationMilestone;
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
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => handleCompleteMilestone(milestone.id)}
                      >
                        <Checkbox
                          checked={selected.ids.includes(milestone.id)}
                          onChange={() => handleCheckboxChange(milestone.id)}
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
            );
          })}
        </div>
      </div>
      <div className={styles.info}>
  <div style={{ backgroundColor: 'var(--color-primary-main)', width: '100%' }}>
    <Typography weight='semi' style={{ color: 'white' }} className='ml-2 my-2'>
      Payment Terms
    </Typography>

  </div>
  {paymentTerms.length === 0 ? (
    <CustomEmpty
      description='No payment terms found'
      imageStyle={{ height: 50 }}
    />
  ) : (
    paymentTerms.map((term, index) => (
      <div className={styles.info_item} key={`payment-term-${index}`}>
        <p className={styles.info_item_value}>{term}</p>
      </div>
    ))
  )}
</div>

      <div className={styles.info}>
        <div style={{ backgroundColor: 'var(--color-primary-main)', width: '100%' }}>
          <Typography weight='semi' style={{ color: 'white' }} className='ml-2 my-2'>
            Task Overview
          </Typography>
        </div>
        <TaskProject style={{ width: '100%' }} />
      </div>
    </Card>
  );
}

export default ProjectInfoSection;
