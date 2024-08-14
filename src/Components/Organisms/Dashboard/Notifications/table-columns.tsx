import { Avatar,Table, Tooltip } from "antd";
import { UserOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "../../Common/styles.module.scss";
import { TableProps } from "../../Common/common-types";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { convertDate } from "@helpers/dateHandler";
import { capitalize } from "@helpers/common";
import { BiometricsPermissionSet } from "@modules/Biometrics/permissions";
import { BiometricModule } from "@modules/Biometrics";
import { APIResponseObject } from "@modules/Common/common.interface";
import { NotificationTypes } from "@modules/Notification/types";
import { RESOURCE_BASE_URL } from "@helpers/constants";

export default function TableComponent(props: TableProps & { tableData: NotificationTypes[], meta: APIResponseObject["meta"], filters: any}) {
	const { tableData, tableLoading, onEditIconClick, reloadTableData, meta, filters } = props;
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in BiometricsPermissionSet]: boolean };

	const module = new BiometricModule();


	const columns = [
		{
			title: "S.No",
			dataIndex: "index",
			key: "index",
			render: (text: string, record: NotificationTypes, index: number) => index + 1,
			width: "5%",
		},
		{
			title: "Message",
			dataIndex: "message",
			key: "message",
			render: (text: string) => (
				<Typography color="dark-main" size="sm" weight="bold">
					{text}
				</Typography>
			),
		},
		{
			title: "Added date",
			dataIndex: "addedDate",
			key: "addedDate",
			render: (text: string) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
					{convertDate(text, "dd M,yy")}
					</Typography>
				</>
			),
		},
		{
			title: "Type",
			dataIndex: "type",
			key: "type",
			render: (text: string) => (
				<Typography color="dark-main" size="sm" weight="bold">
					{capitalize(text)}
				</Typography>
			),
		},
		{
			title: "Subscribers",
			dataIndex: "subscribers",
			key: "subscribers",
			render: (text: string, record: NotificationTypes) => (
				record.type === "user" ? <Avatar.Group maxCount={5}>
				 {record?.Subscribers?.map((member) => (
                  <Tooltip
                    key={member?.User?.uuid}
                    title={`${member?.User?.firstName} ${member?.User?.lastName}`}
                  >
                    <Avatar
                      size={25}
                      style={{ border: '0.5px solid var(--color-light-200)' }}
                      src={RESOURCE_BASE_URL + member?.User?.profile}
                      icon={<UserOutlined />}
                    />
                  </Tooltip>
                ))}
			  </Avatar.Group> : (record.type === "department") ? <Typography color="dark-main" size="sm" weight="bold">
					{record?.Department?.title + " Department"}
				</Typography> : <Typography color="dark-main" size="sm" weight="bold">
					All Employees
				</Typography>
			),
		},
	];

	return (
		<div className={styles.antdTableWrapper}>
			<Table
				sticky
				dataSource={tableData}
				columns={columns}
				pagination={{
					current: meta?.page,
					total: meta?.total,
					hideOnSinglePage: true,
					pageSize: meta?.perPage,
					onChange(page, pageSize) {
						reloadTableData({...filters, page: page, perPage: pageSize })
					},
				}}
				scroll={{ x: 991 }}
				loading={tableLoading}
				rowKey={(record: NotificationTypes) => `biometric-type-${record.id}`}
			/>
		</div>
	);
}
