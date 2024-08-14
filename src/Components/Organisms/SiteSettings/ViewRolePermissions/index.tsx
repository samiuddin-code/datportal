import { useEffect, useState, useMemo, useCallback } from "react";
import { createSearchParams, useSearchParams } from "react-router-dom";
import styles from "./styles.module.scss";
import { PageHeader } from "../../../Atoms";
import { Empty, message } from "antd";
import { Select } from "antd";
import { RolesModule } from "../../../../Modules/Roles";
import { SystemModulesModule } from "../../../../Modules/SystemModules";
import Skeletons from "../../Skeletons";
import { SystemModulesType } from "../../../../Modules/SystemModules/types";
import { PermissionsModule } from "../../../../Modules/Permissions";
import TableComponent from "./table-columns";
import { RoleTypes } from "../../../../Modules/Roles/types";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";


const breadCrumbsData = [
	{
		text: "Home",
		isLink: true,
		path: "/",
	},
	{
		isLink: true,
		text: "Roles",
		path: "/siteSettings/roles",
	},

	{
		isLink: false,
		text: "Role Permissions",
	},
];

const AgentRolePermissions = () => {
	const [moduleId, setModuleId] = useState(0);
	const [permission, setPermission] = useState<{ data?: SystemModulesType; loading: boolean }>({
		loading: false,
	});

	const [searchParams, setSearchParams] = useSearchParams()

	const roleId = searchParams.get('roleId')
	const __moduleId = searchParams.get('moduleId');

	// update the query params to reflect the selected role
	const updateURL = (roleId: number) => {
		setSearchParams(createSearchParams({ roleId: String(roleId) }));
	}

	const rolesModule = useMemo(() => new RolesModule(), []);
	const systemModule = useMemo(() => new SystemModulesModule(), []);
	const permissionsModule = useMemo(() => new PermissionsModule(), []);

	const [systemModulesData, setSystemModulesData] = useState({
		data: [],
		loading: false
	});
	const [roles, setRoles] = useState<{
		data: any[];
		loading: boolean;
		selectedId: number;
	}>({
		data: [],
		loading: false,
		selectedId: 0,
	});
	const [privilegesData, setPrivilegesData] = useState<string[]>([]);
	const [selectedRoleData, setSelectedRoleData] = useState<RoleTypes>();

	const getSystemModules = useCallback(() => {
		systemModule.getAllRecords().then((res) => {
			if (res.data && res.data?.data) {
				setSystemModulesData({ ...res.data, loading: false })
			}
		})
	}, [roleId])

	useEffect(() => {
		getSystemModules()
	}, [])

	const handleRoleChange = () => {
		if (roles.selectedId && roles.selectedId !== 0) {
			permissionsModule.getRolePermissions(roles.selectedId).then((res) => {
				// loop through the data and get the actions from the permissions array
				let actions = res.data?.data?.map((ele: any) => ele.Permission?.action);
				setPrivilegesData(actions)

				updateURL(roles.selectedId)
			}).catch((err) => {
				message.error(err.message);
			});
		}
	};

	useEffect(() => {
		if (moduleId && moduleId !== 0 && roles.selectedId && roles.selectedId !== 0) {
			updateURL(roles.selectedId);
		}
		handleRoleChange();
	}, [moduleId, roles.selectedId]);

	useEffect(() => {
		if (__moduleId) {
			setModuleId(Number(__moduleId));
		}
	}, [__moduleId])

	useEffect(() => {
		setRoles({ ...roles, selectedId: Number(roleId), loading: true });
		rolesModule.getAllRecords().then((res) => {
			setRoles({ ...roles, data: res.data.data, selectedId: Number(roleId), loading: false });
		});
	}, [rolesModule]);

	// find the selected role data using the roleId in the url
	const findRoleData = useCallback(() => {
		if (Number(roleId) !== 0) {
			const roleData = roles.data.find((item: RoleTypes) => item.id === Number(roleId))
			setSelectedRoleData(roleData)
		}
	}, [roleId, roles.data])

	useEffect(() => {
		findRoleData()
	}, [findRoleData])

	return (
		<SiteSettingsTemplate>
			<PageHeader
				heading="Role Permissions"
				breadCrumbData={breadCrumbsData}
			/>
			<div className="d-flex overflow-hidden">
				<div className="d-flex flex-column w-100">
					<div className={styles.header + " d-flex pb-4"}>
						<div className="my-auto color-dark-main">You are viewing permission of</div>
						<div className="ml-3">
							<Select
								onChange={(value) => setRoles({ ...roles, selectedId: value })}
								placeholder="Choose role"
								allowClear
								style={{ width: 200 }}
								className="selectAntdCustom"
								loading={roles.loading}
								options={roles.data.map((role: any) => {
									return { label: role.title, value: role.id };
								})}
								defaultValue={(Number(roleId) && Number(roleId) !== 0) ? Number(roleId) : null}
							/>
						</div>
					</div>

					<div className="overflow-auto">
						<div >
							{permission.loading ? (
								<Skeletons items={16} />
							) : (
								(!Number(roleId) || systemModulesData.data.length === 0) ? (
									<Empty
										image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
										imageStyle={{
											height: 200,
										}}
										description={
											<span>
												Please select a role to view the associated permissions
											</span>
										}
									>
									</Empty>
								) : (
									<div>
										<TableComponent
											tableData={systemModulesData.data}
											tableLoading={systemModulesData.loading}
											rolePermissions={privilegesData}
											roleData={selectedRoleData!}
										/>
									</div>
								)
							)}
						</div>
					</div>
				</div>
			</div>
		</SiteSettingsTemplate>
	);
};

export default AgentRolePermissions;
