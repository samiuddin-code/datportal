import { Empty, Form, Select, message } from "antd";
import {
	CustomInput,
	CustomModal,
	CustomErrorAlert,
	CustomButton
} from "../../../Atoms";
import styles from "../../Common/styles.module.scss";
import Skeletons from "../../Skeletons";
import { useEffect, useCallback, useState } from "react";
import { HandleServerErrors } from "../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { CompanyAssetResponseObject } from "../../../../Modules/CompanyAsset/types";
import { PropTypes } from "../../Common/common-types";
import { CompanyAssetPermissionsEnum } from "../../../../Modules/CompanyAsset/permissions";
import { CompanyAssetModule } from "../../../../Modules/CompanyAsset";
import { CompanyAssetTypeEnum } from "@helpers/commonEnums";
import { capitalize } from "@helpers/common";

interface CompanyAssetModalProps extends PropTypes {
	record: number;
	permissions: { [key in CompanyAssetPermissionsEnum]: boolean };
}

export const CompanyAssetModal = (props: CompanyAssetModalProps) => {
	const {
		openModal, onCancel, type, record,
		reloadTableData, permissions: {
			createCompanyAsset, updateCompanyAsset
		}
	} = props;
	const [form] = Form.useForm();
	const module = new CompanyAssetModule();
	const [recordData, setRecordData] = useState<Partial<CompanyAssetResponseObject>>();


	const handleErrors = (err: any) => {
		const error = errorHandler(err);
		if (typeof error.message == "string") {
			setRecordData({ ...recordData, error: error.message });
		} else {
			let errData = HandleServerErrors(error.message, []);
			form.setFields(errData);
			setRecordData({ ...recordData, error: "" });
		}
	};

	const handleAlertClose = () => {
		setRecordData({ ...recordData, error: "" });
	};

	const getDataBySlug = useCallback(() => {
		module.getRecordById(record).then((res) => {
			if (res.data && res.data.data) {
				form.setFieldsValue({
					...res.data.data,
				});
				setRecordData({ ...res.data, loading: false });
			}
		}).catch((err) => {
			handleErrors(err);
		});
	}, [form, record, module]);

	useEffect(() => {
		if (type === "edit") {
			setRecordData({ loading: true });
			getDataBySlug();
		} else {
			form.resetFields();
		}
	}, []);


	const onFinish = (formValues: any) => {
		setRecordData({ ...recordData, buttonLoading: true });
		switch (type) {
			case "edit": {
				if (updateCompanyAsset === true) {
					module.updateRecord(formValues, record).then((res) => {
						reloadTableData();
						onCancel();
						setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					}).catch((err) => {
						handleErrors(err);
						setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					});
				} else {
					setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					message.error("You don't have permission to update this record");
				}
				break;
			}
			case "new": {
				if (createCompanyAsset === true) {
					module.createRecord(formValues).then((res) => {
						reloadTableData();
						onCancel();
						setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					}).catch((err) => {
						handleErrors(err);
						setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					});
				} else {
					setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					message.error("You don't have permission to create this record");
				}
				break;
			}
		}
	};


	return (
		<CustomModal
			visible={openModal}
			closable={true}
			onCancel={onCancel}
			titleText={type === "edit" ? "Edit Asset" : "Add New Asset"}
			showFooter={false}
		>
			{recordData?.loading ? (
				<Skeletons items={3} />
			) : (
				<Form className={styles.form} onFinish={onFinish} form={form}>
					{recordData?.error && (
						<CustomErrorAlert
							description={recordData?.error}
							isClosable
							onClose={handleAlertClose}
						/>
					)}
					<div>
						<Form.Item name="assetName" rules={[{ required: true, message: "Please add a name" }]}>
							<CustomInput size="w100" label={"Name"} asterisk type="text" placeHolder="Enter asset name" />
						</Form.Item>
						<Form.Item name="assetDetail">
							<CustomInput
								size="w100"
								label={"Detail"}
								type="text"
							/>
						</Form.Item>
					</div>
					<div>
					<Form.Item name="code" rules={[{ required: true, message: "Please add a code" }]}>
							<CustomInput size="w100" label={"Code"} asterisk type="text" placeHolder="Enter code" />
						</Form.Item>
						<Form.Item  name="quantity" rules={[{ required: true, message: "Please add quantity" }]}>
							<CustomInput
								size="w100"
								label={"Quantity"}
								type="number"
								asterisk
								defaultValue={type=== "edit" ? recordData?.data.quantity : undefined} 
							/>
						</Form.Item>
					</div>
					<div>
                    <Form.Item
                        name="type"
                        rules={[
                            { required: true, message: "Please select a department" },
                        ]}
                    >
                        <label className={"font-size-sm"}>
                            Type  <span className='color-red-yp'>*</span>
                        </label>

                        <Select
                            allowClear
                            style={{ width: "100%" }}
                            defaultValue={recordData?.data?.type}
                            placeholder="Search for the asset type"
                            className="selectAntdCustom"
                            onChange={(value) => form.setFieldsValue({ type: value })}
                            showSearch
                            onSearch={(value) => {}}
                            optionFilterProp="label"
                            options={Object.entries(CompanyAssetTypeEnum)?.map(([key, value]) => {
                                return {
                                    label: capitalize(key.replace("_", " ")),
                                    value: Number(value),
                                }
                            })}
                            notFoundContent={
                                <Empty
                                    image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                                    imageStyle={{
                                        height: 100,
                                    }}
                                    description={
                                        <span>
                                            No data found, Please search for the type
                                        </span>
                                    }
                                />
                            }
                        />
                    </Form.Item>
                </div>
					<div className="d-flex justify-end">
						<CustomButton size="normal" fontSize="sm" onClick={onCancel} type="plain">
							Cancel
						</CustomButton>
						<CustomButton
							type="primary"
							size="normal"
							fontSize="sm"
							htmlType="submit"
							loading={recordData?.buttonLoading}
						>
							{type === "edit" ? "Edit Asset" : "Add Asset"}
						</CustomButton>
					</div>
				</Form>
			)}
		</CustomModal>
	);
};
