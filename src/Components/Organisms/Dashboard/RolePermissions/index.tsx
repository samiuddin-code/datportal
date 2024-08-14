import { useEffect, useState, useMemo, useCallback } from "react";
import { createSearchParams, useSearchParams } from "react-router-dom";
import { RolePermissionsAside } from "./aside";
import styles from "./styles.module.scss";
import { Typography } from "../../../Atoms";
import { Checkbox, Empty, Form, message } from "antd";
import { Select } from "antd";
import { RolesModule } from "../../../../Modules/Roles";
import { SystemModulesModule } from "../../../../Modules/SystemModules";
import Skeletons from "../../Skeletons";
import { SystemModulesType } from "../../../../Modules/SystemModules/types";
import { PermissionsModule } from "../../../../Modules/Permissions";
import { BackIcon } from "../../../Icons";
import Layout from "../../../Templates/Layout";

const AgentRolePermissions = () => {
	const [moduleId, setModuleId] = useState(0);
	const [checkAll, setCheckAll] = useState(false);
	const [permission, setPermission] = useState<{ data?: SystemModulesType; loading: boolean }>({
		loading: false,
	});

	const [searchParams, setSearchParams] = useSearchParams()

	const roleId = searchParams.get('roleId')
	const __moduleId = searchParams.get('moduleId');

	const [roles, setRoles] = useState<{
		data: any[];
		loading: boolean;
		selectedId: number;
	}>({
		data: [],
		loading: false,
		selectedId: 0,
	});

	const rolesModule = useMemo(() => new RolesModule(), []);
	const systemModule = useMemo(() => new SystemModulesModule(), []);
	const permissionsModule = useMemo(() => new PermissionsModule(), []);
	const [form] = Form.useForm();
	const [privilegesData, setPrivilegesData] = useState<any>({
		initialData: [],
		data: {},
	});
	const handleSelectAllChange = (e: any) => {
		let newData: any = {};
		permission.data?.Permissions.forEach((ele) => {
			newData[ele.action] = e.target.checked;
		});
		setPrivilegesData({ ...privilegesData, data: newData });
		setCheckAll(e.target.checked);
		form.setFieldsValue(newData);
	};

	// update the query params to reflect the selected role and module id
	const updateURL = (roleId: number, moduleId: number) => {
		setSearchParams(createSearchParams({
			roleId: String(roleId),
			moduleId: String(moduleId)
		}));
	}

	const handleRoleChange = () => {
		if (moduleId !== 0 && roles.selectedId && roles.selectedId !== 0) {
			permissionsModule
				.getRolePermissionsByModuleId(roles.selectedId, moduleId)
				.then((res) => {
					let defaultPermissionSelected = {};
					res?.data?.data?.forEach(
						(item: any, index: number) =>
						(defaultPermissionSelected = {
							...defaultPermissionSelected,
							[item.permission.action]: true,
						})
					);
					setPrivilegesData({
						...privilegesData,
						initialData: res.data.data,
						data: defaultPermissionSelected,
					});
					form.setFieldsValue(defaultPermissionSelected);
				})
				.catch((err) => {
					message.error(err.message);
				});
		}
	};

	const handlePermissionChange = (e: any, name: string) => {
		form.setFieldsValue({ [name]: e.target.checked });
		setPrivilegesData({
			...privilegesData,
			data: { ...privilegesData.data, [name]: e.target.checked },
		});
		if (!e.target.checked) {
			setCheckAll(false);
		}
	};

	const onFinish = () => {
		if (roles.selectedId === 0) {
			message.error("Please choose a role");
			return false;
		}

		let permissionIds: number[] = [];
		permission.data?.Permissions.forEach((ele) => {
			if (form.getFieldValue(ele.action) === true) {
				permissionIds.push(ele.id);
			}
		});

		if (permissionIds.length > 0) {
			permissionsModule.grantPrivilegesToRole({
				roleId: roles.selectedId,
				permissionIds: permissionIds
			}).then((res) => {
				message.success(res.data?.message);
			}).catch((err) => {
				message.error(err.data.message);
			});
		}

		let deletedIds: Array<number> = [];
		privilegesData.initialData.forEach((ele: any) => {
			if (!permissionIds.includes(ele.permission.id)) {
				deletedIds.push(ele.permission.id);
			}
		});

		if (deletedIds.length > 0) {
			permissionsModule.revokePrivilegesFromRole({
				roleId: roles.selectedId,
				permissionIds: deletedIds
			}).then((res) => {
				message.success(res.data?.message);
			}).catch((err) => {
				message.error(err.data.message);
			});
		}
	};

	useEffect(() => {
		if (moduleId && moduleId !== 0 && roles.selectedId && roles.selectedId !== 0) {
			if (roles.selectedId !== Number(roleId) || moduleId !== Number(__moduleId)) {
				updateURL(roles.selectedId, moduleId);
			}
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

	useEffect(() => {
		if (moduleId !== 0) {
			setPermission({ ...permission, loading: true });
			systemModule.getRecordById(moduleId).then((res) => {
				setPermission({ data: res.data.data, loading: false });
			});
		}
	}, [moduleId, systemModule]);

	const getRoleOptions = () => {
		let optionsData: { label: string, value: string }[] = [];
		roles?.data?.map((role: any) => {
			if (role?.visibility === "organization") {
				optionsData.push({ label: role?.title, value: role?.id });
			}
		})
		return optionsData;
	}

	return (
		<Layout className="pa-0">
			<div className="d-flex overflow-hidden">
				<div>
					<RolePermissionsAside setModuleId={setModuleId} moduleId={moduleId} />
				</div>
				<div className="d-flex flex-column w-100">
					<div className={styles.header + " d-flex py-4"}>
						<div className="my-auto color-dark-main">You are changing permission of</div>
						<div className="ml-3">
							<Select
								onChange={(value) => setRoles({ ...roles, selectedId: value })}
								placeholder="Choose role"
								allowClear
								style={{ width: 200 }}
								className="selectAntdCustom"
								loading={roles.loading}
								options={getRoleOptions()}
								defaultValue={(Number(roleId) && Number(roleId) !== 0) ? Number(roleId) : null}
							/>
						</div>
					</div>
					<div className="overflow-auto">
						<div className={styles.content}>
							{permission.loading ? (
								<Skeletons items={16} />
							) : (
								(moduleId === 0 || !moduleId) ? (
									<Empty
										image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
										imageStyle={{
											height: 200,
										}}
										description={
											<span>
												Please select a module from the sidebar
											</span>
										}
									>
									</Empty>
								) : (
									<Form onFinish={onFinish} form={form} className="w-100">
										<div className={styles.contentHeader}>
											<BackIcon />
											<Typography size="lg" color="dark-main" weight="semi">
												Permissions
											</Typography>
											<div></div>
										</div>

										<div className={styles.content__layout}>
											<div className={styles.content__layout__header}>
												<div>
													<Typography size="md" color="dark-main" weight="semi">
														{permission.data?.name}
													</Typography>
													<Typography size="xs" color="dark-sub" className="pt-1">
														{permission.data?.description}
													</Typography>
												</div>
												<Checkbox
													onChange={handleSelectAllChange}
													checked={checkAll}
													className="scaledCheckbox font-size-sm user-select-none"
												>
													Select&nbsp;All
												</Checkbox>
											</div>

											{permission.data?.Permissions.map((ele) => {
												return (
													<div
														key={"permissions___" + ele.id}
														className={`${styles.content__layout__header} ${styles.content__layout__content}`}
													>
														<div>
															<Typography size="sm" color="dark-main" weight="semi">
																{ele?.name}
															</Typography>
															<Typography size="xs" color="dark-sub" className="pt-1">
																{ele?.description}
															</Typography>
														</div>

														<Form.Item name={ele?.action}>
															<Checkbox
																className="my-auto scaledCheckbox"
																onChange={(e) => handlePermissionChange(e, ele.action)}
																defaultChecked={privilegesData.data[ele.action]}
																checked={privilegesData.data[ele.action]}
															/>
														</Form.Item>
													</div>
												);
											})}
										</div>

										<div className={styles.content__layout__footer}>
											<button type="submit" className={styles.content__layout__footer__button}>
												Save
											</button>
										</div>
									</Form>
								))}
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default AgentRolePermissions;
