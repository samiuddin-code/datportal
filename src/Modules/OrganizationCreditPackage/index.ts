import apiInstance from "../../services/axiosInstance";
import { OrganizationCreditPackageTypes } from "./types";

export class OrgCreditsPackageModule {
	private readonly endPoint = "organization-credit-package";

	// create organization credit package
	createRecord = (data: Partial<OrganizationCreditPackageTypes>) => {
		return apiInstance.post(this.endPoint + "/", data);
	};

	// credits top up
	createTopUp = (data: Partial<OrganizationCreditPackageTypes>) => {
		return apiInstance.post(`${this.endPoint}/topup-credits`, data);
	};

	/**create payment link using the order id or used to retrieve 
	 * the payment link and the corresponding data for the order */
	createPaymentLinkById = (orderId: number) => {
		return apiInstance.post(
			`${this.endPoint}/generate-payment-link/${orderId}`
		);
	};

	/** find my subscriptions data */
	getAllRecords = () => {
		return apiInstance.get(`${this.endPoint}/find-my-subscriptions`);
	};

	/** get all organization subscriptions */
	getAllOrgSubscriptions = (queryData?: any) => {
		return apiInstance.get(`${this.endPoint}/findAll`, { params: queryData });
	};

	// get credit package by id
	getRecordById = (id: number) => {
		return apiInstance.get(`${this.endPoint}/${id}`);
	};

	// get the packages of the organization by the id
	getOrgPackageById = (id: number) => {
		return apiInstance.get(
			`${this.endPoint}/find-packages-of-organization/${id}`
		);
	};

	/** get my balance */
	getMyBalance = () => {
		return apiInstance.get(`${this.endPoint}/find-my-balance`);
	};

	// submit successful transaction by cart id
	submitTransactionById = (cartId: string) => {
		return apiInstance.post(`${this.endPoint}/submitTelrTransaction/${cartId}`);
	};

	// update credit package by id
	updateRecord = (
		data: Partial<OrganizationCreditPackageTypes>,
		id: number
	) => {
		return apiInstance.patch(`${this.endPoint}/${id}`, data);
	};

	// update credit package subscription by id
	updateSubscriptionById = (id: number) => {
		return apiInstance.get(`${this.endPoint}/unsubscribe/${id}`);
	};

	// validate coupon code
	validateCouponCode = (data: Partial<OrganizationCreditPackageTypes>) => {
		return apiInstance.post(`${this.endPoint}/validate-coupon-code`, data);
	};
}
