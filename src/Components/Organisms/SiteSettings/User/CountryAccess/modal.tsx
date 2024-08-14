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
import { UserResponseArray, UserTypes } from "../../../../../Modules/User/types";
import { UserModule } from "../../../../../Modules/User";
import { CountryModule } from "../../../../../Modules/Country";
import { CountryResponseArray, CountryTypes } from "../../../../../Modules/Country/types";
import { UserPermissionsEnum } from "../../../../../Modules/User/permissions";

interface RecordType {
	key: string;
	title: string;
	description: string;
	chosen: boolean;
}

interface UserCountryAccessModalProps extends PropTypes {
	record: number;
	recordData: UserTypes
	permissions: { [key in UserPermissionsEnum]: boolean };
}

export const UserCountryAccessModal = (props: UserCountryAccessModalProps) => {
	const {
		openModal, onCancel, record, reloadTableData, recordData,
		permissions: { addUserCountry, removeUserCountry }
	} = props;
	const [form] = Form.useForm();

	// user module
	const module = useMemo(() => new UserModule(), []);
	const countryModule = useMemo(() => new CountryModule(), []);
	const [userData, setUserData] = useState<Partial<UserResponseArray>>();
	const [countries, setCountries] = useState<Partial<CountryResponseArray>>();

	let selectedKeys: string[] = [];
	// if (recordData && recordData?.userCountry) {
	// 	recordData?.userCountry?.map((ele) => selectedKeys.push(ele.countryId.toString()))
	// }

	const [targetKeys, setTargetKeys] = useState<string[]>(selectedKeys);

	const handleErrors = (err: any) => {
		const error = errorHandler(err);
		if (typeof error.message == "string") {
			setUserData({ ...userData, error: error.message });
		} else {
			let errData = HandleServerErrors(error.message, []);
			form.setFields(errData);
			setUserData({ ...userData, error: "" });
		}
	};

	const handleAlertClose = () => {
		setUserData({ ...userData, error: "" });
	};

	const getUserData = useCallback(() => {
		module.getRecordById(record).then((res) => {
			if (res.data && res.data.data) {
				setUserData({ ...res.data, loading: false });
			}
		}).catch((err) => {
			handleErrors(err);
		});

		countryModule.getAllRecords().then((res) => {
			if (res.data && res.data.data) {
				setCountries({ ...res.data, loading: false });
			}
		}).catch((err) => {
			handleErrors(err);
		});
	}, [form, record, module, countryModule]);

	const filterOption = (inputValue: string, option: RecordType) =>
		option.description.indexOf(inputValue.toLowerCase()) > -1;

	const handleChange = (newTargetKeys: string[]) => {
		setTargetKeys(newTargetKeys);
	};

	useEffect(() => {
		setUserData({ loading: true });
		getUserData();
	}, [openModal, form]);

	const onFinish = async (formValues: { userCountryList: number[] }) => {
		if (formValues.userCountryList) {
			setUserData({ ...userData, buttonLoading: true });
			const formData = formValues?.userCountryList?.map((ele) => Number(ele));
			if (addUserCountry === true) {
				await module.addCountryAccess({ userCountryList: formData, userId: record }).then((res) => {
					setUserData((prev) => ({ ...prev, loading: false }));
					message.success("Saved Successfully");
				}).catch((err) => {
					handleErrors(err);
					setUserData((prev) => ({ ...prev, loading: false }));
				});
			} else {
				message.error("You don't have permission to add country access")
			}

			let removedCountries: number[] = [];
			selectedKeys.map((ele) => !targetKeys.includes(ele) && removedCountries.push(Number(ele)))

			if (removedCountries?.length > 0) {
				if (removeUserCountry === true) {
					await module.removeCountryAccess({ userCountryList: removedCountries, userId: record }).catch((err) => {
						message.error(err.message)
					});
				} else {
					message.error("You don't have permission to remove country access")
				}
			}
			reloadTableData();
			onCancel();
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
			titleText={"Manage User Country Access"}
			showFooter={false}
		>
			{userData?.loading ? (
				<Skeletons items={10} />
			) : (

				<Form className={styles.form} onFinish={onFinish} form={form}>
					{userData?.error && (
						<CustomErrorAlert
							description={userData?.error}
							isClosable
							onClose={handleAlertClose}
						/>
					)}

					<div>
						<Form.Item name="userCountryList" rules={[{ required: false }]}>
							<Transfer
								dataSource={countries?.data?.map((ele: CountryTypes, index: number) => {
									return {
										key: ele.id.toString(),
										title: ele.name,
										description: ele.name?.toLowerCase(),
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
							loading={userData?.buttonLoading}
						>
							Save
						</CustomButton>
					</div>
				</Form>
			)}
		</CustomModal>
	);
};
