import { useMemo } from "react";
import { Popconfirm, Table } from "antd";
import { useSelector } from "react-redux";
import { ErrorCode403 } from "@atoms/ErrorCodes";
import { useFetchData } from "hooks";
import { ProjectPermissionsEnum } from "@modules/Project/permissions";
import { RootState } from "Redux/store";
import { UserModule } from "@modules/User";
import { CompanyAssetModule } from "@modules/CompanyAsset";
import { UserDetailsType } from "@modules/User/types";
import { DeleteOutlined } from "@ant-design/icons";
import styles from "../../../Common/styles.module.scss";

const MyAllocatedResources = ({ userId, onManageClick }: { userId: number, onManageClick: () => void }) => {
    const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
    const permissions = userPermissions as { [key in ProjectPermissionsEnum]: boolean };
    const { readProject } = permissions;

    const userModule = useMemo(() => new UserModule(), []);
    const assetModule = useMemo(() => new CompanyAssetModule(), []);

    const { data, onRefresh } = useFetchData<UserDetailsType>({
        method: () => userModule.getRecordById(userId)
    });


    const columns = [
        {
            title: <div>
                Resource
                <span
                    onClick={onManageClick}
                    style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-light-400)',
                        cursor: 'pointer',
                        marginLeft: '1rem',
                        fontWeight: 'normal'
                    }}>Manage</span>
            </div>,
            dataIndex: 'assetName',
            key: 'assetName',
            render: (text: any, record: any) =>
                <div>
                    {record?.CompanyAsset?.assetName}
                </div>
        },
        {
            title: 'Label',
            dataIndex: 'label',
            key: 'label'
        },
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
            render: (text: any, record: any) => <div>{record?.CompanyAsset?.code}</div>
        },
        {
            title: 'Action',
            key: 'action',
            render: (text: any, record: any) => <Popconfirm
                placement="top"
                title="Are you sure?"
                onConfirm={() => assetModule.revokeResources(record?.id)
                    .then(() => {
                        onRefresh();
                    })}
                okText="Yes"
                cancelText="No"
            >
                <DeleteOutlined className={styles.bg__red} />
            </Popconfirm>
        }
    ];

    // Function to handle pagination change
    // const onPaginationChange = (page: number, pageSize: number) => onUpdate({ page, perPage: pageSize });
    // useEffect(() => {
    //     if (["closed", "open"].includes(activeFilter)) {
    //         onUpdate({ isClosed: activeFilter === "open" ? false : true })
    //     }
    //     else {
    //         onUpdate()
    //     }
    // }, [activeFilter])

    return (
        <>
            {readProject === true && (
                <div style={{ display: 'flex', width: '100%', marginTop: '1rem' }}>
                    <Table style={{ flexGrow: 1 }} columns={columns} dataSource={data?.AssetAllocation} pagination={false} />

                </div>
            )}
            {readProject === false && (
                <ErrorCode403
                    mainMessage="You don't have permission to view this data"
                />
            )}
        </>
    );
}
export default MyAllocatedResources;
