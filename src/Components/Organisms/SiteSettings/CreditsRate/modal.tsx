import { Form, message } from "antd";
import {
	CustomInput,
	CustomModal,
	CustomErrorAlert,
	CustomButton,
	CustomSelect,
} from "../../../Atoms";
import styles from "../Common/styles.module.scss";
import Skeletons from "../../Skeletons";
import { useEffect, useCallback, useMemo, useState } from "react";
import { HandleServerErrors } from "../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { CreditsRateModule } from "../../../../Modules/CreditsRate";
import { CountryModule } from "../../../../Modules/Country";
import { CountryTypes } from "../../../../Modules/Country/types";
import { CreditsRateResponseObject } from "../../../../Modules/CreditsRate/types";
import { PropTypes } from "../../Common/common-types";
import { CreditsRatePermissionsEnum } from "../../../../Modules/CreditsRate/permissions";

interface CreditsRateModalProps extends PropTypes {
	permissions: { [key in CreditsRatePermissionsEnum]: boolean };
}

export const CreditsRateModal = (props: CreditsRateModalProps) => {
	const { openModal, onCancel, type, reloadTableData,
		permissions: {
			createCreditsRate,
		}
	} = props;
	const [form] = Form.useForm();
	// Credits Module
	const module = useMemo(() => new CreditsRateModule(), []);
	const countryModule = useMemo(() => new CountryModule(), []);

	const [recordData, setRecordData] = useState<Partial<CreditsRateResponseObject>>();
	const [countries, setCountries] = useState<CountryTypes[]>([]);

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

	const getCountryList = useCallback(() => {
		countryModule.getAllRecords().then((res) => {
			if (res?.data?.data) {
				setCountries(res.data.data);
			}
		});
	}, [countryModule]);

	useEffect(() => {
		if (type === "new") {
			getCountryList();
		}
	}, [type, getCountryList]);

	useEffect(() => {
		if (type === "edit") {
			setRecordData({ loading: true });
		} else {
			form.resetFields();
		}
	}, [openModal, type, form]);

	const onFinish = (formValues: any) => {
		setRecordData({ ...recordData, buttonLoading: true });

		// convert the country id in formValues to a number
		formValues.countryId = Number(formValues.countryId);

		if (type === "new") {
			if (createCreditsRate === true) {
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
				message.error("You do not have permission to create a new credit rate");
			}
		} else {
			setRecordData((prev) => ({ ...prev, buttonLoading: false }));
		}
	};

	return (
		<CustomModal
			visible={openModal}
			closable={true}
			onCancel={onCancel}
			titleText={type === "edit" ? "Edit Credit Rate" : "Add New Credit Rate"}
			showFooter={false}
		>
			{recordData?.loading ? (
				<Skeletons items={10} />
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
						<Form.Item name="credits" rules={[{ required: true, message: "Please add credits" }]}>
							<CustomInput size="w100" label={"Credits"} asterisk type="number" />
						</Form.Item>

						<Form.Item name="rate" rules={[{ required: true, message: "Please add a rate" }]}>
							<CustomInput size="w100" label={"Rate"} asterisk type="number" />
						</Form.Item>
					</div>

					<div>
						<Form.Item
							name="countryId"
							rules={[{ required: true, message: "Please select a country" }]}
						>
							<CustomSelect
								label={"Country"}
								options={countries?.map((country) => ({
									label: country.name,
									value: country.id,
								}))}
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
							loading={recordData?.buttonLoading}
						>
							Submit
						</CustomButton>
					</div>
				</Form>
			)}
		</CustomModal>
	);
};
