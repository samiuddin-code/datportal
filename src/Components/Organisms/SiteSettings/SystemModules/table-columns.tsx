import { useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Popconfirm, Switch, Table, Image, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "../Common/styles.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { tableProps } from "./settings";
import { RootState } from "../../../../Redux/store";
import {
	deleteSystemModule,
	editSystemModuleDataAction,
	getSystemModulesData,
} from "../../../../Redux/Reducers/SystemModulesReducer/action";
import { dispatchType } from "../../../../Redux/Reducers/commonTypes";
import { SystemModule } from "../../../../Redux/Reducers/SystemModulesReducer/types";
import { RESOURCE_BASE_URL } from "../../../../helpers/constants";
import { PermissionsType } from "../../../../Modules/Permissions/types";
import { CustomSelect } from "../../../Atoms";
import { SystemModulesModule } from "../../../../Modules/SystemModules";
import { SystemModuleVisibility } from "../../../../Modules/SystemModules/types";
import { SystemModulesPermissionsEnum } from "../../../../Modules/SystemModules/permissions";

interface ActionComponentProps {
	record: SystemModule;
	openModal: (data: any) => void;
	permissions: { [key in SystemModulesPermissionsEnum]: boolean };
}

const ActionComponent = (props: ActionComponentProps) => {
	const {
		record, openModal, permissions: {
			deleteSystemModules: deleteSystemModulePermission
		},
	} = props;

	const dispatch = useDispatch<dispatchType>();

	const onDelete = useCallback((id: number) => {
		if (deleteSystemModulePermission === true) {
			dispatch(deleteSystemModule(id, () => dispatch(getSystemModulesData())));
		} else {
			message.error("You don't have permission to delete this record, please contact your admin.");
		}
	}, [dispatch]);

	return (
		<div className={styles.actions}>
			<span onClick={() => openModal(record)}>
				<img src="/images/editicon.svg" alt="" />
			</span>
			<Popconfirm
				placement="top"
				title={"Are you sure?"}
				onConfirm={() => onDelete(record.id)}
				okText={"Yes"}
				cancelText={"No"}
			>
				<DeleteOutlined className={styles.bg__red} />
			</Popconfirm>
		</div>
	);
};

export default function TableComponent(props: tableProps) {
	const { tableData, tableLoading, openModal } = props;
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as {
		[key in SystemModulesPermissionsEnum]: boolean
	} & { readPermissions: boolean }
	const { updateSystemModules, readPermissions } = permissions
	
	const dispatch = useDispatch<dispatchType>();

	const systemModule = useMemo(() => new SystemModulesModule(), [])

	const { editSystemModuleData } = useSelector((state: RootState) => state.systemModulesReducer);

	const onIsMenuItemChange = (checked: boolean, record: SystemModule) => {
		if (updateSystemModules === true) {
			dispatch(
				editSystemModuleDataAction({ isMenuItem: checked ? true : false }, record, () => {
					dispatch(getSystemModulesData());
				})
			);
		} else {
			message.error("You don't have permission to update this record, please contact your admin.");
		}
	};

	const onVisibiltyChange = async (value: string, id: number) => {
		if (updateSystemModules === true) {
			const formData = new FormData();
			formData.append("visibility", value);
			await systemModule.updateRecord(formData, id).then(() => {
				message.success("Visibility updated successfully")
			}).catch((err) => {
				message.error(err.response?.data?.message)
			})
		} else {
			message.error("You don't have permission to update this record, please contact your admin.");
		}
	}

	const columns = [
		{
			title: "S.No",
			dataIndex: "index",
			key: "index",
			render: (text: string, record: {}, index: number) => index + 1,
			width: "60px",
		},
		{
			title: "Icon",
			dataIndex: "icon",
			key: "icon",
			width: "80px",
			render: (text: string) =>
				text ? (
					<Image
						width={20}
						height={20}
						src={`${RESOURCE_BASE_URL}${text}`}
						preview={false}
						rootClassName="object-fit-contain"
					/>
				) : (
					<></>
				),
		},
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
			render: (text: string, record: SystemModule) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{text}
					</Typography>
					<p className={"color-light-800 font-size-sm"}>
						{record.slug}
						{record.url ? (
							<Link to={`${record.url}`} className="ml-2">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={1.5}
									stroke="currentColor"
									height={"15px"}
									width={"15px"}
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
									/>
								</svg>
							</Link>
						) : (
							""
						)}
					</p>
				</>
			),
		},

		{
			title: "Description",
			dataIndex: "description",
			key: "description",
			render: (text: string) => (
				<Typography color="dark-sub" size="sm">
					{text}
				</Typography>
			),
		},
		{
			title: "Permissions",
			dataIndex: "Permissions",
			key: "Permissions",
			render: (Permissions: PermissionsType[]) => (
				<div>
					<ul className="pa-0 ma-0">
						{
							Permissions?.map((ele) =>
								<li className="pa-0 ma-0 font-size-xs">{ele.name}</li>
							)
						}
					</ul>
				</div>
			),
		},
		{
			title: "Manage Permission",
			key: "managePermission",
			render: (checked: boolean, record: any) => (
				<>
					{readPermissions === true ? (
						<a
							href={`/siteSettings/system-modules/permission?moduleId=${record.id}`}
							target="_blank"
							rel="noreferrer"
						>
							Manage Permissions
						</a>
					) : null}
				</>
			),
		},
		{
			title: "Visibility",
			key: "visibility",
			render: (visibility: string, record: { id: number, visibility: SystemModuleVisibility }) => (
				<>
					<CustomSelect
						options={Object.entries(SystemModuleVisibility).map(([key, value]) => ({
							label: key,
							value: value,
						}))}
						defaultValue={record.visibility}
						onChange={(value) => onVisibiltyChange(value, record.id)}
						disabled={updateSystemModules === false}
					/>
				</>
			),
		},
		{
			title: "Menu Item",
			dataIndex: "isMenuItem",
			width: "100px",
			key: "isMenuItem",
			render: (text: boolean | undefined, record: SystemModule) => (
				<Switch
					checked={text}
					onChange={(checked) => onIsMenuItemChange(checked, record)}
					loading={editSystemModuleData.loading}
				/>
			),
		},

		{
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			width: "140px",
			render: (text: string, record: SystemModule) => (
				<ActionComponent
					record={record}
					openModal={openModal}
					permissions={permissions}
				/>
			),
		},
	];

	return (
		<div className={styles.antdTableWrapper}>
			<Table
				sticky
				dataSource={tableData}
				columns={columns}
				pagination={false}
				scroll={{ x: 991 }}
				loading={tableLoading}
				rowKey={(record: SystemModule) => `system-module-${record.id}`}
			/>
		</div>
	);
}
