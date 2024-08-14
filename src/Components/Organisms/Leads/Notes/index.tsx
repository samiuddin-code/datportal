import type { FC } from 'react';
import { Typography as AntdTypography, Tag, Tooltip } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import { LeadsTypes } from '@modules/Leads/types';
import CardDropDown from '@organisms/Quotations/Card/Dropdown';
import { Typography } from '@atoms/';
import styles from './styles.module.scss';

const { Paragraph } = AntdTypography;

interface LeadsNoteProps {
  LeadEnquiryFollowUp: LeadsTypes['LeadEnquiryFollowUp']
  onOpenNoteModal: () => void,
  count: number
}

const LeadsNote: FC<LeadsNoteProps> = (props) => {
  const { LeadEnquiryFollowUp, count, onOpenNoteModal } = props;
  return (
    <CardDropDown
      label={
        <div className={styles.quotation_title}>
          <div className='d-flex align-center'>
            <Typography color="dark-main" size="sm">{`${(count && count > 0) ? count :  ""} Note${(count && count > 1) ? 's' :  ""}`}</Typography>

            <Tooltip title="Add Notes">
              <PlusCircleOutlined
                className='ml-2'
                style={{ fontSize: '1rem' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenNoteModal()
                }}
              />
            </Tooltip>
          </div>
        </div>
      }
    >
      <div className={styles.leads_note_container}>
        {LeadEnquiryFollowUp?.length > 0 ? LeadEnquiryFollowUp?.map((item, index) => (
          <div
            key={`notes-${index}`}
            className={styles.leads_note_item}
            style={{
              borderBottom: index === LeadEnquiryFollowUp?.length - 1 ? '' : '1px solid var(--color-border)',
              paddingBottom: index === LeadEnquiryFollowUp?.length - 1 ? '' : '0.3rem'
            }}
          >
            <div className='d-flex align-center'>
              <span className="font-size-sm color-dark-800">
                {item.AddedBy.firstName + " " + item.AddedBy.lastName}
              </span>
              <span
                className="font-size-xs color-dark-sub ml-2"
                style={{ opacity: 0.7 }}
              >
                {moment(item?.addedDate).fromNow()}

                {item.isConcern && (
                  <Tag color="warning" className="ml-2">
                    Concern
                  </Tag>
                )}

                {item.isResolved && (
                  <Tag color="green" className="ml-2">
                    Resolved
                  </Tag>
                )}
              </span>
            </div>
            <Paragraph
              ellipsis={{ rows: 2, expandable: true }}
              className="font-size-xs color-dark-sub mb-0"
            >
              {item?.note}
            </Paragraph>
          </div>
        )) : (
          <div className="font-size-xs color-dark-sub text-center">No Notes</div>
        )}

        {LeadEnquiryFollowUp?.length > 0 && (
          <div
            className={styles.leads_note_view_all}
            onClick={(e) => {
              e.stopPropagation();
              onOpenNoteModal()
            }}
          >
            View All
          </div>
        )}
      </div>
    </CardDropDown>
  );
}
export default LeadsNote;