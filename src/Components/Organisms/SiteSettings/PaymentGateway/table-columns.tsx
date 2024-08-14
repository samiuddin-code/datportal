import { useMemo, useState } from "react";
import { message, Popconfirm, Table, Typography as AntdTypography } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "../Common/styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { PaymentGatewayTypes } from "../../../../Modules/PaymentGateway/types";
import { Switch } from "../../../Atoms/Switch";
import { PaymentGatewayModule } from "../../../../Modules/PaymentGateway";
import { ViewIcon } from "../../../Icons";
import { convertDate } from "../../../../helpers/dateHandler";
import { PaymentGatewayPermissionsEnum } from "../../../../Modules/PaymentGateway/permissions";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";

const { Paragraph } = AntdTypography;

interface _ActionComponentProps extends ActionComponentProps {
	record: PaymentGatewayTypes,
	permissions: { [key in PaymentGatewayPermissionsEnum]: boolean };
}

const ActionComponent = (props: _ActionComponentProps) => {
	const {
		record, onEditIconClick, reloadTableData,
		permissions: { deletePaymentGateway }
	} = props;

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});
	const module = useMemo(() => new PaymentGatewayModule(), []);

	const handleDelete = () => {
		setActionState({
			...actionState,
			confirmLoading: true,
		});

		if (deletePaymentGateway === false) {
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

export default function TableComponent(props: TableProps & { tableData: PaymentGatewayTypes[] }) {
	const { tableData, tableLoading, onEditIconClick, reloadTableData } = props;
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in PaymentGatewayPermissionsEnum]: boolean };

	const module = new PaymentGatewayModule();

	const onIsPublishedChange = (checked: boolean, recordId: number) => {
		return module.updateRecord({ isPublished: checked }, recordId);
	};

	const onIsTestChange = (checked: boolean, recordId: number) => {
		return module.updateRecord({ test: checked }, recordId);
	};

	const [viewPrivateKey, setViewPrivateKey] = useState<boolean>(false);

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
			render: (title: string, record: PaymentGatewayTypes) => (
				<>
					<Typography color="dark-main" size="normal">
						{title}
					</Typography>

					<Typography color="dark-main" size="xs" className="my-1">
						{`Slug: ${record.slug}`}
					</Typography>

					<Typography color="dark-main" size="xs">
						{`Gateway URL: ${record.gatewayURL}`}
					</Typography>
				</>
			),
		},
		{
			title: "API Keys",
			dataIndex: "gatewayPublicKey",
			key: "gatewayPublicKey",
			render: (gatewayPublicKey: string, record: PaymentGatewayTypes) => (
				<>
					<Typography color="dark-main" size="sm" className="mb-1">
						{`Public: ${gatewayPublicKey}`}
					</Typography>

					{viewPrivateKey ? (
						<div className="d-flex align-center">
							<ViewIcon
								close={true}
								onClick={() => setViewPrivateKey(false)}
								className="mr-2 cursor-pointer"
							/>
							<Paragraph
								ellipsis={{
									rows: 2,
									expandable: false,
								}}
								copyable={{ text: record.gatewayPrivateKey }}
								className="font-size-sm color-dark-main pa-0 ma-0"
							>
								Private: {record.gatewayPrivateKey}
							</Paragraph>
						</div>
					) : (
						<div className="d-flex">
							<ViewIcon
								onClick={() => setViewPrivateKey(true)}
								className="mr-2 cursor-pointer"
							/>
							<Typography color="dark-main" size="sm">
								{`Private: ${record.gatewayPrivateKey.replace(/./g, "*")}`}
							</Typography>
						</div>
					)}
				</>
			),
			width: "15%"
		},
		{
			title: "Store ID",
			dataIndex: "storeId",
			key: "storeId",
			render: (storeId: string) => (
				<Typography color="dark-main" size="sm" >
					{storeId}
				</Typography>
			),
		},
		{
			title: "Date Added",
			dataIndex: "addedDate",
			key: "addedDate",
			render: (addedDate: string) => (
				<Typography color="dark-sub" size="sm">
					{convertDate(addedDate, "dd MM yy")}
				</Typography>
			),
		},
		{
			title: "Test",
			dataIndex: "test",
			key: "test",
			render: (checked: boolean | undefined, record: PaymentGatewayTypes) => (
				<Switch
					checked={checked}
					onChange={onIsTestChange}
					recordId={record.id}
					allowChange={permissions.updatePaymentGateway}
				/>
			),
		},
		{
			title: "Published",
			dataIndex: "isPublished",
			key: "isPublished",
			render: (checked: boolean | undefined, record: PaymentGatewayTypes) => (
				<Switch
					checked={checked}
					onChange={onIsPublishedChange}
					recordId={record.id}
					allowChange={permissions.updatePaymentGateway}
				/>
			),
		},
		{
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			render: (text: string, record: PaymentGatewayTypes) => (
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
				rowKey={(record: PaymentGatewayTypes) => `site-payment-gateway-${record.id}`}
			/>
		</div>
	);
}
