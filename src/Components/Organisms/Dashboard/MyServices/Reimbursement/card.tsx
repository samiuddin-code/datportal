import { Card, Typography } from "antd";
import { FileOutlined } from '@ant-design/icons';
import { ReimbursementStatus } from "@helpers/commonEnums";
import styles from './styles.module.scss';
import { convertDate } from "@helpers/dateHandler";
import { ReimbursementType } from "@modules/Reimbursement/types";
const { Paragraph } = Typography;

export const ReimbursementCard = ({ reimbursement, onClick, isFullWidth }: { reimbursement: ReimbursementType, onClick: () => void, isFullWidth?: boolean }) => {
  return (
    <Card
      hoverable onClick={onClick} bodyStyle={{ height: '100%' }}
      className={`${styles.card} ${isFullWidth ? styles.fullWidth : ''}`}
    >
      <div className={styles.cardBody}>
        <div className={styles.cardBodyTop}>
          <div className={styles.cardTitle}>RMB-{reimbursement.id}</div>
          <div className={styles.topRight}>
            {reimbursement._count.ReimbursementReceipt > 0 && <div className={styles.file}>
              <FileOutlined />&nbsp;{reimbursement._count.ReimbursementReceipt}
            </div>}
            <div
              className={styles.status}
              style={{ backgroundColor: ReimbursementStatus[reimbursement.status]?.color }}>
              {ReimbursementStatus[reimbursement.status]?.status}
            </div>
          </div>
        </div>

        <div className={styles.cardBodyMiddle}>
          <Paragraph ellipsis={{
            rows: 2
          }} className={styles.purpose}>{reimbursement.purpose}</Paragraph>
          <div className="font-size-sm">
            Requested by: {reimbursement.RequestBy.firstName + " " + reimbursement.RequestBy.lastName}
          </div>
        </div>

        <div className={styles.cardBodyEnd}>
          <div className={styles.amountWrap}>
            <div className={styles.claimedAmount + " " + ((reimbursement.approvedAmount && (reimbursement.approvedAmount !== reimbursement.claimedAmount)) ? styles.strike : undefined)}>AED {reimbursement.claimedAmount}</div>
            {(reimbursement.approvedAmount && (reimbursement.approvedAmount !== reimbursement.claimedAmount)) ? <div className={styles.approvedAmount}>AED {reimbursement.approvedAmount}</div> : null}
          </div>
          <div className={styles.date}>{convertDate(reimbursement.addedDate, "dd M,yy")}</div>
        </div>
      </div >
    </Card>
  )
}