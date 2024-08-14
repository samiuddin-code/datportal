import { Card, Typography } from "antd";
import { FileOutlined } from '@ant-design/icons';
import { taskColumnLabelsColors, techSupportColumnLabels } from "@helpers/commonEnums";
import styles from './styles.module.scss';
import { convertDate } from "@helpers/dateHandler";
import { TaskType } from "@modules/Task/types";
const { Paragraph } = Typography;

export const TechSupportCard = ({ task, isFullWidth, onClick }: { task: TaskType, isFullWidth?: boolean, onClick: () => void }) => {
    return (
        <Card
            onClick={onClick} hoverable bodyStyle={{ height: '100%' }}
            className={`${styles.card} ${isFullWidth ? styles.fullWidth : ''}`}
        >
            <div className={styles.cardBody}>
                <div className={styles.cardBodyTop}>
                    <div className={styles.cardTitle}>TCH-{task.id}
                    </div>
                    <div className={styles.topRight}>
                        {task._count.Resources > 0 && <div className={styles.file}>
                            <FileOutlined />&nbsp;{task._count.Resources}
                        </div>}
                        <div
                            className={styles.status}
                            style={{ backgroundColor: taskColumnLabelsColors[task?.status as keyof typeof taskColumnLabelsColors] }}>
                            {techSupportColumnLabels[task.status as keyof typeof techSupportColumnLabels]}
                        </div>

                    </div>
                </div>

                <Paragraph ellipsis={{
                    rows: 2
                }} className={styles.cardBodyMiddle}>
                    <div className={styles.purpose}>{task.title}</div>
                </Paragraph>

                <div className={styles.cardBodyEnd}>
                    <div className={styles.date}>{convertDate(task.addedDate, "dd M,yy")}</div>
                </div>
            </div >
        </Card>
    )
}