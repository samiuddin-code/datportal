import { useEffect, useMemo, useState } from "react";
import { Popconfirm, Table, Input, Spin, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "../../Common/styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { BiometricsBulkUploadJobModule } from "../../../../Modules/BulkUploadFormat/Job";
import { BiometricsJobStatus, BulkUploadJobTypes } from "../../../../Modules/BulkUploadFormat/Job/types";
import { convertDate } from "../../../../helpers/dateHandler";
import { RESOURCE_BASE_URL } from "../../../../helpers/constants";
import { CustomButton } from "../../../Atoms";
import { BulkUploadJobPermissionsEnum } from "../../../../Modules/BulkUploadFormat/Job/permissions";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { BASE_URL } from "@services/axiosInstance";
import TokenService from "@services/tokenService";

const { TextArea } = Input;

interface _ActionComponentProps extends ActionComponentProps {
	record: BulkUploadJobTypes,
	permissions: { [key in BulkUploadJobPermissionsEnum]: boolean };
}

const ActionComponent = (props: _ActionComponentProps) => {
	const {
		record, onEditIconClick, reloadTableData,
		permissions: { deleteBiometricsJob }
	} = props;

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});
	const module = useMemo(() => new BiometricsBulkUploadJobModule(), []);

	const handleDelete = () => {
		setActionState({
			...actionState,
			confirmLoading: true,
		});

		if (deleteBiometricsJob === false) {
			message.error("You don't have permission to delete this record, please contact your admin.");
			setActionState({
				...actionState,
				openPopConfirm: false,
			});
			return;
		}

		module.deleteRecord(record.id).then((_res) => {
			setActionState({
				...actionState,
				openPopConfirm: false,
				confirmLoading: false,
			});
			reloadTableData();
		}).catch((_err) => {
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

const Status = (props: {
	record: BulkUploadJobTypes,
	reloadTableData: () => void,
}) => {
	const { record, reloadTableData } = props;

	const [isProcessing, setIsProcessing] = useState<boolean>(false)

	const module = useMemo(() => new BiometricsBulkUploadJobModule(), []);

	useEffect(() => {
		if (record.status === BiometricsJobStatus.processing && !isProcessing) {
			setIsProcessing(true)
		}
	}, [record.status])

	const onProccessNowClick = () => {
		setIsProcessing(true)
		module.getProcessById(record.id).then((_res) => {
			message.success("Processing started");
			reloadTableData();
		}).catch((err) => {
			console.error(err?.response?.data?.message);
		});
	}

	const onStopProccessClick = () => {
		module.stopProcess(record.id).then((_res) => {
			message.success("Job stopped");
			reloadTableData();
		}).catch((err) => {
			console.error(err?.response?.data?.message);
		});
	}

	const showStatus = () => {
		if (record.status === BiometricsJobStatus.completed) {
			return (
				<Typography color="dark-sub" size="sm">
					Processed
				</Typography>
			);
		} else {
			if (isProcessing) {
				return (
					<div className="text-center">
						<Spin />
						<Typography color="dark-sub" size="sm">
						Processing in background, you can close the tab
						</Typography>

						<CustomButton
						onClick={onStopProccessClick}
						size="xs" type="outlined"
						style={{margin: "auto"}}
					>
						Stop
					</CustomButton>
					</div>
				);
			} else {
				return (
					<CustomButton
						onClick={onProccessNowClick}
						size="xs" type="outlined"
					>
						Process Now
					</CustomButton>
				);
			}
		}
	};

	return showStatus();
};

export default function TableComponent(props: TableProps & { tableData: BulkUploadJobTypes[] }) {
	const { tableData, tableLoading, onEditIconClick, reloadTableData } = props;
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in BulkUploadJobPermissionsEnum]: boolean };
	const access_token = TokenService.getLocalAccessToken();
	
	const columns = [
		{
			title: "S.No",
			dataIndex: "index",
			key: "index",
			render: (_text: string, _record: {}, index: number) => index + 1,
			width: "5%",
		},
		{
			title: "Title",
			dataIndex: "title",
			key: "title",
			render: (title: string, record: BulkUploadJobTypes) => (
				<>
					<Typography color="dark-sub" size="sm">
						{title}
					</Typography>
					<Typography color="dark-sub" size="xs">
						{`ID: ${record.id}`}
					</Typography>
					<a
						href={`${BASE_URL}resources/all/${record.file}?authKey=${access_token}`}
						target={"_blank"}
						rel="noreferrer"
					>
						Preview
					</a>
				</>
			),
		},
		{
			title: "Failed Report",
			dataIndex: "failedReport",
			key: "failedReport",
			render: (_failedReport: string, record: BulkUploadJobTypes) => (
				<TextArea
					rows={4}
					value={JSON.stringify(record.failedReport, null, 2)}
				/>
			),
			width: "300px"
		},
		{
			title: "Status",
			dataIndex: "processed",
			key: "processed",
			render: (_processed: boolean, record: BulkUploadJobTypes) => (
				<>
					<Status record={record} reloadTableData={reloadTableData} />
				</>
			),
			className: "text-center",
		},
		{
			title: "Date",
			dataIndex: "addedDate",
			key: "addedDate",
			render: (addedDate: string, record: BulkUploadJobTypes) => (
				<>
					<Typography color="dark-sub" size="sm">
						{`Added: ${convertDate(addedDate, "dd M,yy")}`}
					</Typography>
					<Typography color="dark-sub" size="sm">
						{`Processed: ${convertDate(record.processeStartDate, "dd M,yy")}`}
					</Typography>
				</>
			),
		},
		{
			title: "Others",
			dataIndex: "others",
			key: "others",
			render: (_others: string, record: BulkUploadJobTypes) => (
				<>
					<Typography color="dark-sub" size="sm">
						{`Success: ${record.success}`}
					</Typography>

					<Typography color="dark-sub" size="sm">
						{`Failed: ${record.failed}`}
					</Typography>

					<Typography color="dark-sub" size="sm">
						{`Total records: ${record.totalRecords}`}
					</Typography>
				</>
			),
		},
		{
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			render: (_text: string, record: BulkUploadJobTypes) => (
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
				rowKey={(record: BulkUploadJobTypes) => `site-prop-bulk-upload-${record.id}`}
			/>
		</div>
	);
}
