import { Table, Image, Tooltip } from "antd";
import { Link, useSearchParams } from "react-router-dom";
import { RESOURCE_BASE_URL } from "../../../../helpers/constants";
import { PermissionsType } from "../../../../Modules/Permissions/types";
import { RoleTypes } from "../../../../Modules/Roles/types";
import { SystemModule } from "../../../../Redux/Reducers/SystemModulesReducer/types";
import { Typography } from "../../../Atoms";
import { CheckMarkIcon, PermissionSettingsIcon, XMarkIcon } from "../../../Icons";
import { tableProps } from "./settings";
import styles from './styles.module.scss'

export default function TableComponent(props: tableProps & { rolePermissions: string[], roleData: RoleTypes }) {
    const { tableData, tableLoading, rolePermissions, roleData } = props;

    const [searchParams] = useSearchParams()

    const roleId = searchParams.get('roleId')

    const columns = [
        {
            title: "S.No",
            dataIndex: "index",
            key: "index",
            render: (_text: string, _record: {}, index: number) => index + 1,
            width: "60px",
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (text: string, record: SystemModule) => (
                <div className="d-flex">
                    <div className="w-50">
                        {record.icon ? (
                            <Image
                                width={20}
                                height={20}
                                src={`${RESOURCE_BASE_URL}${record.icon}`}
                                preview={false}
                                rootClassName="object-fit-contain"
                            />
                        ) : (
                            <></>
                        )}
                    </div>
                    <div>
                        <Typography color="dark-main" size="sm" weight="bold">
                            {text}
                        </Typography>
                        <p className={"color-light-800 font-size-xs"}>
                            {record.description}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            title: "Permissions",
            dataIndex: "permissions",
            key: "permissions",
            render: (permissions: PermissionsType[]) => (
                <div>
                    {permissions?.map((ele) => (
                        <div className="d-flex">
                            {rolePermissions.indexOf(ele.action) !== -1 ? (
                                <>
                                    <div className="pa-0 ma-0 font-size-sm color-green-yp">{ele.name}</div>
                                    <div className="ml-2">
                                        <CheckMarkIcon className="color-green-yp" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className={`pa-0 ma-0 font-size-sm color-red-yp ${styles.opacity_6}`}>{ele.name}</div>
                                    <div className={`ml-2 ${styles.opacity_6}`}>
                                        <XMarkIcon className="color-red-yp" />
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            ),
        },
        {
            title: "Action",
            dataIndex: "action",
            key: "action",
            render: (action: string, record: SystemModule) => (
                <div>
                    {/* {roleData?.visibility === 'global' ? ( */}
                        <Tooltip
                            placement="top"
                            title={`You cannot manage permissions for the selected role as 
                            it is determined by the system. You may duplicate the role and 
                            assign respective permissions.`}
                        >
                            <div className="d-flex">
                                <PermissionSettingsIcon className={`my-auto ${styles.opacity_6}`} />

                                <Typography color="dark-sub" size="sm" className={`ml-2 ${styles.opacity_6}`}>
                                    Manage Permissions
                                </Typography>
                            </div>
                        </Tooltip>
                    {/* ) : ( */}
                        {/* <Link to={`/roles/permissions?roleId=${Number(roleId)}&moduleId=${record.id}`} className="d-flex">
                            <PermissionSettingsIcon className="my-auto" />

                            <Typography color="dark-sub" size="sm" className="ml-2">
                                Manage Permissions
                            </Typography>
                        </Link> */}
                    {/* )} */}

                </div>
            ),
        },
    ];

    return (
        <div>
            <Table
                sticky
                dataSource={tableData}
                columns={columns}
                pagination={false}
                scroll={{ x: 991 }}
                loading={tableLoading}
                rowKey={(record: SystemModule) => `roles-permission-view-${record.id}`}
            />
        </div>
    );
}