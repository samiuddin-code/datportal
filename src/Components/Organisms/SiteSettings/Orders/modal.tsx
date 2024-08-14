import { useEffect, useCallback, useMemo, useState, FormEvent } from "react";
import { Form, message, Radio, RadioChangeEvent } from "antd";
import {
	CustomInput,
	CustomModal,
	CustomErrorAlert,
	CustomButton,
} from "../../../Atoms";
import styles from "../../Common/styles.module.scss";
import componentStyles from './styles.module.scss'
import Skeletons from "../../Skeletons";
import { HandleServerErrors } from "../../../../Components/Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { PropTypes } from "../../Common/common-types";
import { ValidateCouponCodeType } from "../../../../Modules/OrganizationCreditPackage/types"
import { CreditsPackageResponseObject, CreditsPackageTypes } from "../../../../Modules/CreditsPackage/types"
import { OrgCreditsPackageModule } from "../../../../Modules/OrganizationCreditPackage"
import { CreditsPackageModule } from "../../../../Modules/CreditsPackage";

export const AgentOrdersModal = (props: PropTypes) => {
	const { openModal, onCancel, type, reloadTableData } = props;
	const [form] = Form.useForm();

	// credit packages module
	const creditPackageModule = useMemo(() => new CreditsPackageModule(), []);
	// Organization Credit packages module
	const orgCreditPackageModule = useMemo(() => new OrgCreditsPackageModule(), []);

	// credit package data
	const [recordData, setRecordData] = useState<Partial<CreditsPackageResponseObject>>({
		loading: true,
		error: {},
		data: [],
	});
	const [packageSelected, setPackageSelected] = useState<CreditsPackageTypes>()
	const [userCouponCode, setUserCouponCode] = useState<string | ''>('')
	const [amount, setAmount] = useState<{
		discount?: number,
		vat?: number,
		total: number
	}>()
	// count down timer
	const [count, setCount] = useState(0);
	const [timer, setTimer] = useState<any>(null);

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

	const getCreditPackageRecords = useCallback(() => {
		creditPackageModule.getAllPublished().then((res) => {
			if (res.data && res.data.data) {
				setRecordData({ ...res.data, loading: false });
			}
		}).catch((err) => {
			console.error('Error getting credit packages', err?.message)
		})
	}, [creditPackageModule])

	useEffect(() => {
		getCreditPackageRecords()
	}, [getCreditPackageRecords])

	const onPackageSelected = (event: RadioChangeEvent) => {
		const value = event.target.value as CreditsPackageTypes
		setPackageSelected(value)

		// 5% VAT
		const VAT = (value.amount * 5) / 100;

		// set the total amount and VAT values
		setAmount({
			vat: VAT,
			total: value.amount + VAT
		})
	}

	// Apply Discount
	const handleApplyDiscount = async () => {
		if (packageSelected?.id === 0 || !packageSelected) {
			message.error('Please select a package')
		} else if (!userCouponCode) {
			message.error('Please add coupon code')
		} else {
			const data = {
				couponCode: userCouponCode,
				creditPackageId: packageSelected?.id
			};

			await orgCreditPackageModule.validateCouponCode(data).then((res) => {
				const response = res.data?.data as ValidateCouponCodeType
				message.success(res.data?.message)

				const DiscountCalc = () => {
					const amount = packageSelected?.amount!
					if (response?.discountType === "percentage") {
						//	Calculate discount
						const discountAmount = (response.value / 100) * amount;
						// calculate total amount after discount
						const total = amount - discountAmount
						// caculate VAT
						const VAT = (total * 5) / 100;
						// total amount to be paid after discount and VAT
						const totalWithVat = total + VAT;

						setAmount({
							discount: discountAmount,
							vat: VAT,
							total: totalWithVat
						})
					} else if (response?.discountType === "flat") {
						const discountAmount = response?.value > amount ? amount - 1 : response?.value;
						// calculate total amount after discount
						const total = amount - discountAmount;
						// calculate VAT
						const VAT = (total * 5) / 100;
						// total amount to be paid after discount and VAT
						const totalWithVat = total + VAT;

						setAmount({
							discount: discountAmount,
							vat: VAT,
							total: totalWithVat
						})
					}
				}

				// call discount function
				DiscountCalc()
				// close the error message
				handleAlertClose()
			}).catch((err) => {
				handleErrors(err)
				form.setFieldsValue({ couponCode: '' })
			})
		}

	}

	// Remove the Discount
	const handleRemoveDiscount = () => {
		setUserCouponCode('')
		form.setFieldsValue({ couponCode: '' })
		const amount = packageSelected?.amount!
		const VAT = (amount * 5) / 100;
		setAmount({
			vat: VAT,
			total: amount + VAT
		})
	}

	const onFinish = (formValues: any) => {
		setRecordData({ ...recordData, buttonLoading: true });

		const data = {
			couponCode: userCouponCode,
			creditPackageId: packageSelected?.id
		}

		orgCreditPackageModule
			.createRecord(data)
			.then((res) => {
				// set count down timer to 3 seconds
				setCount(3)
				reloadTableData();
				setRecordData((prev) => ({ ...prev, buttonLoading: false }));

				// redirect to payment page after 3 seconds
				setInterval(() => {
					window.location.href = `/payment?id=${res.data?.data.id}`
					onCancel()
				}, 3000)
			})
			.catch((err) => {
				handleErrors(err);
				setRecordData((prev) => ({ ...prev, buttonLoading: false }));
			});
	};

	useEffect(() => {
		if (count > 0) {
			setTimer(setTimeout(() => setCount(count - 1), 1000));
		} else {
			clearTimeout(timer);
		}
	}, [count]);

	return (
		<CustomModal
			visible={openModal}
			closable={true}
			onCancel={onCancel}
			titleText={type === "edit" ? "Edit Order" : "Add New Order"}
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

					<div className="mb-4">
						<Radio.Group name="package">
							{recordData?.data?.map((item: CreditsPackageTypes) => (
								<label key={item.id}>
									<div className={`${componentStyles.orderItem} ${(packageSelected?.id === item.id) ? componentStyles.selected : ''}`}>
										<div className="py-2 d-flex">
											<Radio value={item} onChange={onPackageSelected} className='my-auto pr-3'>
											</Radio>
											<div className="my-auto">
												<span className="color-dark-main font-size-lg">{item.localization.map((ele) => ele.title)}</span>
												<p className="color-dark-sub font-size-sm mb-1">
													{item.localization.map((ele) => ele.description)}
												</p>
											</div>
											<div
												className="ml-auto mr-0 pr-2 my-auto"
												style={{ textAlign: 'right' }}
											>
												<span className="font-size-sm">
													{item.credits} Credits {item.packageType === 'monthly' ? '/per month' : ''}
												</span>
												<p className="font-size-md color-dark-main mb-0">
													AED {item.amount.toFixed(2)}
												</p>
											</div>
										</div>
									</div>
								</label>
							))}
						</Radio.Group>
					</div>

					<div>
						<Form.Item name="couponCode" rules={[{ required: false }]}>
							<CustomInput
								size="sm"
								label={"Have Coupon?"}
								type="text"
								onChange={(e: FormEvent<HTMLInputElement>) => setUserCouponCode(e.currentTarget.value)}
								disabled={amount?.discount ? true : false}
							/>
						</Form.Item>

						<div className="mt-5 d-flex">
							<CustomButton
								size="normal"
								fontSize="sm"
								type={"primary"}
								onClick={handleApplyDiscount}
								disabled={amount?.discount ? true : false}
							>
								{amount?.discount ? "Coupon Applied" : "Apply Coupon"}
							</CustomButton>

							{amount?.discount && (
								<CustomButton size="normal" fontSize="sm" type="danger" onClick={handleRemoveDiscount}>
									Remove Coupon
								</CustomButton>
							)}
						</div>
					</div>

					<div>
						<div className={componentStyles.total}>
							<p>Order Amount: AED {packageSelected?.amount ? packageSelected?.amount.toFixed(2) : 0}</p>
							<p>Discount Applied: AED {amount?.discount ? amount?.discount.toFixed(2) : 0}</p>
							<p>VAT (5%): AED {amount?.vat ? amount.vat.toFixed(2) : 0}</p>
							<p className="font-size-md color-dark-main">
								Total Amount:  AED {amount?.total ? amount?.total.toFixed(2) : 0}
							</p>
						</div>
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
							disabled={!packageSelected ? true : false}
						>
							{count === 0 ? "Continue" : "Proceeding to payment in " + count}
						</CustomButton>
					</div>
				</Form>
			)
			}
		</CustomModal >
	);
};
