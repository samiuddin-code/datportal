import { useMemo, useState } from "react";
import { Popconfirm, Table, Image, Typography as AntdTypography, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "../Common/styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { RESOURCE_BASE_URL } from "../../../../helpers/constants";
import { Switch } from "../../../Atoms/Switch";
import { PermissionsType } from "../../../../Modules/Permissions/types";
import { PermissionsModule } from "../../../../Modules/Permissions";
import { CustomSelect } from "../../../Atoms";
import { SystemModuleVisibility } from "../../../../Modules/SystemModules/types";
import { PermissionPermissionsEnum } from "../../../../Modules/Permissions/permissions";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
const { Paragraph } = AntdTypography;

interface _ActionComponentProps extends ActionComponentProps {
	record: PermissionsType,
	permissions: { [key in PermissionPermissionsEnum]: boolean };
}

const ActionComponent = (props: _ActionComponentProps) => {
	const {
		record, onEditIconClick, reloadTableData,
		permissions: { deletePermissions }
	} = props;

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});
	const module = useMemo(() => new PermissionsModule(), []);

	const handleDelete = () => {
		setActionState({
			...actionState,
			confirmLoading: true,
		});

		if (deletePermissions === false) {
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

export default function TableComponent(props: TableProps & { tableData: PermissionsType[] }) {
	const { tableData, tableLoading, onEditIconClick, reloadTableData } = props;
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in PermissionPermissionsEnum]: boolean };
	const { updatePermissions } = permissions;

	const module = new PermissionsModule();

	const onIsPublishedChange = (checked: boolean, recordId: number) => {
		return module.updateRecord({ isMenuItem: checked }, recordId);
	};

	const onVisibiltyChange = async (value: string, id: number) => {
		if (updatePermissions === true) {
			const formData = new FormData();
			formData.append("visibility", value);
			await module.updateRecord(formData, id).then(() => {
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
			width: "5%",
		},
		{
			title: "Title",
			dataIndex: "name",
			key: "name",
			render: (name: string, record: PermissionsType) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{name}
					</Typography>
					<Paragraph
						title={record.action}
						ellipsis={{
							rows: 1,
							expandable: false,
						}}
						copyable={{ text: record.action }}
						className="font-size-sm color-dark-sub mb-0"
					>
						{record.action}
					</Paragraph>
					<p className="font-size-sm color-dark-sub">{record.description}</p>
				</>
			),
		},
		{
			title: "Icon",
			dataIndex: "icon",
			key: "icon",
			render: (image: string, record: PermissionsType) =>
				image ? (
					<Image
						width={50}
						height={50}
						src={`${RESOURCE_BASE_URL}${image}`}
						preview={false}
						rootClassName="object-fit-contain"
					/>
				) : (
					<></>
				),
		},
		{
			title: "Access to Roles",
			dataIndex: "RolePermissions",
			key: "RolePermissions",
			render: (rolePermissions: Array<{Role: {title: string}}>) => (
				<div>
					<ul className="pa-0 ma-0">
						{
							rolePermissions && rolePermissions?.map((ele) =>
								<li className="pa-0 ma-0 font-size-xs">{ele?.Role?.title}</li>
							)
						}
					</ul>
				</div>
			),
		},
		{
			title: "Menu Item",
			dataIndex: "isMenuItem",
			key: "isMenuItem",
			render: (checked: boolean | undefined, record: PermissionsType) => (
				<Switch
					checked={checked}
					onChange={onIsPublishedChange}
					recordId={record.id}
					allowChange={updatePermissions}
				/>
			),
		},
		{
			title: "Visibility",
			key: "visibility",
			render: (visibility: string, record: { id: number, visibility: string }) => (
				<CustomSelect
					options={Object.entries(SystemModuleVisibility).map(([key, value]) => ({
						label: key,
						value: value,
					}))}
					defaultValue={record.visibility}
					onChange={(value) => onVisibiltyChange(value, record.id)}
					disabled={updatePermissions === false}
				/>
			),
		},
		{
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			render: (text: string, record: PermissionsType) => (
				<ActionComponent
					record={record}
					onEditIconClick={onEditIconClick}
					reloadTableData={reloadTableData}
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
				rowKey={(record: PermissionsType) => `site-permissions-${record.id}`}
			/>
		</div>
	);
}
