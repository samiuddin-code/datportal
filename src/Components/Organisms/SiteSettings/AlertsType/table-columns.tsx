import { useMemo, useState } from "react";
import { message, Popconfirm, Table } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "../Common/styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { CalenderIcon } from "../../../Icons";
import { convertDate } from "../../../../helpers/dateHandler";
import { AlertsTypeModule } from "../../../../Modules/AlertsType";
import { AlertsTypes } from "../../../../Modules/AlertsType/types";
import { Switch } from "../../../Atoms/Switch";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { AlertsTypePermissionsEnum } from "../../../../Modules/AlertsType/permissions";

interface _ActionComponentProps extends ActionComponentProps {
	record: AlertsTypes;
	permissions: { [key in AlertsTypePermissionsEnum]: boolean };
}

const ActionComponent = (props: _ActionComponentProps) => {
	const {
		record, onEditIconClick, reloadTableData,
		permissions: {
			deleteAlertsType,
			updateAlertsType,
		},
	} = props;

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});
	const module = useMemo(() => new AlertsTypeModule(), []);

	const handleDelete = () => {
		if (deleteAlertsType === false) {
			message.error("You don't have permission to delete this record, please contact your admin.");
			setActionState({
				...actionState,
				openPopConfirm: false,
			})
			return;
		}

		setActionState({
			...actionState,
			confirmLoading: true,
		});

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

			message.error(err?.response?.data?.message);
		});
	};

	const showPopconfirm = () => {
		setActionState({
			...actionState,
			openPopConfirm: true,
		});
	};

	const openEditModal = () => {
		if (updateAlertsType === false) {
			message.error("You don't have permission to edit this record, please contact your admin.");
			return;
		}

		onEditIconClick(record);
	};

	return (
		<div className={styles.actions}>
			<span onClick={openEditModal}>
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

export default function TableComponent(props: TableProps & { tableData: AlertsTypes[] }) {
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in AlertsTypePermissionsEnum]: boolean };

	const { tableData, tableLoading, onEditIconClick, reloadTableData } = props;
	const module = new AlertsTypeModule();

	const onIsPublishedChange = async (checked: boolean, recordId: number) => {
		return module.updateRecord({ isPublished: checked }, recordId);
	};

	const onForAdminPanel = async (checked: boolean, recordId: number) => {
		return module.updateRecord({ forAdminpanel: checked }, recordId);
	};

	const columns = [
		{
			title: "S.No",
			dataIndex: "index",
			key: "index",
			render: (text: string, record: {}, index: number) => index + 1,
			width: "6%",
		},
		{
			title: "Title",
			dataIndex: "title",
			key: "title",
			render: (title: string, record: AlertsTypes) => (
				<>
					<Typography color="dark-main" size="normal">
						{title}
					</Typography>

					<Typography color="dark-main" size="xs">
						{`Description: ${record.description}`}
					</Typography>

					<Typography color="dark-main" size="xs" className="my-1">
						{`Slug: ${record.slug}`}
					</Typography>

					<div className="d-flex mt-1">
						<CalenderIcon className="mr-2" />
						<Typography color="dark-sub" size="sm">
							{`${convertDate(record.addedDate, "dd MM yy")}`}
						</Typography>
					</div>
				</>
			),
			width: "30%"
		},
		{
			title: "Published",
			dataIndex: "isPublished",
			key: "isPublished",
			render: (checked: boolean, record: AlertsTypes) => (
				<Switch
					checked={checked}
					onChange={() => onIsPublishedChange(checked, record.id)}
					recordId={record.id}
					allowChange={permissions.updateAlertsType}
				/>
			),
		},
		{
			title: "For Admin Panel",
			dataIndex: "forAdminpanel",
			key: "forAdminpanel",
			render: (checked: boolean, record: AlertsTypes) => (
				<Switch
					checked={checked}
					onChange={onForAdminPanel}
					recordId={record.id}
					allowChange={permissions.updateAlertsType}
				/>
			),
		},
		{
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			render: (text: string, record: AlertsTypes) => (
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
				rowKey={(record: AlertsTypes) => `site-alert-type-${record.id}`}
			/>
		</div>
	);
}
