import { useMemo, useState } from "react";
import { Popconfirm, Table, Image, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "../Common/styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { RESOURCE_BASE_URL } from "../../../../helpers/constants";
import { Amenity } from "../../../../Modules/Amenity/types";
import { Switch } from "../../../Atoms/Switch";
import { AmenityModule } from "../../../../Modules/Amenity";
import { AmenityPermissionsEnum } from "../../../../Modules/Amenity/permissions";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";

interface _ActionComponentProps extends ActionComponentProps {
	record: Amenity;
	permissions: { [key in AmenityPermissionsEnum]: boolean };
}

const ActionComponent = (props: _ActionComponentProps) => {
	const { record, onEditIconClick, reloadTableData,
		permissions: {
			deleteAmenity,
		},
	} = props;

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});
	const module = useMemo(() => new AmenityModule(), []);

	const handleDelete = () => {
		setActionState({
			...actionState,
			confirmLoading: true,
		});

		if (deleteAmenity === false) {
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

export default function TableComponent(props: TableProps & { tableData: Amenity[] }) {
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in AmenityPermissionsEnum]: boolean };

	const { tableData, tableLoading, onEditIconClick, reloadTableData } = props;
	const module = new AmenityModule();

	const onIsPublishedChange = async (checked: boolean, recordId: number) => {
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
			title: "Title",
			dataIndex: "description",
			key: "description",
			render: (text: string, record: Amenity) => (
				<>
					{record.localization.map((item, index: number) => (
						<div key={index}>
							<Typography color="dark-main" size="sm">
								{item.title}
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
			render: (text: string, record: Amenity) => (
				<>
					<Typography color="dark-main" size="sm">
						{record.slug}
					</Typography>
				</>
			),
		},
		{
			title: "Published",
			dataIndex: "isPublished",
			key: "isPublished",
			render: (checked: boolean, record: Amenity) => (
				<Switch
					checked={checked}
					onChange={() => onIsPublishedChange(checked, record.id)}
					recordId={record.id}
					allowChange={permissions.updateAmenity}
				/>
			),
		},
		{
			title: "Icon",
			dataIndex: "icon",
			key: "icon",
			render: (text: string) =>
				text ? (
					<Image
						width={20}
						height={20}
						src={`${RESOURCE_BASE_URL}${text}`}
						preview={false}
						rootClassName="object-fit-contain"
					/>
				) : (
					<></>
				),
		},
		{
			title: "Abreviation",
			dataIndex: "abbreviation",
			key: "abbreviation",
			render: (abbreviation: string) => (
				<Typography color="dark-main" size="sm">
					{abbreviation}
				</Typography>
			),
		},
		{
			title: "Acronyms",
			dataIndex: "acronyms",
			key: "acronyms",
			render: (acronyms: string) => (
				<Typography color="dark-main" size="sm">
					{acronyms}
				</Typography>
			),
		},
		{
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			render: (text: string, record: Amenity) => (
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
				rowKey={(record: Amenity) => `site-amenity-${record.id}`}
			/>
		</div>
	);
}
