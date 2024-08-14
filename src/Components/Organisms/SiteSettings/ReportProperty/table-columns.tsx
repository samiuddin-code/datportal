import { useMemo, useState } from "react";
import { message, Popconfirm, Table } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "../Common/styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { PropertyReportPermissionsEnum } from "../../../../Modules/PropertyReport/permissions";
import { PropertyReportTypes } from "../../../../Modules/PropertyReport/types";
import { PropertyReportModule } from "../../../../Modules/PropertyReport";
import { CalenderIcon } from "../../../Icons";
import { convertDate } from "../../../../helpers/dateHandler";
// import { PropertyReportsModificationStatus, PropertyReportsStatus } from "../../../../helpers/commonEnums";
import { CustomButton, CustomInput } from "../../../Atoms";

interface _ActionComponentProps extends ActionComponentProps {
	record: PropertyReportTypes;
	permissions: { [key in PropertyReportPermissionsEnum]: boolean };
}

const ActionComponent = (props: _ActionComponentProps) => {
	const {
		record,
		onEditIconClick,
		reloadTableData,
		permissions: { deleteReportProperty },
	} = props;

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});
	const module = useMemo(() => new PropertyReportModule(), []);

	const handleDelete = () => {
		setActionState({
			...actionState,
			confirmLoading: true,
		});

		if (deleteReportProperty === false) {
			message.error(
				"You don't have permission to delete this record, please contact your admin."
			);
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
				onCancel={() =>
					setActionState({ ...actionState, openPopConfirm: false })
				}
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

export default function TableComponent(
	props: TableProps & { tableData: PropertyReportTypes[] }
) {
	const { tableData, tableLoading, onEditIconClick, reloadTableData } = props;
	const { userPermissions } = useSelector(
		(state: RootState) => state.usersReducer
	);
	const permissions = userPermissions as {
		[key in PropertyReportPermissionsEnum]: boolean;
	};

	const { updateReportProperty } = permissions;

	const module = useMemo(() => new PropertyReportModule(), []);

	const [reason, setReason] = useState<{
		accept: string;
		reject: string;
	}>({
		accept: "",
		reject: "",
	});

	const onApproveOrReject = (id: number, action: "accept" | "reject") => {
		if (updateReportProperty === true) {
			if (reason.accept === "" && action === "accept") {
				message.error("Please enter reason for accepting");
				return;
			}

			if (reason.reject === "" && action === "reject") {
				message.error("Please enter reason for rejecting");
				return;
			}

			const data = {
				reason: reason[action],
				status: action === "accept" ? 1 : 2,
			};

			module.approveOrRejectModification(id, data).then((res) => {
				const successMessage = action === "accept" ? "Accepted" : "Rejected";
				message.success(successMessage);
				// reset reason state
				setReason({
					accept: "",
					reject: "",
				});
				reloadTableData();
			}).catch((err) => {
				const errorMessage = err?.response?.data?.message;
				message.error(errorMessage || "Something went wrong");
			});
		} else {
			message.error(`You don't have permission to ${action} this record, please contact your admin.`);
		}
	};

	const columns = [
		{
			title: "S.No",
			dataIndex: "index",
			key: "index",
			render: (_text: string, _record: {}, index: number) => index + 1,
			width: "6%",
		},
		{
			title: "Reason",
			dataIndex: "reason",
			key: "reason",
			render: (reason: string, record: PropertyReportTypes) => (
				<>
					<Typography color="dark-main" size="sm">
						{reason}
					</Typography>
					{record.addedDate && (
						<div className="d-flex mt-1">
							<CalenderIcon className="mr-2" />
							<Typography color="dark-sub" size="sm">
								{`Added: ${convertDate(record.addedDate, "dd MM yy")}` || "N/A"}
							</Typography>
						</div>
					)}
					{record.modifiedDate && (
						<div className="d-flex mt-1">
							<CalenderIcon className="mr-2" />
							<Typography color="dark-sub" size="sm">
								{`Updated: ${convertDate(record.modifiedDate, "dd MM yy")}` ||
									"N/A"}
							</Typography>
						</div>
					)}
				</>
			),
		},
		{
			title: "Property",
			dataIndex: "property",
			key: "property",
			render: (property: PropertyReportTypes["property"]) => (
				<>
					<Typography color="dark-main" size="sm">
						{`Name: ${property?.localization?.[0]?.title}`}
					</Typography>

					<Typography color="dark-sub" size="sm">
						{`ID: ${property?.id}`}
					</Typography>
				</>
			),
		},
		{
			title: "Comments",
			dataIndex: "comments",
			key: "comments",
			render: (comments: string) => (
				<Typography color="dark-main" size="sm">
					{comments}
				</Typography>
			),
		},
		{
			title: "User / Organization",
			dataIndex: "user",
			key: "user",
			render: (user: PropertyReportTypes['user'], record: PropertyReportTypes) => {
				const { agency } = record.property || {};
				return (
					<>
						{user && (
							<Typography color="dark-main" size="sm">
								{`Name: ${user?.firstName} ${user?.lastName}`}
							</Typography>
						)}
						{record.userType && (
							<Typography color="dark-main" size="sm">
								{`Type: ${record.userType}`}
							</Typography>
						)}
						{agency && (
							<Typography color="dark-main" size="sm">
								{`Org Name: ${agency.name}`}
							</Typography>
						)}

						{record.userId && (
							<Typography color="dark-sub" size="sm">
								{`User ID: ${record.userId}`}
							</Typography>
						)}
						{agency?.id && (
							<Typography color="dark-sub" size="sm">
								{`Org ID: ${agency?.id}`}
							</Typography>
						)}
					</>
				);
			},
		},
		// {
		// 	title: "Status",
		// 	dataIndex: "status",
		// 	key: "status",
		// 	render: (status: number) => (
		// 		<Typography color="dark-main" size="sm">
		// 			{PropertyReportsStatus[status]}
		// 		</Typography>
		// 	),
		// },
		{
			title: "Modification Request",
			dataIndex: "requestModificationReason",
			key: "requestModificationReason",
			render: (
				requestModificationReason: string,
				record: PropertyReportTypes
			) => (
				<>
					{record.requestedForModification === true && (
						<>
							<Typography color="dark-main" size="sm">
								{`Reason: ${requestModificationReason || "N/A"}`}
							</Typography>
							<Typography color="dark-sub" size="sm">
								{`Requested By: ${(`${record?.modificationRequestedBy?.firstName} ${record?.modificationRequestedBy?.lastName}`) || "N/A"}`}
							</Typography>
							<Typography color="dark-sub" size="sm">
								{`Modified Date: ${convertDate(record.modifiedDate, "dd MM yy") || "N/A"} `}
							</Typography>

							<div className="d-flex mt-1">
								<Popconfirm
									title={
										<div>
											<p>Do you have any reason?</p>
											<CustomInput
												type="textArea"
												onChange={(e: any) =>
													setReason({
														...reason,
														accept: e.target.value,
													})
												}
											/>
										</div>
									}
									okText="Save"
									cancelText="Cancel"
									placement="left"
									onConfirm={() => onApproveOrReject(record.id, "accept")}
								>
									<CustomButton size="xs" className="mr-2" type="success">
										Accept
									</CustomButton>
								</Popconfirm>
								<Popconfirm
									title={
										<div>
											<p>Do you have any reason?</p>
											<CustomInput
												type="textArea"
												onChange={(e: any) => {
													setReason({
														...reason,
														reject: e.target.value,
													});
												}}
											/>
										</div>
									}
									okText="Save"
									cancelText="Cancel"
									placement="left"
									onConfirm={() => onApproveOrReject(record.id, "reject")}
								>
									<CustomButton size="xs" type="danger">
										Decline
									</CustomButton>
								</Popconfirm>
							</div>
						</>
					)}

					{/* {record.modificationRequestStatus > 0 && (
						<Typography color="dark-sub" size="sm">
							{`Status: ${PropertyReportsModificationStatus[record.modificationRequestStatus]}`}
						</Typography>
					)} */}
				</>
			),
			width: "170px",
		},
		{
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			render: (_actions: string, record: PropertyReportTypes) => (
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
				rowKey={(record: PropertyReportTypes) => `report-property-${record.id}`}
			/>
		</div>
	);
}
