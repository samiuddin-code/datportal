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
import { PropTypes } from "../settings";
import { TransferDirection } from "antd/lib/transfer";
import { PackageModule, PackagePromotion } from "../../../../../Modules/Package";
import { CreditsPackageModule, CreditsPackagePromotion } from "../../../../../Modules/CreditsPackage";
import { CreditsPackageResponseArray, CreditsPackageTypes } from "../../../../../Modules/CreditsPackage/types";
import { PromotionTypes } from "../../../../../Modules/Promotion/types";
import { PackageResponseArray, PackageTypes } from "../../../../../Modules/Package/types";

interface RecordType {
	key: string;
	title: string;
	description: string;
	chosen: boolean;
}

export const ManagePackagesModal = (props: PropTypes & {
	record: number,
	recordData: any
}) => {
	const { openModal, onCancel, record, reloadTableData, recordData, type } = props;
	const [form] = Form.useForm();

	const creditPackageModule = useMemo(() => new CreditsPackageModule(), []);
	const creditPackagePromotions = useMemo(() => new CreditsPackagePromotion(), []);
	const packageModule = useMemo(() => new PackageModule(), []);
	const packagePromotions = useMemo(() => new PackagePromotion(), []);
	const [creditPackagesData, setCreditPackagesData] = useState<Partial<CreditsPackageResponseArray>>();
	const [packagesData, setPackagesData] = useState<Partial<PackageResponseArray>>();

	let selectedKeys: string[] = [];
	if (recordData && recordData) {
		if (recordData && type === "credit") {
			const creditPackagePromotions: PromotionTypes['creditPackagePromotions'] = recordData
			creditPackagePromotions?.map((ele) => selectedKeys.push(ele.creditPackageId.toString()))
		} else if (recordData && type === "package") {
			const packagePromotions: PromotionTypes['packagePromotions'] = recordData
			packagePromotions?.map((ele) => selectedKeys.push(ele.packageId.toString()))
		}
	}

	const [targetKeys, setTargetKeys] = useState<string[]>(selectedKeys);

	const handleErrors = (err: any) => {
		const error = errorHandler(err);
		if (type === "credit") {
			if (typeof error.message == "string") {
				setCreditPackagesData({ ...creditPackagesData, error: error.message });
			} else {
				let errData = HandleServerErrors(error.message, []);
				form.setFields(errData);
				setCreditPackagesData({ ...creditPackagesData, error: "" });
			}
		} else if (type === "package") {
			if (typeof error.message == "string") {
				setPackagesData({ ...packagesData, error: error.message });
			} else {
				let errData = HandleServerErrors(error.message, []);
				form.setFields(errData);
				setPackagesData({ ...packagesData, error: "" });
			}
		}
	};

	const handleAlertClose = () => {
		if (type === "credit") {
			setCreditPackagesData({ ...creditPackagesData, error: "" });
		} else if (type === "package") {
			setPackagesData({ ...packagesData, error: "" });
		}
	};

	const getData = useCallback(() => {
		if (type === "credit") {
			creditPackageModule.getAllRecords().then((res) => {
				if (res.data && res.data.data) {
					setCreditPackagesData({ ...res.data, loading: false });
				}
			}).catch((err) => {
				handleErrors(err);
			});
		} else if (type === "package") {
			packageModule.getAllRecords().then((res) => {
				if (res.data && res.data.data) {
					setPackagesData({ ...res.data, loading: false });
				}
			}).catch((err) => {
				handleErrors(err);
			});
		}
	}, [form, record, creditPackageModule, type, packageModule]);

	const filterOption = (inputValue: string, option: RecordType) =>
		option.description.indexOf(inputValue.toLowerCase()) > -1;

	const handleChange = (newTargetKeys: string[]) => {
		setTargetKeys(newTargetKeys);
	};

	useEffect(() => {
		setCreditPackagesData({ loading: true });
		getData();
	}, [openModal, form]);

	const onFinish = async (formValues: { creditPackageIds: number[], packageIds: number[] }) => {
		if (formValues.creditPackageIds && type === "credit") {
			setCreditPackagesData({ ...creditPackagesData, buttonLoading: true });
			const formData = formValues?.creditPackageIds?.map((ele) => Number(ele));

			setCreditPackagesData({ ...creditPackagesData, buttonLoading: false });

			if (formData.length > 0) {
				await creditPackagePromotions.createRecord({
					creditPackageIds: formData, promotionId: record
				}).then((res) => {
					message.success("Saved Successfully");
				}).catch((err) => {
					handleErrors(err);
					setCreditPackagesData((prev) => ({ ...prev, loading: false }));
				});
			}

			let removedPackages: number[] = [];
			selectedKeys?.map((ele) => !targetKeys.includes(ele) && removedPackages.push(Number(ele)));

			if (removedPackages?.length > 0) {
				await creditPackagePromotions.deleteMultipleRecords(record, removedPackages).catch((err) => {
					message.error(err.message)
				});
			}

			reloadTableData();
			onCancel();
			setCreditPackagesData((prev) => ({ ...prev, loading: false }));
		} else if (formValues.packageIds && type === "package") {
			setPackagesData({ ...packagesData, buttonLoading: true });
			const formData = formValues?.packageIds?.map((ele) => Number(ele));

			setPackagesData({ ...packagesData, buttonLoading: false });

			if (formData.length > 0) {
				await packagePromotions.createRecord({ packageIds: formData, promotionId: record }).then((res) => {
					message.success("Saved Successfully");
				}).catch((err) => {
					handleErrors(err);
					setPackagesData((prev) => ({ ...prev, loading: false }));
				});
			}

			let removedPackages: number[] = [];
			selectedKeys?.map((ele) => !targetKeys.includes(ele) && removedPackages.push(Number(ele)));

			if (removedPackages?.length > 0) {
				await packagePromotions.deleteMultipleRecords(record, removedPackages).catch((err) => {
					message.error(err.message)
				});
			}

			reloadTableData();
			onCancel();
			setPackagesData((prev) => ({ ...prev, loading: false }));
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
			titleText={type === "credit" ? "Manage Credit Packages" : "Manage Packages"}
			showFooter={false}
		>
			{(type === "credit" && creditPackagesData?.loading) || (type === "package" && packagesData?.loading) ? (
				<Skeletons items={10} />
			) : (

				<Form className={styles.form} onFinish={onFinish} form={form}>
					{type === "credit" && (
						<>
							{creditPackagesData?.error && (
								<CustomErrorAlert
									description={creditPackagesData?.error}
									isClosable
									onClose={handleAlertClose}
								/>
							)}

							<div>
								<Form.Item name="creditPackageIds" rules={[{ required: false }]}>
									<Transfer
										dataSource={creditPackagesData?.data?.map((ele: CreditsPackageTypes, index: number) => {
											return {
												key: ele.id.toString(),
												title: ele.localization[0].title,
												description: ele.localization[0].title?.toLowerCase(),
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
									loading={creditPackagesData?.buttonLoading}
								>
									Save
								</CustomButton>
							</div>
						</>
					)}

					{type === "package" && (
						<>
							{packagesData?.error && (
								<CustomErrorAlert
									description={packagesData?.error}
									isClosable
									onClose={handleAlertClose}
								/>
							)}

							<div>
								<Form.Item name="packageIds" rules={[{ required: false }]}>
									<Transfer
										dataSource={packagesData?.data?.map((ele: PackageTypes, index: number) => {
											return {
												key: ele.id.toString(),
												title: ele.localization[0].title,
												description: ele.localization[0].title?.toLowerCase(),
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
									loading={packagesData?.buttonLoading}
								>
									Save
								</CustomButton>
							</div>
						</>
					)}
				</Form>
			)}
		</CustomModal>
	);
};
