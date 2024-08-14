import { Form, message, Transfer } from "antd";
import {
	CustomModal,
	CustomErrorAlert,
	CustomButton,
} from "../../../../Atoms";
import styles from "../../Common/styles.module.scss";
import Skeletons from "../../../Skeletons";
import { useEffect, useCallback, useMemo, useState } from "react";
import { HandleServerErrors } from "../../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../../helpers";
import { PropTypes } from "../../Common/common-types";
import { RolesModule } from "../../../../../Modules/Roles";
import { RoleResponseArray, RoleTypes } from "../../../../../Modules/Roles/types";
import { UserTypes } from "../../../../../Modules/User/types";
import { UserModule } from "../../../../../Modules/User";
import { UserPermissionsEnum } from "../../../../../Modules/User/permissions";

interface RecordType {
	key: string;
	title: string;
	description: string;
	chosen: boolean;
}

interface UserRoleModalProps extends PropTypes {
	record: number;
	recordData: UserTypes
	permissions: { [key in UserPermissionsEnum]: boolean };
}

export const UserRoleModal = (props: UserRoleModalProps) => {
	const {
		openModal, onCancel, record, reloadTableData,
		recordData, permissions: { addUserRole }
	} = props;
	const [form] = Form.useForm();

	// user module
	const module = useMemo(() => new UserModule(), []);
	const roleModule = useMemo(() => new RolesModule(), []);
	const [rolesData, setRolesData] = useState<Partial<RoleResponseArray>>();

	let selectedKeys: string[] = [];
	if (recordData && recordData.userRole) {
		recordData?.userRole?.map((ele) => selectedKeys.push(ele.Role.id.toString()))
	}

	const [targetKeys, setTargetKeys] = useState<string[]>(selectedKeys);

	const handleErrors = (err: any) => {
		const error = errorHandler(err);
		if (typeof error.message == "string") {
			setRolesData({ ...rolesData, error: error.message });
		} else {
			let errData = HandleServerErrors(error.message, []);
			form.setFields(errData);
			setRolesData({ ...rolesData, error: "" });
		}
	};

	const handleAlertClose = () => {
		setRolesData({ ...rolesData, error: "" });
	};

	const getRolesData = useCallback(() => {
		roleModule.getAllRecords().then((res) => {
			if (res.data && res.data?.data) {
				setRolesData({ ...res.data, loading: false });
			}
		}).catch((err) => {
			handleErrors(err);
		});
	}, [form, record, module, roleModule]);

	const filterOption = (inputValue: string, option: RecordType) =>
		option?.description?.indexOf(inputValue?.toLowerCase()) > -1;

	const handleChange = (newTargetKeys: string[]) => {
		setTargetKeys(newTargetKeys);
	};

	useEffect(() => {
		setRolesData({ loading: true });
		getRolesData();
	}, [openModal, form]);

	const onFinish = (formValues: { roleIds: number[] }) => {
		if (formValues.roleIds) {
			if (addUserRole === true) {
				setRolesData({ ...rolesData, buttonLoading: true });
				const formData = formValues?.roleIds?.map((ele) => Number(ele));
				module.addRoles({ roleIds: formData }, record).then((res) => {
					reloadTableData();
					onCancel();
					setRolesData((prev) => ({ ...prev, loading: false }));
					message.success("Saved Successfully");
				}).catch((err) => {
					handleErrors(err);
					setRolesData((prev) => ({ ...prev, loading: false }));
				});

				let removedRoles: number[] = [];
				selectedKeys.map((ele) => !targetKeys.includes(ele) && removedRoles.push(Number(ele)))

				if (removedRoles?.length > 0) {
					module.removeRoles({ roleIds: removedRoles }, record).catch((err) => {
						message.error(err.message)
					});
				}
			} else {
				message.error("You don't have permission to manage roles, please contact admin");
			}
		} else {
			message.info("No changes made");
			onCancel();
		}
	};

	return (
		<CustomModal
			visible={openModal}
			closable={true}
			onCancel={onCancel}
			titleText={"Manage Roles"}
			showFooter={false}
		>
			{rolesData?.loading ? (
				<Skeletons items={10} />
			) : (

				<Form className={styles.form} onFinish={onFinish} form={form}>
					{rolesData?.error && (
						<CustomErrorAlert
							description={rolesData?.error}
							isClosable
							onClose={handleAlertClose}
						/>
					)}

					<div>
						<Form.Item name="roleIds" rules={[{ required: false }]}>
							<Transfer
								dataSource={rolesData?.data?.map((ele: RoleTypes, index: number) => {
									return {
										key: ele.id.toString(),
										title: ele.title,
										description: ele.title?.toLowerCase(),
									}
								})}
								listStyle={{
									width: 250,
									height: 400,
								}}
								showSearch
								filterOption={filterOption}
								targetKeys={targetKeys}
								onChange={handleChange}
								render={item => item.title}
							/>
						</Form.Item>
					</div>


					<div className={styles.footer}>
						<CustomButton size="normal" fontSize="sm" onClick={onCancel} type="plain">
							Cancel
						</CustomButton>
						<CustomButton
							type="primary"
							size="normal"
							fontSize="sm"
							htmlType="submit"
							loading={rolesData?.buttonLoading}
						>
							Save
						</CustomButton>
					</div>
				</Form>
			)}
		</CustomModal>
	);
};
