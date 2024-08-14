import { useMemo, useState } from "react";
import {
	Popconfirm,
	Table,
	Image,
	Tooltip,
	message,
	Card,
	Dropdown,
	Space,
	Typography as AntdTypography,
	Progress,
	Divider,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { ManualAction, Typography } from "../../../Atoms";
import { DownOutlined } from "@ant-design/icons";
import styles from "../Common/styles.module.scss";
import componentStyles from "./styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { RESOURCE_BASE_URL } from "../../../../helpers/constants";
import { UserTypes } from "../../../../Modules/User/types";
import { UserModule } from "../../../../Modules/User";
import {
	CalenderIcon,
	FlagIcon,
	MoreIcon,
	PasswordUnlock,
} from "../../../Icons";
import ResetPasswordModal from "./ResetPassword";
import {
	// ManualActionScore,
	// ManualActionScoreColor,
	SuperAdminEmails,
	UserStatus,
} from "../../../../helpers/commonEnums";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { capitalize } from "../../../../helpers/common";
import LoginAsModal from "./LoginAs";
import UserScoreModal from "./user-score";
import { convertDate } from "../../../../helpers/dateHandler";
import { UserPermissionsEnum } from "../../../../Modules/User/permissions";
const { Paragraph } = AntdTypography;

type PermissionType = { [key in UserPermissionsEnum]: boolean };

interface _ActionComponentProps extends ActionComponentProps {
	record: UserTypes;
	onCountryAccessClick: (record: UserTypes) => void;
	onPasswordResetClick: (record: UserTypes) => void;
	onLoginAsClick: (record: UserTypes) => void;
	permissions: PermissionType;
}

const ActionComponent = (props: _ActionComponentProps) => {
	const {
		record,
		onEditIconClick,
		reloadTableData,
		onCountryAccessClick,
		onPasswordResetClick,
		onLoginAsClick,
		permissions: { deleteUser, updateUser, loginAsOtherUser, addUserCountry },
	} = props;

	const { loggedInUserData } = useSelector(
		(state: RootState) => state.usersReducer
	);

	const userData = loggedInUserData?.data as UserTypes

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});

	const [visible, setVisible] = useState(false);

	const module = useMemo(() => new UserModule(), []);

	const handleDelete = () => {
		setActionState({
			...actionState,
			confirmLoading: true,
		});

		if (deleteUser === false) {
			message.error(
				"You don't have permission to delete this user, please contact your admin."
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
			setVisible(false);
			message.success(res.data.message);
		}).catch((err) => {
			setActionState({
				...actionState,
				confirmLoading: false,
			});
			message.error(err.message || "Something went wrong");
		});
	};

	// Handle Manual Action
	const handleManualAction = (data: {
		value: string;
		message: string;
		id: number;
	}) => {
		const { value, message: actionMessage, id } = data;
		const _value = value.replace("_", "");

		const finalData = {
			value: Number(_value),
			message: actionMessage,
		};

		module.manualAction(finalData, id).then((res) => {
			reloadTableData();
			setVisible(false);
			message.success(res.data.message);
		}).catch((err) => {
			message.error(err.message || "Something went wrong");
		});
	};

	const showPopconfirm = () => {
		setActionState({
			...actionState,
			openPopConfirm: true,
		});
	};

	const overlay = (
		<Card className={`${componentStyles.overlay} pa-2`}>
			{addUserCountry === true && (
				<div
					className={`${styles.actions} ${componentStyles.overlay_card_item}`}
					onClick={() => {
						onCountryAccessClick(record)
						setVisible(false);
					}}
				>
					<span>
						<FlagIcon width={18} height={18} color={"#fff"} />
					</span>
					Country Access
				</div>
			)}

			{updateUser === true && (
				<div
					className={`${styles.actions} ${componentStyles.overlay_card_item}`}
					onClick={() => {
						onEditIconClick(record)
						setVisible(false);
					}}
				>
					<span>
						<img src="/images/editicon.svg" alt="" />
					</span>
					Edit
				</div>
			)}

			{updateUser === true && (
				<>
					{!SuperAdminEmails?.includes(record.email) ? (
						<Tooltip title="Reset Password for this user." placement="left">
							<div
								className={`${styles.actions} ${componentStyles.overlay_card_item}`}
								onClick={() => {
									onPasswordResetClick(record)
									setVisible(false);
								}}
							>
								<span>
									<PasswordUnlock color="#fff" width={18} height={18} />
								</span>
								Reset Password
							</div>
						</Tooltip>
					) : (
						<Tooltip
							title="You cannot reset password for super admin."
							placement="left"
						>
							<div
								className={`${styles.actions} ${componentStyles.overlay_card_item}`}
								style={{ cursor: "not-allowed", opacity: "0.6" }}
							>
								<span>
									<PasswordUnlock
										color="#fff"
										width={18}
										height={18}
									/>
								</span>
								Reset Password
							</div>
						</Tooltip>
					)}
				</>
			)}

			{loginAsOtherUser === true && (
				<Tooltip
					title={`Login as ${record?.firstName} ${record?.lastName}`}
					placement="left"
				>
					<div
						className={`${styles.actions} ${componentStyles.overlay_card_item}`}
						onClick={() => {
							onLoginAsClick(record)
							setVisible(false);
						}}
					>
						<span>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								color="#fff"
								width={20}
								height={20}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
								/>
							</svg>
						</span>
						Login as
					</div>
				</Tooltip>
			)}

			<ManualAction
				onConfirm={(data) => {
					handleManualAction({
						value: data.value,
						message: data.message,
						id: record.id,
					})
				}}
			>
				<div className={`${styles.actions} ${componentStyles.overlay_card_item}`}>
					<span>
						<FlagIcon width={18} height={18} color="#fff" />
					</span>
					Manual Action
				</div>
			</ManualAction>

			<Divider className="my-2" />

			{userData?.id === record?.id ? (
				<Tooltip title="You cannot delete yourself.">
					<div
						className={styles.actions}
						style={{ cursor: "not-allowed", opacity: "0.2" }}
					>
						<DeleteOutlined className={styles.bg__red} />
						Delete User
					</div>
				</Tooltip>
			) : (
				<Popconfirm
					open={actionState.openPopConfirm}
					placement="left"
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
					<div
						className={styles.actions}
						style={{ cursor: 'pointer' }}
						onClick={showPopconfirm}
					>
						<DeleteOutlined className={styles.bg__red} />
						Delete User
					</div>
				</Popconfirm>
			)}
		</Card>
	);

	return (
		<Dropdown
			trigger={["click"]}
			dropdownRender={() => overlay}
			open={visible}
			onOpenChange={(visible) => setVisible(visible)}
		>
			<span style={{ cursor: "pointer", padding: '5px' }}>
				<MoreIcon
					height={25} width={25} color="#7e869a"
				/>
			</span>
		</Dropdown>
	);
};

type StatusComponentProps = {
	record: UserTypes;
	status: number;
	reloadTableData: (query?: any) => void;
	permissions: PermissionType;
};

const statusColors: any = {
	1: "#00A884",
	2: "#f50",
};

const StatusComponent = (props: StatusComponentProps) => {
	const {
		record,
		status,
		reloadTableData,
		permissions: { updateUser },
	} = props;
	const [messageApi, contextHolder] = message.useMessage();
	const module = useMemo(() => new UserModule(), []);

	const openMessage = (data: {
		key: string;
		type: "success" | "error" | "info" | "warning" | "loading";
		content: string;
	}) => {
		messageApi.open({
			key: data.key,
			type: data.type,
			content: data.content,
			duration: data.type === "loading" ? 0 : 2,
		});
	};

	// controls the dropdown visibility
	const [visible, setVisible] = useState<boolean>(false);

	// handle dropdown menu visibility change event
	const onVisibleChange = (flag: boolean) => {
		setVisible(flag);
	};

	const onStatusChange = (status: number) => {
		if (record?.id && updateUser === true) {
			openMessage({
				key: "update",
				type: "loading",
				content: "Updating...",
			});

			module.updateRecord({ status: status }, record?.id).then((res) => {
				if (res?.data?.data) {
					openMessage({
						key: "update",
						type: "success",
						content: res?.data?.message,
					});
					setVisible(!visible);

					reloadTableData();
				}
			}).catch((err) => {
				openMessage({
					key: "update",
					type: "error",
					content: err?.response?.data?.message,
				});
			});
		} else {
			openMessage({
				key: "update",
				type: "error",
				content: "You don't have permission to change status",
			});
		}
	};

	const overlay = (
		<Card className={`${componentStyles.overlay} pa-2`}>
			{contextHolder}
			{Object.entries(UserStatus).map(([key, value]) => {
				return (
					<div
						key={`user-status-${key}`}
						className={componentStyles.overlay_item}
						onClick={() => {
							if (status !== Number(value) && updateUser === true) {
								const selectedStatus = Number(value);
								onStatusChange(selectedStatus);
							}
						}}
					>
						<span
							className={status === Number(value) ? componentStyles.disabledButton : ""}
						>
							{capitalize(key)}
						</span>
					</div>
				);
			})}
		</Card>
	);

	return (
		<div>
			<Dropdown
				dropdownRender={() => overlay}
				trigger={updateUser === true ? ["click"] : []}
				open={updateUser === true ? visible : false}
				onOpenChange={onVisibleChange}
				className={componentStyles.dropdown}
			>
				<div>
					<Space
						style={{
							backgroundColor: statusColors[status],
							color: "#fff",
							padding: "0.2rem 0.5rem",
							borderRadius: "0.25rem",
							fontSize: "0.8rem",
							display: "flex",
							width: "100%",
							justifyContent: "space-between",
						}}
					>
						{Object.entries(UserStatus).map(([key, value]) => {
							return value === String(status) && capitalize(key);
						})}

						{updateUser === true && <DownOutlined />}
					</Space>
				</div>
			</Dropdown>
		</div>
	);
};

export default function TableComponent(
	props: TableProps & {
		tableData: UserTypes[];
		onManageRolesClick: (record: UserTypes) => void;
		onCountryAccessClick: (record: UserTypes) => void;
	}
) {
	const {
		tableData,
		tableLoading,
		onEditIconClick,
		reloadTableData,
		onManageRolesClick,
		onCountryAccessClick,
	} = props;
	const { userPermissions } = useSelector(
		(state: RootState) => state.usersReducer
	);
	const permissions = userPermissions as PermissionType;
	const { updateUser, loginAsOtherUser } = permissions;

	//TODO: show manual action in table

	// controls the password reset modal visibility
	const [passwordResetModal, setPasswordResetModal] = useState<{
		isOpen: boolean;
		record?: UserTypes;
	}>({
		isOpen: false,
		record: undefined,
	});

	const onPasswordResetClick = (record: UserTypes) => {
		if (updateUser === true) {
			setPasswordResetModal({
				isOpen: true,
				record: record,
			});
		} else {
			message.error(
				`You don't have permission to reset password for ${record?.firstName} ${record?.lastName}`
			);
			return;
		}
	};

	// controls the login as modal visibility
	const [loginAsModal, setLoginAsModal] = useState<{
		isOpen: boolean;
		record?: UserTypes;
	}>({
		isOpen: false,
		record: undefined,
	});

	const onLoginAsClick = (record: UserTypes) => {
		if (loginAsOtherUser === true) {
			setLoginAsModal({
				isOpen: true,
				record: record,
			});
		} else {
			message.error(
				`You don't have permission to login as ${record?.firstName} ${record?.lastName}`
			);
			return;
		}
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
			title: "ID / UUID",
			dataIndex: "uuid",
			key: "uuid",
			render: (uuid: string, record: UserTypes) => (
				<div>
					<Paragraph
						className="font-size-xs color-dark-sub"
						//copyable={{ text: record.id.toString() }}
						title={record.id.toString()}
					>
						[{record.id}]
					</Paragraph>
					<Paragraph
						title={uuid}
						ellipsis={{
							rows: 1,
							expandable: false,
						}}
						copyable={{ text: uuid }}
						className="font-size-xs color-dark-sub"
					>
						[{uuid}]
					</Paragraph>
				</div>
			),
			width: "120px",
		},
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
			render: (_text: string, record: UserTypes) => {
				//const manualAction = `_${record.manualAction}` as keyof typeof ManualActionScoreColor;
				return (
					<div>
						<div style={{ display: "flex", justifyContent: "space-between" }}>
							<Typography
								color="dark-main"
								size="sm"
								weight="bold"
								className="my-auto mr-1"
							>
								{`${record.firstName} ${record.lastName}`}
							</Typography>

							{/** Manual Action Score Section */}
							{/* {(record.manualAction !== 0) && (
								<Tooltip
									title={
										<div className={styles.manualActionTooltip}>
											<Typography color="light-100" size="sm">
												{`Score: ${ManualActionScore[`${manualAction}`]}`}
											</Typography>
											<Typography color="light-100" size="sm">
												{`Message: ${record.manualActionMessage}`}
											</Typography>
										</div>
									}
									placement="top"
									className="mt-2"
								>
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
										<path
											d="M5.15 22c-.41 0-.75-.34-.75-.75V2.75c0-.41.34-.75.75-.75s.75.34.75.75v18.5c0 .41-.34.75-.75.75Z"
											fill={ManualActionScoreColor[manualAction]}
										></path>
										<path
											opacity=".4"
											d="m18.02 12.33-1.22-1.22a1.39 1.39 0 0 1-.47-1.03c-.02-.45.16-.9.49-1.23l1.2-1.2c1.04-1.04 1.43-2.04 1.1-2.83-.32-.78-1.31-1.21-2.77-1.21H5.15c-.21.01-.38.18-.38.39v12c0 .21.17.38.38.38h11.2c1.44 0 2.41-.44 2.74-1.23.33-.8-.05-1.79-1.07-2.82Z"
											fill={ManualActionScoreColor[manualAction]}
										></path>
									</svg>
								</Tooltip>
							)} */}

							{/** Add Verified Check Mark */}
							{/* {record.emailVerified && (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="#00A884"
								width={22}
								height={22}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						)} */}
						</div>

						<div>
							<Paragraph
								ellipsis={{
									rows: 1,
									expandable: false,
								}}
								className="my-0 color-dark-sub"
							>
								<a href={`mailto:${record.email}`} className="font-size-xs">
									<span className="color-dark-sub">{record.email}</span>
								</a>
							</Paragraph>
						</div>

						<div>
							{record.phone ? (
								<a
									href={`tel:${record.phone}`}
									className="color-dark-sub font-size-xs"
								>
									{record.phone !== null && record.phoneCode !== null
										? "+" + record?.phoneCode + record.phone
										: "N/A"}
								</a>
							) : (
								<Typography color="dark-sub" size="xs">
									N/A
								</Typography>
							)}
						</div>

						{record.addedDate && (
							<div className="d-flex mt-4">
								<CalenderIcon className="mr-2" />
								<Typography color="dark-sub" size="sm">
									{`${convertDate(record.addedDate, "dd MM yy")}`}
								</Typography>
							</div>
						)}

						{/** Organization Name */}
						{record.Organization?.name && (
							<Paragraph
								ellipsis={{
									rows: 1,
									expandable: false,
								}}
								className="my-0 color-dark-sub font-size-sm mt-2"
							>
								Org:{record.Organization?.name}
							</Paragraph>
						)}
					</div>
				)
			}
		},
		{
			title: "Profile",
			dataIndex: "profile",
			key: "profile",
			render: (profile: string, record: UserTypes) => (
				<Image
					width={40} height={40}
					src={`${RESOURCE_BASE_URL}${profile}`}
					preview={false}
					rootClassName="object-fit-cover"
					style={{ borderRadius: "100%" }}
				/>
			),
			width: "200px",
		},
		{
			title: "Profile Score",
			dataIndex: "profileScore",
			key: "profileScore",
			render: (profileScore: number, record: UserTypes) => (
				<UserScoreModal user={record}>
					<div className={componentStyles.profileScoreWrap}>
						<Progress
							type="circle"
							format={() => ""}
							percent={profileScore}
							status="success"
							width={25}
							strokeWidth={12}
						/>

						<Typography color="dark-sub" size="sm">
							{`${profileScore ? `${profileScore}%` : "0%"}`}
						</Typography>
					</div>
				</UserScoreModal>
			)
		},
		{
			title: "Stats",
			dataIndex: "averageReplyTime",
			key: "averageReplyTime",
			render: (averageReplyTime: number, record: UserTypes) => (
				<>
					<Typography color="dark-sub" size="sm">
						{`Avg. Reply Time: ${averageReplyTime}`}
					</Typography>

					{/* <Typography color="dark-sub" size="sm">
						{`Rating: ${record.rating}`}
					</Typography>

					<Typography color="dark-sub" size="sm">
						{`Spam Score: ${record.spamScore}`}
					</Typography> */}
				</>
			),
		},
		{
			title: "Role",
			dataIndex: "role",
			key: "role",
			render: (text: string, record: UserTypes) => (
				<>
					<Paragraph
						ellipsis={{
							rows: 1,
							expandable: false,
						}}
						className="my-0 color-dark-sub"
					>
						<ul
							style={{
								listStyle: "none",
								padding: 0,
							}}
						>
							{record.userRole.map((item) => (
								<li className="font-size-xs ml-0">{item.Role.title}</li>
							))}
						</ul>
					</Paragraph>
					<p
						className="color-dark-main font-weight-bold font-size-sm mb-0 ml-1 cursor-pointer"
						onClick={() => onManageRolesClick(record)}
					>
						Manage Roles
					</p>
				</>
			),
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (status: number, record: UserTypes) => (
				<StatusComponent
					status={status}
					record={record}
					reloadTableData={reloadTableData}
					permissions={permissions}
				/>
			),
			width: "150px",
		},
		{
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			render: (text: string, record: UserTypes) => (
				<ActionComponent
					record={record}
					onEditIconClick={onEditIconClick}
					reloadTableData={reloadTableData}
					onCountryAccessClick={onCountryAccessClick}
					onPasswordResetClick={onPasswordResetClick}
					onLoginAsClick={onLoginAsClick}
					permissions={permissions}
				/>
			),
			className: "text-center",
		},
	];

	return (
		<>
			<div className={styles.antdTableWrapper}>
				<Table
					sticky
					dataSource={tableData}
					columns={columns}
					pagination={false}
					scroll={{ x: 991 }}
					loading={tableLoading}
					rowKey={(record: UserTypes) => `site-user-${record.id}`}
				/>
			</div>

			{passwordResetModal.isOpen && (
				<ResetPasswordModal
					isOpen={passwordResetModal.isOpen}
					handleCancel={() =>
						setPasswordResetModal({ ...passwordResetModal, isOpen: false })
					}
					record={passwordResetModal.record!}
					updateUser={updateUser}
				/>
			)}

			{loginAsModal.isOpen && (
				<LoginAsModal
					isOpen={loginAsModal.isOpen}
					handleCancel={() =>
						setLoginAsModal({ ...loginAsModal, isOpen: false })
					}
					record={loginAsModal.record!}
					loginAsOtherUser={loginAsOtherUser}
				/>
			)}
		</>
	);
}
