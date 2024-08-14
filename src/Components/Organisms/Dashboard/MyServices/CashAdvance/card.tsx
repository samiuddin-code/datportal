import { Card, Typography } from "antd";
import { FileOutlined } from '@ant-design/icons';
import { CashAdvanceStatus } from "@helpers/commonEnums";
import styles from './styles.module.scss';
import { convertDate } from "@helpers/dateHandler";
import { CashAdvanceType } from "@modules/CashAdvance/types";
const { Paragraph } = Typography;

export const CashAdvanceCard = ({ cashAdvance, onClick, isFullWidth }: { cashAdvance: CashAdvanceType, onClick: () => void, isFullWidth?: boolean }) => {
    return (
        <Card
            hoverable onClick={onClick}
            className={`${styles.card} ${isFullWidth ? styles.fullWidth : ''}`}
        >
            <div className={styles.cardBody}>
                <div className={styles.cardBodyTop}>
                    <div className={styles.cardTitle}>CSH-{cashAdvance.id}</div>
                    <div className={styles.topRight}>
                        {cashAdvance._count.Attachments > 0 && <div className={styles.file}>
                            <FileOutlined />&nbsp;{cashAdvance._count.Attachments}
                        </div>}
                        <div
                            className={styles.status}
                            style={{ backgroundColor: CashAdvanceStatus[cashAdvance?.status]?.color }}>
                            {CashAdvanceStatus[cashAdvance.status]?.status.replaceAll("_", " ")}
                        </div>
                    </div>
                </div>

                <div className={styles.cardBodyMiddle}>
                    <Paragraph ellipsis={{
                        rows: 2
                    }} className={styles.purpose}>{cashAdvance.purpose}</Paragraph>
                    <div className="font-size-sm">
                        Requested by: {cashAdvance.RequestBy.firstName + " " + cashAdvance.RequestBy.lastName}
                    </div>
                </div>

                <div className={styles.cardBodyEnd}>
                    <div className={styles.amountWrap}>
                        <div className={styles.requestAmount + " " + ((cashAdvance.approvedAmount && (cashAdvance.approvedAmount !== cashAdvance.requestAmount)) ? styles.strike : undefined)}>AED {cashAdvance.requestAmount}</div>
                        {(cashAdvance.approvedAmount && (cashAdvance.approvedAmount !== cashAdvance.requestAmount)) ? <div className={styles.approvedAmount}>AED {cashAdvance.approvedAmount}</div> : null}
                    </div>
                    <div className={styles.date}>{convertDate(cashAdvance.addedDate, "dd M,yy")}</div>
                </div>
            </div >
        </Card>
    )
}