import { useState, type FC, type SVGProps, useMemo } from 'react';
import { Popconfirm, message } from 'antd';
import { BASE_URL } from '../../../../services/axiosInstance';
import { PropertyDealTypes } from '../../../../Modules/Properties/types';
import { FRONT_END_URL, RESOURCE_BASE_URL } from '../../../../helpers/constants';
import { convertDate } from '../../../../helpers/dateHandler';
import { CalenderIcon, DeleteIcon } from '../../../Icons';
import { PropertyDealsModule } from '../../../../Modules/Properties';
import { Typography } from '../../../Atoms';
import VideoPlayer from './modal/video-player';
import styles from './styles.module.scss';

interface DealCardProps {
    data: PropertyDealTypes;
    reloadTableData: (query?: { [key: string]: any }) => void
    onEditIconClick: (data: any) => void
}

const EditIcon = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            {...props}
        >
            <path d="M11 2H9C4 2 2 4 2 9v6c0 5 2 7 7 7h6c5 0 7-2 7-7v-2" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M16.04 3.02 8.16 10.9c-.3.3-.6.89-.66 1.32l-.43 3.01c-.16 1.09.61 1.85 1.7 1.7l3.01-.43c.42-.06 1.01-.36 1.32-.66l7.88-7.88c1.36-1.36 2-2.94 0-4.94-2-2-3.58-1.36-4.94 0Z" stroke="#ffffff" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M14.91 4.15a7.144 7.144 0 0 0 4.94 4.94" stroke="#ffffff" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
    )
}

const PlayIcon = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg width="100" height="100" viewBox="-25 -25 200 200"
            {...props}
        >
            <g>
                <path d="M34.857,3.613C20.084-4.861,8.107,2.081,8.107,19.106v125.637c0,17.042,11.977,23.975,26.75,15.509L144.67,97.275 c14.778-8.477,14.778-22.211,0-30.686L34.857,3.613z" />
            </g>
        </svg>
    )
}

const DealCard: FC<DealCardProps> = ({ data, reloadTableData, onEditIconClick }) => {
    const {
        id, mediaType, media, user, caption, addedDate, property,
        thumbnail
    } = data;

    const [actionState, setActionState] = useState({
        confirmLoading: false,
        openPopConfirm: false,
    });
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    const module = useMemo(() => new PropertyDealsModule(), []);

    const handleDelete = () => {
        setActionState({ ...actionState, confirmLoading: true });

        module.deleteRecord(id).then(() => {
            setActionState({
                ...actionState,
                openPopConfirm: false,
                confirmLoading: false,
            });
            reloadTableData();
        }).catch((err) => {
            message.error(err.message || "Something went wrong!");
            setActionState({
                ...actionState,
                confirmLoading: false,
            });
        });
    };

    // Open Popconfirm
    const showPopconfirm = () => setActionState({ ...actionState, openPopConfirm: true });

    return (
        <div className={styles.card}>
            {/* Header Gradient*/}
            <div className={styles.headerBg} />
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.user}>
                    <img
                        src={`${RESOURCE_BASE_URL}${user.profile}`}
                        alt={`${user.firstName} ${user.lastName}`}
                        className={styles.profile}
                    />
                    <h3 className={styles.name}>{`${user.firstName} ${user.lastName}`}</h3>
                </div>

                {/** Action Icons */}
                <div className={styles.actions}>
                    {/** Edit Icon */}
                    <EditIcon style={{ cursor: "pointer" }} onClick={() => onEditIconClick(data)} />
                    {/** Delete Icon */}
                    <Popconfirm
                        open={actionState.openPopConfirm}
                        placement="top"
                        title="Are you sure?"
                        onConfirm={handleDelete}
                        onCancel={() => setActionState({ ...actionState, openPopConfirm: false })}
                        okButtonProps={{ loading: actionState.confirmLoading }}
                        okText="Yes"
                        cancelText="No"
                        onOpenChange={(visible) => {
                            if (!visible) {
                                setActionState({ ...actionState, openPopConfirm: false });
                            }
                        }}
                    >
                        <DeleteIcon
                            style={{
                                backgroundColor: "#fff",
                                borderRadius: "50%",
                                padding: "5px",
                                cursor: "pointer"
                            }}
                            onClick={showPopconfirm}
                        />
                    </Popconfirm>
                </div>
            </div>

            {/* Media */}
            <div className={styles.mediaContainer}>
                <img
                    src={mediaType === "image" ? `${RESOURCE_BASE_URL}${media}` : `${RESOURCE_BASE_URL}${thumbnail}`}
                    alt={caption}
                    className={styles.image}
                />
                {mediaType === "video" && (
                    <PlayIcon
                        className={styles.playIcon}
                        onClick={() => setIsVideoOpen(true)}
                    />
                )}

                {mediaType === "video" && (
                    <VideoPlayer
                        src={`${BASE_URL}property-deals-resources/${media}`}
                        visible={isVideoOpen}
                        handleCancel={() => setIsVideoOpen(false)}
                    />
                )}
            </div>

            <div className="d-flex justify-space-between mt-2">
                {/* Date */}
                <div className="d-flex align-items-center">
                    <CalenderIcon className="mr-2" />
                    <p className={styles.date}>
                        {convertDate(addedDate, "dd M,yy-t") || "N/A"}
                    </p>
                </div>

                {/** View Property On Main Website (Users Website) */}
                {property?.slug && (
                    <a
                        href={`${FRONT_END_URL}/en/property/${property.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        title={property.localization[0]?.title}
                        className="d-flex"
                    >
                        <Typography color="dark-main" size="sm" weight="bold">
                            View Property:
                        </Typography>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            height={"16px"}
                            width={"17px"}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                            />
                        </svg>
                    </a>
                )}
            </div>

            {/* Caption */}
            <div className="d-flex justify-space-between mt-2">
                <p className={styles.caption}>{caption}</p>
            </div>
        </div>
    );
};

export default DealCard;