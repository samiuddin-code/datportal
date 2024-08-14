import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { message, Popconfirm, Table } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "../../Common/styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { RoleTypes } from "../../../../Modules/Roles/types";
import { Switch } from "../../../Atoms/Switch";
import { RolesModule } from "../../../../Modules/Roles";
import { convertDate } from "../../../../helpers/dateHandler";
import { PermissionSettingsIcon, ViewIcon } from "../../../Icons";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { RolePermissionsEnum } from "../../../../Modules/Roles/permissions";

interface _ActionComponentProps extends ActionComponentProps {
	record: RoleTypes;
	permissions: { [key in RolePermissionsEnum]: boolean };
}

const ActionComponent = (props: _ActionComponentProps) => {
	const {
		record, onEditIconClick, reloadTableData,
		permissions: { deleteRole }
	} = props;

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});
	const module = useMemo(() => new RolesModule(), []);

	const handleDelete = () => {
		setActionState({
			...actionState,
			confirmLoading: true,
		});

		if (deleteRole === false) {
			message.error("You don't have permission to delete this record, please contact your admin.");
			setActionState({
				...actionState,
				openPopConfirm: false,
			});
			return;
		}

		module.deleteRecord(record.id).then((res) => {
			setActionState({
				...actionState,
				openPopConfirm: false,
				confirmLoading: false,
			});
			reloadTableData();
		}).catch((err) => {
			setActionState({
				...actionState,
				confirmLoading: false,
			});
		});
	};

	const showPopconfirm = () => {
		setActionState({
			...actionState,
			openPopConfirm: true,
		});
	};

	return (
		<div className={styles.actions}>
			<span onClick={() => onEditIconClick(record)}>
				<img src="/images/editicon.svg" alt="" />
			</span>
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
				<DeleteOutlined className={styles.bg__red} onClick={showPopconfirm} />
			</Popconfirm>
		</div>
	);
};

export default function TableComponent(props: TableProps & { tableData: RoleTypes[] }) {
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in RolePermissionsEnum]: boolean } & {
		grantPrivilegesToRole: boolean, readRolePermissions: boolean
	}
	const {
		updateRole, deleteRole, grantPrivilegesToRole,
		readRolePermissions
	} = permissions

	const { tableData, tableLoading, onEditIconClick, reloadTableData } = props;
	const module = new RolesModule();
	const onIsPublishedChange = (checked: boolean, recordId: number) => {
		return module.updateRecord({ isPublished: checked }, recordId);
	};

	const columns = [
		{
			title: "S.No",
			dataIndex: "index",
			key: "index",
			render: (text: string, record: {}, index: number) => index + 1,
			width: "5%",
		},
		{
			title: "Title",
			dataIndex: "title",
			key: "title",
			render: (text: string, record: RoleTypes) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{record.title}
					</Typography>

					<Typography color="dark-sub" size="xs">
						{record.description}
					</Typography>
				</>
			),
		},
		{
			title: "Slug",
			dataIndex: "slug",
			key: "slug",
			render: (slug: string, record: RoleTypes) => (
				<>
					<Typography color="dark-sub" size="sm">
						{slug}
					</Typography>
				</>
			),
		},
		{
			title: "Visibility",
			dataIndex: "visibility",
			key: "visibility",
			render: (visibility: string, record: RoleTypes) => (
				<Typography color="dark-sub" size="sm">
					{visibility}
				</Typography>
			),
		},
		{
			title: "Date Added",
			dataIndex: "addedDate",
			key: "addedDate",
			render: (addedDate: string, record: RoleTypes) => (
				<Typography color="dark-sub" size="sm">
					{convertDate(addedDate, "dd M,yy")}
				</Typography>
			),
			//TODO: add Organization to the table
		},
	];

	// show publish column only if user has update permission
	if (updateRole === true) {
		columns.push({
			title: "Published",
			dataIndex: "isPublished",
			key: "isPublished",
			render: (isPublished: string, record: RoleTypes) => (
				<Switch
					checked={record.isPublished}
					onChange={onIsPublishedChange}
					recordId={record.id}
					allowChange={updateRole}
				/>
			),
		});
	}

	// show permissions column only if user has read or grant permission
	if (grantPrivilegesToRole || readRolePermissions) {
		columns.push({
			title: "Permissions",
			dataIndex: "permissions",
			key: "permissions",
			render: (slug: string, record: RoleTypes) => (
				<div>
					{/* {(grantPrivilegesToRole === true && record?.visibility === "organization") && ( */}
					<Link to={`/roles/permissions?roleId=${record.id}`} className="d-flex">
						<PermissionSettingsIcon className="my-auto" />

						<Typography color="dark-sub" size="sm" className="ml-2">
							Manage Permissions
						</Typography>

					</Link>
					{/* )} */}

					{readRolePermissions === true && (
						<Link to={`/roles/permissions/view?roleId=${record?.id}`} className="d-flex mt-2">
							<ViewIcon className="my-auto" />

							<Typography color="dark-sub" size="sm" className="ml-2">
								View Permissions
							</Typography>
						</Link>
					)}
				</div>
			),
		})
	}

	// show actions column only if user has update or delete role permission
	if (updateRole || deleteRole) {
		columns.push({
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			render: (actions: string, record: RoleTypes) => (
				<>
					{/* {record?.visibility === "organization" && ( */}
					<ActionComponent
						record={record}
						onEditIconClick={onEditIconClick}
						reloadTableData={reloadTableData}
						permissions={permissions}
					/>
					{/* )} */}
				</>
			),
		});
	}

	return (
		<div className={styles.antdTableWrapper}>
			<Table
				sticky
				dataSource={tableData}
				columns={columns}
				pagination={false}
				scroll={{ x: 991 }}
				loading={tableLoading}
				rowKey={(record: RoleTypes) => `site-Role-${record.id}`}
			/>
		</div>
	);
}
