import { useMemo } from "react";
import { PageHeader } from "../../../Atoms";
import Layout from "../../../Templates/Layout";
import styles from "./styles.module.scss";
import { useFetchData } from "../../../../hooks";
import { DiaryPermissionsEnum } from "../../../../Modules/Diary/permissions";
import { DiaryModule } from "../../../../Modules/Diary";
import { DiaryType } from "../../../../Modules/Diary/types";
import { Avatar, Tooltip } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { RESOURCE_BASE_URL } from "../../../../helpers/constants";
import { getPermissionSlugs } from "@helpers/common";

const breadCrumbsData = [
    {
        text: "Home",
        isLink: true,
        path: "/",
    },
    {
        isLink: false,
        text: "Diary",
    },
];

const Diary = () => {
    // Retrieve available permissions for the diary page
    const permissionSlug = getPermissionSlugs(DiaryPermissionsEnum);
    const module = useMemo(() => new DiaryModule(), []);

    const { data, onRefresh, setData, error } = useFetchData<DiaryType[]>({
        method: module.getAllRecords,
    });

    if (error) {
        return <div>Error loading diary records.</div>; // Basic error handling
    }

    return (
        <Layout permissionSlug={permissionSlug}>
            <PageHeader
                heading="Diary"
                breadCrumbData={breadCrumbsData}
                filters={
                    <div>
                        {/* Example filter components */}
                        {/* Uncomment and customize as needed */}
                        {/* 
                        // <CustomFilter
                        //     type="radio"
                        //     label="Status"
                        //     name="status"
                        //     options={Object.entries(TransactionStatusString).map(([key, value]) => ({
                        //         label: capitalize(key),
                        //         value: value,
                        //     }))}
                        //     value={String(selectedFilters?.status)}
                        //     onChange={onSelected}
                        //     onReset={() => {
                        //         setReset(true);
                        //         setSelectedFilters({ ...selectedFilters, status: 0 });
                        //     }}
                        //     onUpdate={onUpdate}
                        // />
                        // <CustomFilter
                        //     type="datepicker"
                        //     label="Date"
                        //     name="dateRange"
                        //     onChange={(value) => {
                        //         setSelectedFilters({
                        //             ...selectedFilters,
                        //             dateRange: value
                        //         });
                        //     }}
                        //     onReset={() => {
                        //         setReset(true);
                        //         setSelectedFilters({ ...selectedFilters, dateRange: [] });
                        //     }}
                        //     onUpdate={onUpdate}
                        //     defaultDate={days !== "all" && selectedFilters?.dateRange}
                        // />
                        // <CustomFilter
                        //     type="radio"
                        //     label="Transaction Type"
                        //     name="transactionType"
                        //     options={Object.entries(TransactionTypeString).map(([key, value]) => ({
                        //         label: capitalize(key),
                        //         value: value,
                        //     }))}
                        //     value={String(selectedFilters?.transactionType)}
                        //     onChange={onSelected}
                        //     onReset={() => {
                        //         setReset(true);
                        //         setSelectedFilters({ ...selectedFilters, transactionType: 0 });
                        //     }}
                        //     onUpdate={onUpdate}
                        // />
                        // */}
                    </div>
                }
            />
            <section className={styles.container}>
                {data?.map(diary => (
                    <div key={diary.id} className={styles.card}>
                        <div className={styles.top}>
                            <div className={styles.topLeft}>
                                <Tooltip
                                    title={diary.user?.firstName + " " + diary.user?.lastName}
                                >
                                    <Avatar
                                        size={50}
                                        style={{ border: '1px solid var(--color-light-200)' }}
                                        src={RESOURCE_BASE_URL + diary.user?.profile}
                                        icon={<UserOutlined />}
                                    />
                                </Tooltip>
                                <div className={styles.nameAndId}>
                                    <div className={styles.name}>{diary.user?.firstName + " " + diary.user?.lastName}</div>
                                    <div className={styles.userid}>STAFF-{diary.user?.id}</div>
                                </div>
                            </div>
                            <div className={styles.topRight}>Total hours: {diary.noOfHours}</div>
                        </div>
                        <div className={styles.bottom}>
                            <div className={styles.bottomTop}>
                                <div className={styles.projectHours}>Number of hours: {diary.noOfHours}</div>
                            </div>
                            <div className={styles.bottomBottom}>
                                <div className={styles.remarks}><b>Remarks:</b><br />{diary.remarks}</div>
                                {diary.taskType?.title && <div className={styles.taskBadge}>{diary.taskType?.title}</div>}
                            </div>
                        </div>
                    </div>
                ))}
            </section>
        </Layout>
    );
};

export default Diary;
