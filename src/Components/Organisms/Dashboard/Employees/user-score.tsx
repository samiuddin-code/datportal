import { ReactNode, useMemo, useState } from "react";
import { Dropdown, Card } from "antd";
import { CheckOutlined, CloseOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { CustomButton, Typography } from "../../../Atoms";
import styles from "./styles.module.scss";
// import { ProfileScoringStatus } from "../../../../helpers/commonEnums";
import { XMarkIcon } from "../../../Icons";
import { UserTypes } from "../../../../Modules/User/types";
import { Link } from "react-router-dom";
import ProfileDrawer from "../AccountSettings/Drawer";

interface UserScoreModalProps {
    user: UserTypes
    allowActions: boolean,
    children: ReactNode,
}

function UserScoreModal(props: UserScoreModalProps) {
    const { children, user, allowActions } = props;

    const [open, setOpen] = useState<boolean>(false);

    // Memoize userScoring to avoid re-rendering
    // const userScoring = useMemo(() => user?.userScoring, [user]);

    // Get the styles based on the status
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

    // Get the icon based on the status
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

            <div className={styles.cardWrap}>
                {/* {userScoring?.map((item) => (
                    <div key={`user-score-card-${item.id}`}>
                        <div className={getStyles(item.status)}>
                            {getIcon(item.status)}
                            <span>{item.title}</span>
                        </div>

                        {ProfileScoringStatus[item.status] !== 'success' && (
                            <div>
                                <p className="font-size-sm color-dark-sub mb-2">{item.message}</p>
                                {allowActions && (
                                    <div>
                                        <ProfileDrawer
                                            userId={user.id}
                                            action={
                                                <CustomButton
                                                    type="plain_underlined"
                                                    size="xs"
                                                    fontSize="sm"
                                                    className="pa-3"
                                                    onClick={() => setOpen(false)}
                                                >
                                                    Improve {item.title}
                                                </CustomButton>
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))} */}
            </div>
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
