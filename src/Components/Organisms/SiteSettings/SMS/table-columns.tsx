import { useMemo, useState } from "react";
import { message, Popconfirm, Table, Typography as AntdTypography } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "../Common/styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { SMSModule } from "../../../../Modules/SMS";
import { SMSTypes } from "../../../../Modules/SMS/types";
import { Switch } from "../../../Atoms/Switch";
import { CalenderIcon, ViewIcon } from "../../../Icons";
import { convertDate } from "../../../../helpers/dateHandler";
import { SMSPermissionsEnum } from "../../../../Modules/SMS/permissions";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
const { Paragraph } = AntdTypography;

interface _ActionComponentProps extends ActionComponentProps {
	record: SMSTypes,
	permissions: { [key in SMSPermissionsEnum]: boolean };
}
const ActionComponent = (props: _ActionComponentProps) => {
	const {
		record, onEditIconClick, reloadTableData,
		permissions: { deleteSMS }
	} = props;

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});
	const module = useMemo(() => new SMSModule(), []);

	const handleDelete = () => {
		setActionState({
			...actionState,
			confirmLoading: true,
		});

		if (deleteSMS === false) {
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

			message.error(err?.response?.data?.message);
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

export default function TableComponent(props: TableProps & { tableData: SMSTypes[] }) {
	const { tableData, tableLoading, onEditIconClick, reloadTableData } = props;
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in SMSPermissionsEnum]: boolean };
	const module = new SMSModule();

	const onIsDefaultChange = async (checked: boolean, recordId: number) => {
		let res = await module.makeDefault(recordId);
		if (res && res?.data?.data) {
			reloadTableData()
		}
		return res;
	};

	const onIsPublishedChange = (checked: boolean, recordId: number) => {
		return module.updateRecord({ isPublished: checked }, recordId);
	};

	const onIsTestChange = (checked: boolean, recordId: number) => {
		return module.updateRecord({ test: checked }, recordId);
	};

	const [viewPassword, setViewPassword] = useState<{ [id: number]: boolean; }>({});

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
			render: (title: string, record: SMSTypes) => (
				<>
					<Typography color="dark-main" size="normal">
						{title}
					</Typography>

					<Typography color="dark-main" size="xs" className="my-1">
						{`Slug: ${record.slug}`}
					</Typography>

					<Typography color="dark-main" size="xs">
						{`Gateway: ${record.gateway}`}
					</Typography>

					<div className="d-flex mt-1">
						<CalenderIcon className="mr-2" />
						<Typography color="dark-sub" size="sm">
							{`${convertDate(record.addedDate, "dd MM yy")}`}
						</Typography>
					</div>
				</>
			),
			width: "20%"
		},
		{
			title: "Sender ID",
			dataIndex: "senderId",
			key: "senderId",
			render: (senderId: string, record: SMSTypes) => (
				<Typography color="dark-main" size="sm">
					{`${senderId} (${record.senderIdType})`}
				</Typography>
			),
		},
		{
			title: "App",
			dataIndex: "appId",
			key: "appId",
			render: (appId: string, record: SMSTypes) => (
				<>
					<Typography color="dark-main" size="sm" className="mb-1">
						{`ID: ${appId}`}
					</Typography>

					{viewPassword[record.id] ? (
						<div className="d-flex align-center">
							<ViewIcon
								close={true}
								onClick={() => setViewPassword({
									...viewPassword,
									[record.id]: false,
								})}
								className="mr-2 cursor-pointer"
							/>
							<Paragraph
								ellipsis={{
									rows: 2,
									expandable: false,
								}}
								copyable={{ text: record.appPassword }}
								className="font-size-sm color-dark-main pa-0 ma-0"
							>
								Password: {record.appPassword}
							</Paragraph>
						</div>
					) : (
						<div className="d-flex align-center">
							<ViewIcon
								onClick={() => setViewPassword({
									...viewPassword as any,
									[record.id]: true,
								})}
								className="mr-2 cursor-pointer"
							/>
							<Paragraph
								ellipsis={{
									rows: 2,
									expandable: false,
								}}
								className="font-size-sm color-dark-main pa-0 ma-0"
							>
								{`Password: ${record.appPassword.replace(/./g, "*")}`}
							</Paragraph>
						</div>
					)}
				</>
			),
			width: "15%"
		},
		{
			title: "Default",
			dataIndex: "isDefault",
			key: "isDefault",
			render: (checked: boolean | undefined, record: SMSTypes) => (
				<Switch
					checked={checked}
					onChange={onIsDefaultChange}
					recordId={record.id}
					allowChange={permissions.makeDefault}
				/>
			),
		},
		{
			title: "Test",
			dataIndex: "test",
			key: "test",
			render: (checked: boolean | undefined, record: SMSTypes) => (
				<Switch
					checked={checked}
					onChange={onIsTestChange}
					recordId={record.id}
					allowChange={permissions.updateSMS}
				/>
			),
		},
		{
			title: "Published",
			dataIndex: "isPublished",
			key: "isPublished",
			render: (checked: boolean | undefined, record: SMSTypes) => (
				<Switch
					checked={checked}
					onChange={onIsPublishedChange}
					recordId={record.id}
					allowChange={permissions.updateSMS}
				/>
			),
		},
		{
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			render: (text: string, record: SMSTypes) => (
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
				rowKey={(record: SMSTypes) => `site-SMS-${record.id}`}
			/>
		</div>
	);
}
