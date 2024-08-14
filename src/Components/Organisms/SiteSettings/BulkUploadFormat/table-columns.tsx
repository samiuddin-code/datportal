import { useMemo, useState } from "react";
import { Popconfirm, Table, Input, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "../Common/styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { BulkUploadFormatModule } from "../../../../Modules/BulkUploadFormat/Format";
import { BulkUploadFormatTypes } from "../../../../Modules/BulkUploadFormat/Format/types";
import { convertDate } from "../../../../helpers/dateHandler";
import { BulkUploadFormatPermissionsEnum } from "../../../../Modules/BulkUploadFormat/Format/permissions";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";

const { TextArea } = Input;

interface _ActionComponentProps extends ActionComponentProps {
	record: BulkUploadFormatTypes,
	permissions: { [key in BulkUploadFormatPermissionsEnum]: boolean };
}

const ActionComponent = (props: _ActionComponentProps) => {
	const {
		record, onEditIconClick, reloadTableData,
		permissions: { deleteBulkUploadFormat }
	} = props;

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});
	const module = useMemo(() => new BulkUploadFormatModule(), []);

	const handleDelete = () => {
		setActionState({
			...actionState,
			confirmLoading: true,
		});

		if (deleteBulkUploadFormat === false) {
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

export default function TableComponent(props: TableProps & { tableData: BulkUploadFormatTypes[] }) {
	const { tableData, tableLoading, onEditIconClick, reloadTableData } = props;
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in BulkUploadFormatPermissionsEnum]: boolean };

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
			render: (title: string, record: BulkUploadFormatTypes) => (
				<>
					<Typography color="dark-sub" size="sm">
						{title}
					</Typography>
					<Typography color="dark-sub" size="xs">
						{`ID: ${record.id}`}
					</Typography>
				</>
			),
		},
		{
			title: "Comments",
			dataIndex: "comment",
			key: "comment",
			render: (comment: string) => (
				<Typography color="dark-sub" size="sm">
					{comment}
				</Typography>
			),
		},
		{
			title: "Format",
			dataIndex: "format",
			key: "format",
			render: (format: string, record: BulkUploadFormatTypes) => (
				<TextArea
					rows={4}
					value={JSON.stringify(record.format, null, 2)}
				/>
			),
		},
		{
			title: "Sample",
			dataIndex: "sample",
			key: "sample",
			render: (sample: string, record: BulkUploadFormatTypes) => (
				<TextArea
					rows={4}
					value={JSON.stringify(record.sample, null, 2)}
				/>
			),
		},
		{
			title: "Date Added",
			dataIndex: "addedDate",
			key: "addedDate",
			render: (addedDate: string) => (
				<Typography color="dark-sub" size="sm">
					{convertDate(addedDate, "dd M,yy")}
				</Typography>
			),
		},
		{
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			render: (text: string, record: BulkUploadFormatTypes) => (
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
				rowKey={(record: BulkUploadFormatTypes) => `site-prop-bulk-upload-${record.id}`}
			/>
		</div>
	);
}
