import { CarReservationType } from "@modules/CarReservation/types";
import { Card, Tooltip, Typography } from "antd";
import { FileOutlined, FormOutlined } from '@ant-design/icons';
import { CarReservationRequestStatus } from "@helpers/commonEnums";
import styles from './styles.module.scss';
import { convertDate } from "@helpers/dateHandler";
import moment from "moment";
const { Paragraph } = Typography;

type CarReservationCardProps = {
  carReservation: CarReservationType;
  onClick: () => void;
  isFullWidth?: boolean;
}

export const CarReservationCard = (props: CarReservationCardProps) => {
  const { carReservation, onClick, isFullWidth } = props;
  return (
    <Card
      hoverable onClick={onClick} bodyStyle={{ height: '100%' }}
      className={`${styles.card} ${isFullWidth ? styles.fullWidth : ''}`}
    >
      <div className={styles.cardBody}>
        <div className={styles.cardBodyTop}>
          <div className={styles.cardTitle}>CRR-{carReservation.id}
          </div>
          <div className={styles.topRight}>
            {carReservation._count.Attachments > 0 && <div className={styles.file}>
              <FileOutlined />&nbsp;{carReservation._count.Attachments}
            </div>}
            <div
              className={styles.status}
              style={{ backgroundColor: CarReservationRequestStatus[carReservation?.status]?.color }}>
              {CarReservationRequestStatus[carReservation.status]?.status}
            </div>

          </div>
        </div>

        <div className={styles.cardBodyMiddle}>
          <Paragraph ellipsis={{
            rows: 2
          }} className={styles.purpose}>{carReservation.purpose}</Paragraph >
          <div className="font-size-sm">
            Requested by: {carReservation.RequestBy.firstName + " " + carReservation.RequestBy.lastName}
          </div>
        </div>

        <div className={styles.cardBodyEnd}>
          <div className={styles.dateWrap}>
            <div className={styles.fromDate}>{moment(carReservation?.fromDate).format("ddd") + ", " + convertDate(carReservation?.fromDate || "", "dd M,yy")}</div>
            <div className={styles.fromDate}>(From {moment(carReservation?.fromDate).format("LT")}</div>
            <div className={styles.fromDate}>to {moment(carReservation?.toDate).format("LT")})</div>
          </div>
          <Tooltip title="Requested date" className={styles.date}><FormOutlined />&nbsp;&nbsp;{convertDate(carReservation.addedDate, "dd M,yy")}</Tooltip>
        </div>
      </div >
    </Card>
  )
}