import type { FC } from 'react';
import { Card, Typography as AntdTypography } from 'antd';
import moment from 'moment';
import { Typography } from '@atoms/';
import { LeadsTypes } from '@modules/Leads/types';
import styles from './styles.module.scss';

const { Paragraph } = AntdTypography;

interface LeadsNoteProps {
  LeadEnquiryFollowUp: LeadsTypes['LeadEnquiryFollowUp']
}

const LeadsNote: FC<LeadsNoteProps> = ({ LeadEnquiryFollowUp }) => {
  return (
    <Card
      size="small"
      title={
        <div className="d-flex justify-space-between align-center">
          <Typography color="dark-main" size="sm" weight='semi'>Notes</Typography>
        </div>
      }
      headStyle={{ padding: "0px 0.5rem", margin: 0 }}
      className={styles.leads_note}
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
      </div>
    </Card>
  );
}
export default LeadsNote;