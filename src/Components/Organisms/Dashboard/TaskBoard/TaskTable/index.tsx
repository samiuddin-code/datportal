import { Avatar, Pagination, Table, Tooltip, DatePicker, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { TaskMember, TaskType } from "../../../../../Modules/Task/types";
import { taskColumnLabels, taskPriority } from "../../../../../helpers/commonEnums";
import { ColumnsType } from "antd/es/table";
import { convertDate } from "../../../../../helpers/dateHandler";
import styles from "./style.module.scss";
import { RESOURCE_BASE_URL } from "../../../../../helpers/constants";
import { Dispatch, SetStateAction, useState } from "react";
import { SetURLSearchParams } from "react-router-dom";
import { APIResponseObject } from "../../../../../Modules/Common/common.interface";
import moment from "moment";

const { RangePicker } = DatePicker;

const TaskTable = ({
    tasks,
    searchParams,
    setSearchParams,
    setOpenDetailModal,
    setSelectedTask,
    openDetailModal,
    tableMeta,
    setTableMeta,
    currentUserUUID,
    view
}: TaskTablePropTypes) => {
    const [milestoneDate, setMilestoneDate] = useState<[moment.Moment | null, moment.Moment | null] | null>(null);

    const handleFilterChange = () => {
        const updatedSearchParams = new URLSearchParams(searchParams.toString());

        if (milestoneDate) {
            updatedSearchParams.set('milestoneStartDate', milestoneDate[0]?.format('YYYY-MM-DD') || '');
            updatedSearchParams.set('milestoneEndDate', milestoneDate[1]?.format('YYYY-MM-DD') || '');
        }
        setSearchParams(updatedSearchParams);
    };

    const filteredTasks = tasks.filter(task => {
        let isFiltered = true;

        // Filter by milestone date
        if (milestoneDate) {
            const [start, end] = milestoneDate;
            const taskStart = moment(task.taskStartFrom);
            const taskEnd = moment(task.taskEndOn);
            isFiltered = start && end ? (taskStart.isBetween(start, end, null, '[]') || taskEnd.isBetween(start, end, null, '[]')) : true;
        }

        return isFiltered;
    });

    const columns: ColumnsType<TaskType> = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (value, task) => <a onClick={() => {
                setSelectedTask(task.id);
                setOpenDetailModal(!openDetailModal);
                searchParams.set("taskId", task.id.toString());
                setSearchParams(searchParams);
            }}>{value}</a>
        },
        {
            title: 'Project Id',
            dataIndex: 'id',
            key: 'projectId',
            render: (value) => <div>{value}</div>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (value) => taskColumnLabels[value as keyof typeof taskColumnLabels],
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            render: (value) => <div className={styles.priorityPill} style={{ backgroundColor: taskPriority[value as keyof typeof taskPriority].color }}>
                {taskPriority[value as keyof typeof taskPriority].title}
            </div>
        },
        {
            title: 'Added Date',
            dataIndex: 'addedDate',
            key: 'addedDate',
            render: (value) => <div>{convertDate(value || "", "dd MM,yy")}</div>
        },
        {
            title: 'Start Date',
            dataIndex: 'taskStartFrom',
            key: 'taskStartFrom',
            render: (value) => <div>{moment(value).format("MMM DD, YYYY hh:mm A")}</div>  // AM/PM format
        },
        {
            title: 'End Date',
            dataIndex: 'taskEndOn',
            key: 'taskEndOn',
            render: (value) => <div>{moment(value).format("MMM DD, YYYY hh:mm A")}</div>  // AM/PM format
        },
        {
            title: 'Assigned To',
            dataIndex: 'TaskMembers',
            key: 'TaskMembers',
            render: (value) => <Avatar.Group>
                {value.map((member: TaskMember) => (
                    <Tooltip
                        overlayInnerStyle={{ borderRadius: '0.25rem', fontSize: 'var(--font-size-sm)' }}
                        key={member.User.uuid}
                        title={member.User.firstName + " " + member.User.lastName}>
                        <Avatar
                            size={32}
                            style={{ border: '1px solid var(--color-light-200)' }}
                            src={RESOURCE_BASE_URL + member.User.profile}
                            icon={<UserOutlined />}
                        />
                        {value.firstName}
                    </Tooltip>
                ))}
            </Avatar.Group>
        },
        {
            title: 'Assigned By',
            dataIndex: 'AddedBy',
            key: 'AddedBy',
            render: (value) => (
                <div>
                    <Avatar
                        size={32}
                        style={{ marginRight: '8px' }}
                        src={RESOURCE_BASE_URL + value.profile}
                        icon={<UserOutlined />}
                    />
                    {value.firstName} {value.lastName}
                </div>
            ),
        },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ marginBottom: '1rem' }}>
                <RangePicker
                    onChange={(dates) => setMilestoneDate(dates as [moment.Moment, moment.Moment])}
                />
                <Button type="primary" onClick={handleFilterChange} style={{ marginLeft: '1rem' }}>
                    Apply Filters
                </Button>
            </div>
            <Table
                dataSource={filteredTasks}
                columns={columns}
                size="small"
                rowKey="id"
                pagination={false}
            />
            <Pagination
                style={{ alignSelf: 'flex-end' }}
                current={tableMeta?.page}
                defaultPageSize={tableMeta?.perPage}
                total={tableMeta?.total}
                onChange={(page, pageSize) => setTableMeta({
                    ...tableMeta,
                    page: page,
                    perPage: pageSize
                })}
            />
        </div>
    );
}

export default TaskTable;

type TaskTablePropTypes = {
    tasks: TaskType[],
    searchParams: URLSearchParams,
    setSearchParams: SetURLSearchParams,
    setOpenDetailModal: Dispatch<SetStateAction<boolean>>,
    setSelectedTask: Dispatch<SetStateAction<number | undefined>>,
    openDetailModal: boolean,
    tableMeta: APIResponseObject["meta"],
    setTableMeta: Dispatch<SetStateAction<APIResponseObject["meta"]>>,
    currentUserUUID: string
    view: 'assignedByMe' | 'assignedToMe' | 'all'
}
