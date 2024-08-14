import { useState } from "react";
import { message, Popconfirm, Table, Image } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "../../Common/styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { BiometricType } from "@modules/Biometrics/types";
import { convertDate } from "@helpers/dateHandler";
import { capitalize, getEnumKeyByValue, getTableRowNumber } from "@helpers/common";
import { BiometricsPermissionSet } from "@modules/Biometrics/permissions";
import { BiometricModule } from "@modules/Biometrics";
import { APIResponseObject } from "@modules/Common/common.interface";
import { Pagination } from "@atoms/Pagination";
import TokenService from "@services/tokenService";
import { BASE_URL } from "@services/axiosInstance";
import { BiometricsEntryType } from "@helpers/commonEnums";
import componentStyles from "./styles.module.scss"

interface _ActionComponentProps extends ActionComponentProps {
	record: BiometricType,
	permissions: { [key in BiometricsPermissionSet]: boolean };
}

const ActionComponent = (props: _ActionComponentProps) => {
	const {
		record, onEditIconClick, reloadTableData,
		permissions: { deleteBiometrics, updateBiometrics }
	} = props;

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});
	const module = new BiometricModule();

	const handleDelete = () => {
		setActionState({
			...actionState,
			confirmLoading: true,
		});

		if (deleteBiometrics === false) {
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
			{updateBiometrics && <span onClick={() => onEditIconClick(record)}>
				<img src="/images/editicon.svg" alt="" />
			</span>}
			{deleteBiometrics && <Popconfirm
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
			</Popconfirm>}
		</div>
	);
};

export default function TableComponent(props: TableProps & { tableData: BiometricType[], meta: APIResponseObject["meta"], filters: any }) {
	const { tableData, tableLoading, onEditIconClick, reloadTableData, meta, filters } = props;
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in BiometricsPermissionSet]: boolean };
    const access_token = TokenService.getLocalAccessToken();

	const module = new BiometricModule();


	const columns = [
		{
			title: "S.No",
			dataIndex: "index",
			key: "index",
			render: (text: string, record: BiometricType, index: number) => getTableRowNumber(index, meta),
			width: "5%",
		},
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
			render: (text: string, record: BiometricType) => (
				<Typography color="dark-main" size="sm" weight="bold">
					{record?.User?.firstName + " " + record?.User?.lastName}
				</Typography>
			),
		},
		{
			title: "Mode",
			dataIndex: "mode",
			key: "mode",
			render: (text: string, record: BiometricType) => (
				<div className={componentStyles.wrapperEntryTypes}>
					<Typography color="dark-main" size="sm" type="span" lineHeight={1} weight="bold">
						{"Check " + capitalize(record.mode)}
					</Typography>
					{
						(record.type !== Number(BiometricsEntryType.auto)) && 
						<div className="my-auto">
						<span className={componentStyles.entryTypeStyles + " " + ((record.type === Number(BiometricsEntryType.forced)) ?  componentStyles.forceStyle : "")}>({getEnumKeyByValue(BiometricsEntryType, String(record.type))})</span>
					</div>
					}
				</div>
			),
		},
		{
			title: "Time",
			dataIndex: "checkIn",
			key: "checkIn",
			render: (text: string, record: BiometricType) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{convertDate(record.checkIn, "dd M,yy-t")}
					</Typography>
					{ record.type === Number(BiometricsEntryType.manual) && record.AddedBy &&
					<small style={{color: 'var(--color-dark-sub)', fontSize: "0.6rem"}}>
						<span>Added on </span>
						<span>	{ record.addedDate && convertDate(record.addedDate, "dd M,yy")}</span>
						<span> by </span>
						<span className="inline-block">{record.AddedBy?.firstName + " " + record.AddedBy?.lastName+ " "}</span>
					</small>
					}
					{ record.ModifiedBy &&
					<small style={{color: 'var(--color-dark-sub)', fontSize: "0.6rem"}}>
						<span>Modified on </span>
						<span>	{ record.modifiedDate && convertDate(record.modifiedDate, "dd M,yy")}</span>
						<span> by </span>
						<span className="inline-block">{record.ModifiedBy?.firstName + " " + record.ModifiedBy?.lastName+ " "}</span>
					</small>
					}
				</>
			),
		},
		{
			title: "Selfie",
			dataIndex: "selfie",
			key: "selfie",
			render: (selfie: string, record: BiometricType) => (
				<>
					{selfie && <div style={{height: "60px"}}><Image style={{maxHeight: "60px", width: "auto"}} src={`${BASE_URL}resources/all/${selfie}?authKey=${access_token}`} /></div>}
				</>
			),
		},
		{
			title: "Location",
			dataIndex: "location",
			key: "location",
			render: (text: string, record: BiometricType) => (
				<>
					<iframe
						width="300"
						height="100"
						frameBorder="0"
						style={{ border: 0 }} // Corrected the style attribute
						src={`https://www.google.com/maps?q=${record.latitude},${record.longitude}&hl=es;z=14&output=embed`} // Corrected the template literal syntax
						allowFullScreen>
					</iframe>
					{/* <Typography color="dark-main" size="sm" weight="bold">
					{record.latitude + " " + record.longitude}
				   </Typography> */}
				</>
			),
			width: "30%",
		},
		(permissions.updateBiometrics || permissions.deleteBiometrics) ?
			{
				title: "Actions",
				dataIndex: "actions",
				key: "actions",
				render: (text: string, record: BiometricType) => (
					<ActionComponent
						record={record}
						onEditIconClick={onEditIconClick}
						reloadTableData={reloadTableData}
						permissions={permissions}
					/>
				),
			} : {},
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
					rowKey={(record: BiometricType) => `biometric-type-${record.id}`}
				/>
			</div>
			<Pagination
				total={meta?.total!}
				current={meta?.page!}
				defaultPageSize={meta?.perPage || 25}
				pageSizeOptions={[10, 20, 50, 100]}
				onChange={(page, pageSize) => {
					reloadTableData({ ...filters, page: page, perPage: pageSize })
				}}
			/>
		</>
	);
}
