import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { message, Popconfirm, Table } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "../Common/styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { LocationType } from "../../../../Modules/Location/types";
import { Switch } from "../../../Atoms/Switch";
import { LocationModule } from "../../../../Modules/Location";
import { convertDate } from "../../../../helpers/dateHandler";
import { LocationPermissionsEnum } from "../../../../Modules/Location/permissions";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";

interface _ActionComponentProps extends ActionComponentProps {
	record: LocationType,
	permissions: { [key in LocationPermissionsEnum]: boolean };
}

const ActionComponent = (props: _ActionComponentProps) => {
	const {
		record, onEditIconClick, reloadTableData,
		permissions: { deleteLocation }
	} = props;

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});
	const module = useMemo(() => new LocationModule(), []);

	const handleDelete = () => {
		setActionState({
			...actionState,
			confirmLoading: true,
		});

		if (deleteLocation === false) {
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

export default function TableComponent(props: TableProps & { tableData: LocationType[] }) {
	const { tableData, tableLoading, onEditIconClick, reloadTableData } = props;
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in LocationPermissionsEnum]: boolean };

	const module = new LocationModule();

	const onIsPublishedChange = (checked: boolean, recordId: number) => {
		return module.updateRecord({ isPublished: checked }, recordId);
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
			title: "Country",
			dataIndex: "country",
			key: "country",
			// TODO: where should Country URL be displayed?
			render: (text: string, record: LocationType) => (
				<Typography color="dark-main" size="sm" weight="bold">
					{record.country?.name}
				</Typography>
			),
		},
		{
			title: "City",
			dataIndex: "city",
			key: "city",
			render: (city: string, record: LocationType) => (
				<>
					{record.localization.map((item, index: number) => (
						<div key={index}>
							<Typography color="dark-main" size="sm" weight="bold">
								{item.name}
							</Typography>

							<p className={"color-light-800 font-size-sm"}>{item.language}</p>
						</div>
					))}
				</>
			),
		},
		{
			title: "Slug",
			dataIndex: "slug",
			key: "slug",
			render: (text: string, record: LocationType) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{record.slug}
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
			title: "Coordinates",
			dataIndex: "coordinates",
			key: "coordinates",
			render: (text: string, record: LocationType) => (
				<div>
					{record.latitude && record.longitude && (
						<>
							<p className={"color-dark-sub font-size-sm mb-0"}>Latitude: {record.latitude}</p>
							<p className={"color-dark-sub font-size-sm"}>Longitude: {record.longitude}</p>
						</>
					)}
				</div>
			),
		},
		{
			title: "Published",
			dataIndex: "isPublished",
			key: "isPublished",
			render: (checked: boolean | undefined, record: LocationType) => (
				<Switch
					checked={checked}
					onChange={onIsPublishedChange}
					recordId={record.id}
					allowChange={permissions.updateLocation}
				/>
			),
		},
		{
			title: "Date Added",
			dataIndex: "addedDate",
			key: "addedDate",
			render: (addedDate: string) => (
				<Typography color="dark-main" size="sm" weight="bold">
					{convertDate(addedDate, "dd M,yy")}
				</Typography>
			),
		},
		{
			title: "Reviews Count / Reviews Score",
			dataIndex: "reviewsCount",
			key: "reviewsCount",
			render: (reviewsCount: number, record: LocationType) => (
				<div>
					<p className={"color-dark-sub font-size-sm mb-0"}>Reviews Count: {reviewsCount}</p>
					<p className={"color-dark-sub font-size-sm"}>Reviews Score: {record.reviewScore}</p>
				</div>
			),
		},
		{
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			render: (text: string, record: LocationType) => (
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
				rowKey={(record: LocationType) => `site-location-${record.id}`}
			/>
		</div>
	);
}
