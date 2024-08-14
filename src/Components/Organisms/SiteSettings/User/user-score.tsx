import { ReactNode, useState } from "react";
import { Dropdown, Card } from "antd";
import { Typography } from "../../../Atoms";
import styles from "./styles.module.scss";
// import { ProfileScoringStatus } from "../../../../helpers/commonEnums";
import { XMarkIcon } from "../../../Icons";
import { UserTypes } from "../../../../Modules/User/types";

interface UserScoreModalProps {
    user: UserTypes
    children: ReactNode,
}

function UserScoreModal(props: UserScoreModalProps) {
    const { children, user } = props;

    const [open, setOpen] = useState<boolean>(false);

    // Memoize userScoring to avoid re-rendering
    //const userScoring = useMemo(() => user?.userScoring, [user]);

    // const getStyles = (status: number) => {
    //     switch (status) {
    //         case ProfileScoringStatus.can_be_improved:
    //             return styles.card__info;
    //         case ProfileScoringStatus.success:
    //             return styles.card__green;
    //         case ProfileScoringStatus.error:
    //             return styles.card;
    //         default:
    //             return '';
    //     }
    // }

    // const getIcon = (status: number) => {
    //     switch (status) {
    //         case ProfileScoringStatus.can_be_improved:
    //             return <InfoCircleOutlined />;
    //         case ProfileScoringStatus.success:
    //             return <CheckOutlined />;
    //         case ProfileScoringStatus.error:
    //             return <CloseOutlined />;
    //         default:
    //             return '';
    //     }
    // }

    const overlay = (
        <Card className={styles.scoreOverlay}>
            <div className="d-flex justify-space-between">
                <Typography color="dark-main" size="lg">
                    {`${user.firstName} ${user.lastName}'s Score`}
                </Typography>

                {/** Close Dropdown */}
                <XMarkIcon
                    onClick={() => setOpen(false)}
                    style={{ cursor: 'pointer' }}
                />
            </div>

            {/* <div className={styles.cardWrap}>
                {userScoring?.map((item) => (
                    <div key={`user-score-card-${item.id}`}>
                        <div className={getStyles(item.status)}>
                            {getIcon(item.status)}
                            <span>{item.title}</span>
                        </div>

                        {ProfileScoringStatus[item.status] !== 'success' && (
                            <p className="font-size-sm color-dark-sub mb-2">{item.message}</p>
                        )}
                    </div>
                ))}
            </div> */}
        </Card>
    );

    return (
        <Dropdown
            dropdownRender={() => overlay}
            // trigger={user.profileScore > 0 ? ['click'] : []}
            open={open}
            onOpenChange={() => setOpen(true)}
        >
            {children}
        </Dropdown>
    );
}

export default UserScoreModal;
