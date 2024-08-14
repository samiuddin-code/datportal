import { Avatar, Pagination, Table, Tooltip } from "antd";
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


const TaskTable = ({
    tasks,
    searchParams,
    setSearchParams,
    openDetailModal,
    setOpenDetailModal,
    setSelectedTask,
    tableMeta,
    setTableMeta }: TaskTablePropTypes) => {

    const columns: ColumnsType<TaskType> = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (value, task) => <a onClick={() => {
                setSelectedTask(task.id);
                setOpenDetailModal(!openDetailModal);
                searchParams.set("taskId", task.id.toString())
                setSearchParams(searchParams);
            }}>{value}</a>
        },
        {
            title: 'Project Id',
            dataIndex: 'projectId',
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
            title: 'Assignees',
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
                    </Tooltip>
                ))}
            </Avatar.Group>
        },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Table
                dataSource={tasks}
                columns={columns}
                size="small"
                rowKey="id"
                pagination={false} />
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
    )
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
    setTableMeta: Dispatch<SetStateAction<APIResponseObject["meta"]>>
}