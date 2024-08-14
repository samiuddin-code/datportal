import { Key, useMemo, useState } from "react";
import { Popconfirm, Table, Image, Typography as AntdTypography, message, Card, Dropdown, Space } from "antd";
import { DeleteOutlined, DownOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "../Common/styles.module.scss";
import componentStyles from "./styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { FRONT_END_URL, RESOURCE_BASE_URL } from "../../../../helpers/constants";
import { PagesTypes } from "../../../../Modules/Pages/types";
import { PagesModule } from "../../../../Modules/Pages";
import { convertDate } from "../../../../helpers/dateHandler";
import { PagesStatus } from "../../../../helpers/commonEnums";
import { GIcon } from "../../../Icons";
// import { RootState } from "../../../../Redux/store";
// import { useSelector } from "react-redux";
const { Paragraph } = AntdTypography;

const ActionComponent = (props: { record: PagesTypes, onSeoIconClick: (data: PagesTypes) => void } & ActionComponentProps) => {
	const { record, onEditIconClick, reloadTableData, onSeoIconClick } = props;

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});
	const module = useMemo(() => new PagesModule(), []);

	const handleDelete = () => {
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
			<span onClick={() => onSeoIconClick(record)}>
				<GIcon />
			</span>
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

type StatusDropdownProps = {
	status: number;
	recordId: Key;
	reloadTableData: () => void;
	verifyAndPublishPages: boolean;
	changePagesStatus: boolean;
}

/** Status Dropdown */
const StatusDropdown = (props: StatusDropdownProps) => {
	const {
		status, recordId, reloadTableData,
		changePagesStatus, verifyAndPublishPages
	} = props

	const [messageApi, contextHolder] = message.useMessage();

	const module = useMemo(() => new PagesModule(), []);

	const openMessage = (data: {
		key: string;
		type: "success" | "error" | "info" | "warning" | "loading";
		content: string
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

	const onStatusChange = (_status: number) => {
		if (recordId && changePagesStatus === true) {
			openMessage({
				key: "update",
				type: "loading",
				content: "Updating..."
			});

			module.updateRecordByStatus(Number(recordId), _status).then((res) => {
				if (res?.data?.data) {
					openMessage({
						key: "update",
						type: "success",
						content: res?.data?.message
					});
					setVisible(!visible)

					reloadTableData()
				}
			}).catch((err) => {
				openMessage({
					key: "update",
					type: "error",
					content: err?.response?.data?.message
				});
			});
		} else {
			openMessage({
				key: "update",
				type: "error",
				content: "You don't have permission to change status"
			});
		}
	}

	const onPublishChange = (_status: number) => {
		if (recordId && verifyAndPublishPages === true) {
			openMessage({
				key: "publish",
				type: "loading",
				content: "Publishing..."
			});

			module.verifyAndPublish({ status: _status }, Number(recordId)).then((res) => {
				if (res?.data?.data) {
					openMessage({
						key: "publish",
						type: "success",
						content: res?.data?.message
					});
					setVisible(!visible)

					reloadTableData()
				}
			}).catch((err) => {
				openMessage({
					key: "publish",
					type: "error",
					content: err?.response?.data?.message
				});
			});
		} else {
			openMessage({
				key: "publish",
				type: "error",
				content: "You don't have permission to publish"
			});
		}
	}

	const overlay = (
		<Card className={`${componentStyles.overlay} pa-2`}>
			{contextHolder}
			{Object.entries(PagesStatus).map(([key, value]) => {
				return (
					<div
						key={`pages-status-${key}`}
						className={componentStyles.overlay_item}
						onClick={() => {
							if (changePagesStatus) {
								const selectedStatus = Number(value)
								if (status !== selectedStatus) {
									if (value === PagesStatus["Verified & Published"]) {
										onPublishChange(selectedStatus)
									} else {
										onStatusChange(selectedStatus)
									}
								}
							}
						}}
					>
						<span className={(status === Number(value)) ? componentStyles.disabledButton : ""}>{key}</span>
					</div>
				)
			})}
		</Card>
	)

	return (
		<div>
			<Dropdown
				dropdownRender={() => overlay}
				trigger={changePagesStatus === true ? ["click"] : []}
				open={changePagesStatus === true ? visible : false}
				onOpenChange={onVisibleChange}
				className={componentStyles.dropdown}
			>
				<div>
					<Space>
						{Object.entries(PagesStatus).map(([key, value]) => {
							return value === String(status) && key
						})}

						{changePagesStatus === true && <DownOutlined />}
					</Space>
				</div>
			</Dropdown>
		</div>
	);
}

export default function TableComponent(props: TableProps & { tableData: PagesTypes[], onSeoIconClick: (record: PagesTypes) => void }) {
	const { tableData, tableLoading, onEditIconClick, reloadTableData, onSeoIconClick } = props;
	// const { userPermissions } = useSelector((state: RootState) => state.usersReducer);

	// const {
	// 	createPages, updatePages, deletePages, readPages,
	// 	changePagesStatus, verifyAndPublishPages,
	// 	updatePagesSEO
	// } = userPermissions;

	const columns = [
		{
			title: "S.No",
			dataIndex: "index",
			key: "index",
			render: (text: string, record: {}, index: number) => index + 1,
			width: "5%",
		},
		{
			title: "Page",
			dataIndex: "page",
			key: "page",
			render: (text: string, record: PagesTypes) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{record.localization[0].title}
					</Typography>

					{record?.slug ? (
						<a
							href={`${FRONT_END_URL}/${record.slug}`}
							target={'_blank'}
							rel="noreferrer"
							className="d-flex"
						>
							<Paragraph
								ellipsis={{ rows: 1, expandable: false, }}
								title={record.localization[0].title}
								className="font-size-xs color-light-800 mt-1"
							>
								{record.slug}
							</Paragraph>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								height={"15px"}
								width={"15px"}
								className='mt-1 ml-1'
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
								/>
							</svg>
						</a>
					) : (
						""
					)}
				</>
			),
		},
		{
			title: "Country",
			dataIndex: "country",
			key: "country",
			render: (country: string, record: PagesTypes) => (
				<Typography color="dark-sub" size="sm">
					{record.country.name}
				</Typography>
			),
		},
		{
			title: "Image",
			dataIndex: "image",
			key: "image",
			render: (image: string, record: PagesTypes) =>
				image ? (
					<Image
						width={50}
						height={50}
						src={`${RESOURCE_BASE_URL}${image}`}
						alt={record.imageAlt}
						preview={false}
						rootClassName="object-fit-contain"
					/>
				) : (
					<></>
				),
		},
		{
			title: "Date",
			dataIndex: "date",
			key: "date",
			render: (date: string, record: PagesTypes) => (
				<>
					<Typography color="dark-sub" size="sm">
						{`Added: ${convertDate(record.addedDate, 'MM dd yy')}`}
					</Typography>
					<Typography color="dark-sub" size="sm">
						{`Modified: ${record.modifiedDate ? convertDate(record?.modifiedDate, 'MM dd yy') : 'Not Modified'}`}
					</Typography>
				</>
			)
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (status: number, record: PagesTypes) => (
				<StatusDropdown
					recordId={record.id}
					status={status}
					reloadTableData={reloadTableData}
					verifyAndPublishPages={false}
					changePagesStatus={false}
				/>
			),
		},
		{
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			render: (text: string, record: PagesTypes) => (
				<ActionComponent
					record={record}
					onEditIconClick={onEditIconClick}
					reloadTableData={reloadTableData}
					onSeoIconClick={onSeoIconClick}
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
				rowKey={(record: PagesTypes) => `site-pages-${record.id}`}
			/>
		</div>
	);
}
