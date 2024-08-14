import { UserOutlined, FolderTwoTone, PaperClipOutlined, ShareAltOutlined, DeleteOutlined, CopyOutlined, WhatsAppOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFetchData } from "hooks";
import { TaskModule } from "@modules/Task";
import { TaskDetailType, TaskMember, TaskQuery, UpdateTaskMemberType } from "@modules/Task/types";
import styles from "./style.module.scss";
import { Avatar, Button, Image, Modal, Popconfirm, Popover, Select, Tooltip, Typography, Upload, UploadFile, UploadProps, message } from "antd";
import { APPLICATION_RESOURCE_BASE_URL, RESOURCE_BASE_URL } from "@helpers/constants";
import { convertDate } from "@helpers/dateHandler";
import { taskColumnLabels, taskColumnLabelsColors, taskPriority } from "@helpers/commonEnums";
import EditableInput from "@atoms/EditableInput";
import { TaskSkeleton } from "./TaskSkeleton";
import { BASE_URL } from "@services/axiosInstance";
import TokenService from "@services/tokenService";
import { Document, Page, pdfjs } from 'react-pdf';
import { UserTypes } from "@modules/User/types";
import { SelectableDropdown, UserPopover } from "@atoms/UserPopver";
import { XMarkIcon } from "@icons/";
import { UserModule } from "@modules/User";
import { useDebounce } from "@helpers/useDebounce";
import EditableTextarea from "@atoms/EditableTextarea";
import EditableDatePicker from "@atoms/EditableDatePicker";

import { getPermissionSlugs } from "@helpers/common";
import { useSelector } from "react-redux";
import { RootState } from "Redux/store";
import { TaskPermissionsEnum } from "../../../../../Modules/Task/permissions";

import moment from "moment";
const { Text } = Typography;

interface TaskDetailsModalProps {
    openModal: boolean;
    onCancel: () => void;
    id: number,
    /** External function to update the task
     * @param {QueryType} query query to be passed to the api
     */

    onUpdate: (query?: TaskQuery) => void;
}

type SearchedResultTypes<T = any> = {
    data?: T[]
    loading: boolean
}

export const TaskDetailsModal = (props: TaskDetailsModalProps) => {
    const {
        openModal, onCancel, id, onUpdate
    } = props;
    pdfjs.GlobalWorkerOptions.workerSrc =
        `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
    const module = useMemo(() => new TaskModule(), []);
    const userModule = useMemo(() => new UserModule(), []);
    const access_token = TokenService.getLocalAccessToken();
    const [showUploadList, setShowUploadList] = useState<any>({
        showPreviewIcon: true,
        showRemoveIcon: false,
    });

    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const uploadProps: UploadProps = {
        name: "file",
        listType: "picture",
        multiple: true,
        beforeUpload: () => false,
        maxCount: 5,
        accept: "*",
    };

    const [isUpdate, setIsUpdate] = useState<any>({
        taskTitle: {
            show: false,
            value: ""
        },
        instructions: {
            show: false,
            value: ""
        },
        taskEndOn: {
            show: false,
            value: ""
        }
    })

    const [showShare, setShowShare] = useState(false);
    const [deleteId, setDeleteId] = useState<number>();
    // Support Engineers Searched Users
    const [supportEngineers, setSupportEngineers] = useState<SearchedResultTypes<TaskMember>>({
        data: [],
        loading: false,
    })
    const [showRemoveSupportEng, setShowRemoveSupportEng] = useState<{ [key: string]: boolean }>({});
    // Support Engineers Search Term
    const [supportEngineersTerm, setSearchSupportEngineers] = useState("");
    const debouncedSupportEngineersTerm = useDebounce(supportEngineersTerm, 500);

    const { data, onRefresh, setData } = useFetchData<TaskDetailType>({
        method: () => module.getRecordById(id)
    });

    /** Remove Project Member */
    const onRemoveProjectMember = (userId: number) => {
        // if (permissions.modifyProjectMembers === true) {
        module.removeTaskMembers(Number(data?.id), userId).then((res) => {
            message.success(res?.data?.message)
            onRefresh()
            onUpdate()
        }).catch((err) => {
            const errorMessage = err?.response?.data?.message
            message.error(errorMessage)
        })
        // } else {
        //     message.error("You don't have permission to remove project members")
        // }
    }
    const onUpdateProjectMember = ({ assignedTo }: Pick<UpdateTaskMemberType, "assignedTo">) => {
        // if (permissions.modifyProjectMembers === true) {
        module.updateTaskMembers({ taskId: data?.id, assignedTo: assignedTo })
            .then((res) => {
                message.success(res?.data?.message)
                onRefresh()
                onUpdate()
            }).catch((err) => {
                const errorMessage = err?.response?.data?.message
                message.error(errorMessage)
            })
        // } else {
        //   message.error("You don't have permission to update project members")
        // }
    }
    const GetSupportEngineers = (params: { name: string }) => {
        setSupportEngineers((prev) => ({ ...prev, loading: true }))

        userModule.getAllRecords(params).then((res) => {
            setSupportEngineers((prev) => {
                // if the data is already present in the state, then don't add it again
                const filteredData = res?.data?.data?.filter((item: UserTypes) => {
                    return !prev?.data?.find((prevItem) => prevItem.User.id === item.id);
                });
                const _temp: { User: UserTypes }[] = []
                filteredData.forEach((item: UserTypes) => {
                    _temp.push({ User: item })
                });
                // add the new data to the existing data
                return {
                    data: [...prev.data!, ..._temp],
                    loading: false,
                }
            })
        }).catch((err) => {
            message.error(err.response.data.message || "Something went wrong!")
            setSupportEngineers((prev) => ({ ...prev, loading: false }))
        })
    }
    // Support Engineer Search
    const onSupportEngineerSearch = useCallback(() => {
        if (debouncedSupportEngineersTerm) {
            GetSupportEngineers({ name: debouncedSupportEngineersTerm })
        }
    }, [debouncedSupportEngineersTerm])

    useEffect(() => {
        onSupportEngineerSearch()
    }, [onSupportEngineerSearch])

    const handleFileChange: UploadProps["onChange"] = (info) => {
        let newFileList = [...info.fileList];

        // 1. Limit the number of uploaded files
        // Only to show two recent uploaded files, and old ones will be replaced by the new
        newFileList = newFileList.slice(-2);

        // 2. Read from response and show file link
        newFileList = newFileList.map((file) => {
            if (file.response) {
                // Component will show file.url as link
                file.url = file.response.url;
            }
            return file;
        });
        setFileList(newFileList);
        setShowUploadList({ ...showUploadList, showRemoveIcon: true });
    };

    useEffect(() => {
        if (id && openModal)
            onRefresh();
    }, [openModal])

    useEffect(() => {
        if (data)
            setIsUpdate({
                taskTitle: {
                    ...isUpdate.taskTitle,
                    value: data?.title
                },
                instructions: {
                    ...isUpdate.taskTitle,
                    value: data?.instructions
                }
            })
        setSupportEngineers({ ...supportEngineers, data: data?.TaskMembers })
    }, [data])

    useEffect(() => {
        if (fileList.length > 0) {
            const formData = new FormData();
            fileList.forEach(file => {
                formData.append("files[]", file["originFileObj"]!);
            })
            module.uploadFiles({ "files[]": formData.get("files[]"), taskId: id })
                .then(res => {
                    onRefresh();
                    setFileList([]);
                    props.onUpdate();
                })
                .catch((err) => {
                    setFileList([]);
                    console.log(err);
                });
        }
    }, [fileList])

    const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
    // available permissions for the properties page
    const permissionSlug = getPermissionSlugs(TaskPermissionsEnum)
    const taskPermissions = userPermissions as { [key in TaskPermissionsEnum]: boolean };

    const { loggedInUserData } = useSelector((state: RootState) => state.usersReducer);


    return (
        <Modal
            open={openModal}
            closable={true}
            onCancel={() => {
                onCancel();
                setData(undefined)
            }}
            footer={false}
            width={1200}
            centered
            destroyOnClose={true}
            bodyStyle={{
                minHeight: '600px'
            }}
            className="task-detail-modal">
            {!data ? <TaskSkeleton />
                : <><div className={styles.taskId}>
                    <div>
                        <FolderTwoTone style={{ fontSize: 16, marginRight: '0.25rem' }} twoToneColor="#52c41a" /> TSK-{data?.id}
                    </div>
                    <div className={styles.selectWrap} style={{
                        backgroundColor: taskPriority[data?.priority as keyof typeof taskPriority]?.color
                    }}>
                        <Select
                            value={taskPriority[data?.priority as keyof typeof taskPriority]?.title}
                            style={{
                                fontSize: 'var(--font-size-sm)',
                                border: 'none',
                                color: '#fff',
                                padding: '0rem 0.5rem'
                            }}
                            onChange={(val) => {
                                module.updateRecord({ priority: Number(val) }, Number(data?.id))
                                    .then((res) => {
                                        if (res) {
                                            setData({ ...data!, priority: Number(val) });
                                            props.onUpdate();
                                        }
                                    })
                            }}
                            bordered={false}
                            options={Object.entries(taskPriority)?.map(([key, value]) => ({
                                label: value?.title,
                                value: key,
                            }))}
                            size="small"
                            showArrow={false}
                            dropdownStyle={{
                                borderRadius: '0.25rem',
                                minWidth: 120
                            }}
                        />
                    </div>
                </div>
                    <div className={styles.modalWrap}>
                        <div className={styles.modalLeft}>
                            <div>
                                {isUpdate.taskTitle.show && (taskPermissions?.updateAnyTask === true || (taskPermissions?.updateTask === true && data?.addedById === loggedInUserData?.data.id)) ?

                                    <EditableInput
                                        onBlur={() => setIsUpdate({ ...isUpdate, taskTitle: { ...isUpdate.taskTitle, show: false } })}
                                        onChange={(e: any) => setIsUpdate({ ...isUpdate, taskTitle: { ...isUpdate.taskTitle, value: e.target.value } })}
                                        onMouseDown={() => {
                                            module.updateRecord({ title: isUpdate.taskTitle.value }, Number(data?.id))
                                                .then((res) => {
                                                    if (res) {
                                                        setData({ ...data!, title: isUpdate.taskTitle.value });
                                                        props.onUpdate();
                                                    }
                                                })
                                        }}
                                        defaultValue={data?.title} />
                                    :
                                    <div
                                        onClick={() => setIsUpdate({ ...isUpdate, taskTitle: { ...isUpdate.taskTitle, show: true } })}
                                        className={styles.Tasktitle}>
                                        <b>{data?.title}</b>
                                    </div>}

                                <div className={styles.actionButtonWrap}>
                                    <Popover
                                        content={
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <Tooltip
                                                    overlayInnerStyle={{ borderRadius: '0.25rem', fontSize: 'var(--font-size-sm)' }}
                                                    placement={"bottom"}
                                                    title={"Link copied successfully"}
                                                    trigger={"click"}
                                                    showArrow={false}
                                                >
                                                    <Button
                                                        icon={<CopyOutlined />}
                                                        size="large"
                                                        onClick={() => navigator?.clipboard?.writeText(window.location.href)}>
                                                        Copy Link
                                                    </Button>
                                                </Tooltip>
                                                <Button
                                                    icon={<WhatsAppOutlined />}
                                                    size="large" >Whatsapp</Button>
                                            </div>

                                        }
                                        title="Share task"
                                        placement={"bottom"}
                                        trigger="click"
                                        open={showShare}
                                        onOpenChange={() => setShowShare(!showShare)}
                                        overlayInnerStyle={{ borderRadius: '0.25rem', fontSize: 'var(--font-size-sm)' }}
                                    >
                                        <Button
                                            size="small"
                                            icon={<ShareAltOutlined style={{ fontSize: 18 }} />}
                                            className={styles.actionButton}>
                                            Share
                                        </Button>
                                    </ Popover >
                                    <Upload {...uploadProps} showUploadList={showUploadList} fileList={fileList}
                                        onChange={handleFileChange}>
                                        <Button
                                            icon={<PaperClipOutlined style={{ fontSize: 18 }} />}
                                            onClick={() => { }}
                                            className={styles.actionButton}>
                                            Attach
                                        </Button>
                                    </Upload>
                                    
                                   
                                    <Popconfirm
                                        title="Are you sure you want to delete this task?"
                                        onConfirm={() => {
                                            module.deleteRecord(id)
                                                .then(() => {
                                                    onCancel();
                                                    setData(undefined);
                                                    onRefresh();
                                                    props.onUpdate();
                                                })
                                                .catch((err) => {
                                                    message.error("Something bad happened")
                                                })
                                        }}
                                        okText="Yes"
                                        cancelText="No"
                                        overlayInnerStyle={{
                                            borderRadius: '0.25rem'
                                        }}
                                    >
                                        {(taskPermissions?.deleteAnyTask === true || (taskPermissions?.deleteTask === true && data?.addedById === loggedInUserData?.data.id)) && (  
                                        <Button
                                            size="small"
                                            icon={<DeleteOutlined style={{ fontSize: 18 }} />}
                                            className={styles.actionButton}
                                            //disabled={!taskPermissions.deleteTask}
                                            >
                                            Delete
                                        </Button>
                                        )}
                                    </Popconfirm>
                                    
                                
                                </div>
                            </div>

                            <div onBlur={() => setIsUpdate({ ...isUpdate, instructions: { ...isUpdate.instructions, show: false } })}
                                className={styles.descriptionWrap}>
                                <div className={styles.title}><b>Description</b></div>
                               
                                {
                                isUpdate.instructions.show && (taskPermissions?.updateAnyTask === true || (taskPermissions?.updateTask === true && data?.addedById === loggedInUserData?.data.id)) ?
                                    <EditableTextarea
                                        onBlur={() => setIsUpdate({ ...isUpdate, taskTitle: { ...isUpdate.taskTitle, show: false } })}
                                        onChange={(e) => setIsUpdate({ ...isUpdate, instructions: { ...isUpdate.instructions, value: e.target.value } })}
                                        onMouseDown={() => {
                                            module.updateRecord({ instructions: isUpdate?.instructions?.value }, Number(data?.id))
                                                .then((res) => {
                                                    if (res) {
                                                        setData({ ...data!, instructions: isUpdate.instructions.value });
                                                        props.onUpdate();
                                                    }
                                                })
                                        }}
                                        defaultValue={data?.instructions} />
                                    : <div
                                        className={styles.instructions}
                                        onClick={() => setIsUpdate({ ...isUpdate, instructions: { ...isUpdate.instructions, show: true } })}>
                                        {data?.instructions?.split('\n')?.map(item => <p>{item}</p>)}
                                    </div>
                                    }
                                
                            </div>
                            <div className={styles.descriptionWrap}>
                                {!(data?.Resources.length > 0) ? null :
                                    <><div className={styles.title}><b>Attachments ({data?.Resources.length})</b></div>
                                        <div className={styles.attachmentsWrap}>
                                            {data.Resources.map(resource => (
                                                <div className={styles.resourceWrap}>
                                                    {resource.fileType.includes("image") ?
                                                        <Image
                                                            style={{ objectFit: 'cover', borderRadius: '0.25rem 0.25rem 0 0' }}
                                                            width={150}
                                                            height={100}
                                                            src={`${BASE_URL}resources/all/${resource.path}?authKey=${access_token}`} />

                                                        : <a
                                                            href={`${APPLICATION_RESOURCE_BASE_URL}${resource?.path}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            <Document
                                                                file={`${BASE_URL}resources/all/${resource.path}?authKey=${access_token}`}
                                                            // onLoadSuccess={onDocumentLoadSuccess}
                                                            >
                                                                <Page renderTextLayer={false} pageNumber={1} />
                                                            </Document>
                                                        </a>}
                                                    <div style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', display: 'flex', flexDirection: 'column' }}>
                                                        <Text style={{ width: 125, fontSize: 'var(--font-size-xs)' }} strong ellipsis={true}>{resource.name}</Text>
                                                        <Text style={{ width: 125, fontSize: 'var(--font-size-xxs)' }} ellipsis={true}>{convertDate(resource.addedDate, "dd M,yy-t")}</Text>
                                                    </div>
                                                    <Popconfirm
                                                        title="Are you sure you want to delete this attachment?"
                                                        onConfirm={() => {
                                                            module.removeTaskFile(deleteId!)
                                                                .then(() => {
                                                                    onRefresh();
                                                                    props.onUpdate();
                                                                })
                                                                .catch((err) => {
                                                                    message.error("Something bad happened")
                                                                })
                                                        }}
                                                        okText="Yes"
                                                        cancelText="No"
                                                        overlayInnerStyle={{
                                                            borderRadius: '0.25rem'
                                                        }}
                                                    >
                                                        <div title="Delete task"
                                                            onClick={() => {
                                                                setDeleteId(resource.id);
                                                            }}
                                                            className={styles.deleteWrap}>
                                                            <DeleteOutlined style={{ fontSize: 14, color: 'var(--color-light)' }} />
                                                        </div>
                                                    </Popconfirm>
                                                </div>
                                            ))}
                                        </div>
                                    </>}
                            </div>
                        </div>

                        <div className={styles.modalRight}>
                            <div className={styles.status}>
                                <div className={styles.selectWrap}>
                                    <Select
                                        value={taskColumnLabels[data?.status as keyof typeof taskColumnLabels]}
                                        style={{
                                            fontSize: 'var(--font-size-sm)',
                                            background: taskColumnLabelsColors[data?.status as keyof typeof taskColumnLabelsColors],
                                            borderRadius: '0.25rem',
                                            border: 'none'
                                        }}
                                        onChange={(val) => {
                                            module.updateRecord({ status: Number(val) }, Number(data?.id))
                                                .then((res) => {
                                                    if (res) {
                                                        setData({ ...data!, status: Number(val) });
                                                        props.onUpdate();
                                                    }
                                                })
                                        }}
                                        bordered={false}
                                        options={Object.entries(taskColumnLabels)?.map(([key, value]) => ({
                                            label: value,
                                            value: key,
                                        }))}
                                        dropdownStyle={{
                                            borderRadius: '0.25rem',
                                            minWidth: 120,
                                        }}
                                    />
                                </div>
                            </div>
                            <div className={styles.rightTop}>
                                <div><b>Details</b></div>
                            </div>
                            <div className={styles.rightBottom}>
                                <div className={styles.row}>
                                    <div className={styles.rowTitle}>
                                        <b>Assignees</b>
                                    </div>
                                    <div className={styles.rowValue} style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                                        {data?.TaskMembers.map((member) => {
                                            const { User } = member
                                            return (
                                                <div
                                                    key={User?.uuid}
                                                    style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}
                                                    onMouseEnter={() => setShowRemoveSupportEng({ [User?.uuid]: true })}
                                                    onMouseLeave={() => setShowRemoveSupportEng({ [User?.uuid]: false })}
                                                >
                                                    <UserPopover type="user" user={User} >
                                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                            <Avatar
                                                                size={32}
                                                                src={`${RESOURCE_BASE_URL}${User?.profile}`}
                                                                icon={<UserOutlined />}
                                                                style={{ border: '1px solid var(--color-border)' }}
                                                            />

                                                            <div>
                                                                {`${User?.firstName} ${User?.lastName}`}
                                                            </div>
                                                        </div>
                                                    </UserPopover>

                                                    {showRemoveSupportEng[User?.uuid] && (
                                                        <Popconfirm
                                                            placement='left'
                                                            title="Are you sure to remove this member?"
                                                            onConfirm={() => onRemoveProjectMember(User?.id)}
                                                            okText="Yes"
                                                            cancelText="No"
                                                        >
                                                            <XMarkIcon
                                                                style={{ cursor: 'pointer' }}
                                                                color='var(--color-red-yp)'
                                                            />
                                                        </Popconfirm>
                                                    )}
                                                </div>
                                            )
                                        })}

                                        <SelectableDropdown
                                            showPopover={false}
                                            placeholder='Add Assignee'
                                            notFoundDescription='No Assignee Found, Search with name'
                                            loading={supportEngineers?.loading}
                                            onSearch={(value) => setSearchSupportEngineers(value)}
                                            // Don't show the already added support engineers
                                            options={supportEngineers?.data?.map((member) => {
                                                return {
                                                    value: member?.User?.uuid,
                                                    label: `${member?.User?.firstName} ${member?.User?.lastName}`,
                                                    icon: (
                                                        <Avatar
                                                            size={32}
                                                            src={`${RESOURCE_BASE_URL}${member?.User?.profile}`}
                                                            icon={<UserOutlined />}
                                                        />
                                                    )
                                                }
                                            }) || []}
                                            onSelect={(value) => {
                                                const { data } = supportEngineers
                                                const selectedUser = data?.find((member) => member?.User.uuid === value)?.User
                                                onUpdateProjectMember({ assignedTo: [selectedUser?.id.toString()!] })
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.rowTitle}><b>Start date</b></div>
                                    <div className={styles.rowValue}>
                                        {convertDate(data?.taskStartFrom || "", "MM dd,yy")}
                                    </div>
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.rowTitle}><b>End date</b></div>
                                    {isUpdate?.taskEndOn?.show ?
                                        <EditableDatePicker
                                            onBlur={() => setIsUpdate({ ...isUpdate, taskEndOn: { ...isUpdate.taskEndOn, show: false } })}
                                            onChange={(value) => setIsUpdate({ ...isUpdate, taskEndOn: { ...isUpdate.taskEndOn, value: value?.toISOString() } })}
                                            onMouseDown={() => {
                                                module.updateRecord({ taskEndOn: isUpdate.taskEndOn.value }, Number(data?.id))
                                                    .then((res) => {
                                                        if (res) {
                                                            setData({ ...data!, taskEndOn: isUpdate.taskEndOn.value });
                                                            props.onUpdate();
                                                        }
                                                    })
                                            }}
                                            defaultValue={moment(data?.taskEndOn)} />
                                        :
                                        <div
                                            className={styles.rowValue + " " + styles.editableRowValue}
                                            style={{ color: (new Date() > new Date(data?.taskEndOn)) ? taskPriority["1"]?.color : undefined }}
                                            onClick={() => setIsUpdate({ ...isUpdate, taskEndOn: { ...isUpdate.taskEndOn, show: true } })}>
                                            {convertDate(data?.taskEndOn || "", "MM dd,yy")}
                                        </div>}
                                </div>

                                {/* <div className={styles.row}>
                                    <div className={styles.rowTitle}><b>Project title</b></div>
                                    <div className={styles.rowValue}>
                                        {data?.Project.title}
                                    </div>
                                </div> */}
                                {/* <div className={styles.row}>
                                    <div className={styles.rowTitle}><b>Project ID</b></div>
                                    <div className={styles.rowValue}>
                                        DAT-{data?.Project.quoteNumber}
                                    </div>
                                </div> */}
                            </div>
                        </div>

                    </div></>}
        </Modal>
    );
};
