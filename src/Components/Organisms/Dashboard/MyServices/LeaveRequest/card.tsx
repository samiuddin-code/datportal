import { Card, Tooltip, Typography } from "antd";
import { FileOutlined, FormOutlined } from '@ant-design/icons';
import { LeaveRequestStatus, LeaveType } from "@helpers/commonEnums";
import styles from './styles.module.scss';
import { convertDate, getDifferenceInDays } from "@helpers/dateHandler";
import { LeaveRequestType } from "@modules/LeaveRequest/types";
const { Paragraph } = Typography;

type LeaveRequestCardProps = {
  leaveRequest: LeaveRequestType;
  onClick: () => void;
  isFullWidth?: boolean;
}

export const LeaveRequestCard = (props: LeaveRequestCardProps) => {
  const { leaveRequest, onClick, isFullWidth } = props;
  return (
    <Card
      hoverable onClick={onClick} bodyStyle={{ height: '100%' }}
      className={`${styles.card} ${isFullWidth ? styles.fullWidth : ''}`}
    >
      <div className={styles.cardBody}>
        <div className={styles.cardBodyTop}>
          <div className={styles.cardTitle}>LVE-{leaveRequest.id}
            <span style={{ textTransform: 'capitalize' }}>&nbsp;({LeaveType[leaveRequest.typeOfLeave]})</span>
          </div>
          <div className={styles.topRight}>
            {leaveRequest._count.Attachments > 0 && (
              <div className={styles.file}>
                <FileOutlined />&nbsp;{leaveRequest._count.Attachments}
              </div>
            )}
            <div
              className={styles.status}
              style={{ backgroundColor: LeaveRequestStatus[leaveRequest?.status]?.color }}
            >
              {LeaveRequestStatus[leaveRequest.status]?.status.replace("_", " ")}
            </div>
          </div>
        </div>

        <div className={styles.cardBodyMiddle}>
          <Paragraph ellipsis={{ rows: 2 }} className={styles.purpose}>
            {leaveRequest.purpose}
          </Paragraph>
          <div className="font-size-sm">
            Requested by: {leaveRequest.RequestBy.firstName + " " + leaveRequest.RequestBy.lastName}
          </div>
        </div>

        <div className={styles.cardBodyEnd}>
          <div className={styles.dateWrap}>
            <div className={styles.fromDate}>
              {convertDate(leaveRequest.leaveFrom, "dd M,yy")}
            </div>
            <div className={styles.fromDate}>
              to {convertDate(leaveRequest.leaveTo, "dd M,yy")}
            </div>
            <div className={styles.bold}>
              ({getDifferenceInDays(leaveRequest.leaveFrom, leaveRequest.leaveTo) + 1} days)
            </div>
          </div>
          <Tooltip title="Requested date" className={styles.date}>
            <FormOutlined />&nbsp;&nbsp;{convertDate(leaveRequest.addedDate, "dd M,yy")}
          </Tooltip>
        </div>
      </div >
    </Card>
  )
}