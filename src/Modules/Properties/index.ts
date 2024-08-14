import apiInstance from "../../services/axiosInstance";
import { FormDataHeader } from "../Common/config";
import { PropertiesType, PROPERTIES_QUERY_TYPES, PropertyDealTypes } from "./types";

/** Properties Module */
export class PropertiesModule {
	private readonly endPoint = "property";

	getAllRecords = (queryData?: Partial<PROPERTIES_QUERY_TYPES>) => {
		return apiInstance.get(this.endPoint, { params: queryData });
	};

	getRecordById = (id: number | string) => {
		return apiInstance.get(`${this.endPoint}/findOneById/${id}`);
	};

	/**
	 *  Get Record By Slug 
	 * @param slug - slug of the property
	 */
	getRecordBySlug = (slug: string) => {
		return apiInstance.get(`${this.endPoint}/${slug}`);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/${id}`);
	};

	createRecord = (data: FormData | PropertiesType) => {
		return apiInstance.post(this.endPoint + "/", data, { headers: FormDataHeader });
	};

	updateRecord = (data: FormData | Partial<PropertiesType>, id: number) => {
		return apiInstance.patch(`${this.endPoint}/update-property/${id}`, data, {
			headers: FormDataHeader
		});
	};

	// Publish Property
	publishRecord = (data: {
		packageId: number;
		couponCode: string;
		propertyId: number;
	}) => {
		return apiInstance.patch(`${this.endPoint}/publish-property`, data);
	};

	// Unpublish Property by Id
	unpublishRecord = (data: { reason: string; message: string }, id: number) => {
		return apiInstance.patch(`${this.endPoint}/unpublish-property/${id}`, data);
	};

	/**Verify Title Deed */
	verifyTitleDeed = (data: { titleDeed: number }, id: number) => {
		return apiInstance.patch(`${this.endPoint}/verifyTitleDeed/${id}`, data);
	}

	/**
	 * Verify Property Documents
	 * @param data - data to be updated
	 * @param id - id of the document
	 */
	verifyPropertyDocuments = (data: { status: number, comments: string }, id: number) => {
		return apiInstance.patch(`${this.endPoint}/verify-document/${id}`, data);
	}

	/** Get Property Logs */
	getLogs = (id: number | string) => {
		return apiInstance.get(`${this.endPoint}/logs/${id}`);
	}

	/** Auto Renew
	 * @param id - id of the transaction
	 */
	autoRenew = (autoRenew: boolean, id: number) => {
		return apiInstance.patch(`${this.endPoint}/autoRenewListing/${id}`, { autoRenew });
	}

	/**
	 * Update SEO
	 * @param data - data to be updated
	 * @param id - id of the property
	 */
	updateSEO = (data: { seoTitle: string; seoDescription: string; }, id: number) => {
		return apiInstance.post(`${this.endPoint}/update-seo/${id}`, data);
	}

	/**
	 * Update dynamic SEO
	 * @param data - data to be updated
	 * @param id - id of the property
	 */
	updateDynamicSEO = (data: { isDynamic: boolean }, id: number) => {
		return apiInstance.post(`${this.endPoint}/update-dynamic-seo/${id}`, data);
	}

	/**
	 * Update Assured Property
	 * @param data - data to be updated
	 * @param id - id of the property
	 * */
	updateAssuredProperty = (data: { assured: boolean }, id: number) => {
		return apiInstance.patch(`${this.endPoint}/updateAssured/${id}`, data);
	}

	/**
	 * Update Images Order
	 * @param data - data to be updated
	 * @param id - id of the property
	 * */
	updateImagesOrder = (data: { orderIds: number[] }, id: number) => {
		return apiInstance.patch(`${this.endPoint}/updateImagesOrder/${id}`, data);
	}

	assignProperty = (data: { assignedToId: number }, id: number) => {
		return apiInstance.patch(`${this.endPoint}/assignProperty/${id}`, data);
	}

	/** Get All Property Documents
	 * @param queryData - query params
	*/
	getAllPropertyDocuments = (queryData?: any) => {
		return apiInstance.get(`${this.endPoint}/property-documents`, { params: queryData });
	}

	/** Get Property Documents By Id 
	 * @param id - id of the property
	*/
	getPropertyDocumentsById = (id: number) => {
		return apiInstance.get(`${this.endPoint}/get-property-documents/${id}`);
	}

	/**
	 * Reject Property
	 * @param data.message - reason for rejecting the property
	 * @param id - id of the property
	 */
	rejectProperty = (data: { message: string }, id: number) => {
		return apiInstance.post(`${this.endPoint}/rejectProperty/${id}`, data);
	}

	/** Manual Action */
	manualAction = (data: { message: string, value: number }, id: number) => {
		return apiInstance.patch(`${this.endPoint}/manualAction/${id}`, data);
	}
}

/** Property Deals Module */
export class PropertyDealsModule {
	private readonly endPoint = "property-deals";

	/**
	 * Get All Records
	 * @param queryData - query params
	 */
	getAllRecords = (queryData?: any) => {
		return apiInstance.get(this.endPoint, { params: queryData });
	};

	/** Get Property deal using property id
	 * @param id - property id
	 */
	getRecordById = (id: number) => {
		return apiInstance.get(`${this.endPoint}/findPropertyDeals/${id}`);
	};

	/** Find Published Deals
	 * @param queryData - query params
	 * @param queryData.page - page number
	 * @param queryData.perPage - number of records per page
	 */
	getPublished = (queryData?: { perPage: number; page: number }) => {
		return apiInstance.get(`${this.endPoint}/find-published`, { params: queryData });
	};

	/** Find Published Property Deals
	 * @param queryData - query params
	 * @param queryData.perPage - number of records per page
	 * @param queryData.page - page number
	 */
	getPublishedDeals = (queryData?: { perPage: number; page: number }) => {
		return apiInstance.get(`${this.endPoint}/find-published-deals`, { params: queryData });
	};

	/** Create Property Deal
	 * @param data - data to create property deal
	 */
	createRecord = (data: FormData | PropertyDealTypes) => {
		return apiInstance.post(this.endPoint + "/", data, { headers: FormDataHeader });
	}

	/** Update Property Deal
	 * @param data - data to be updated
	 * @param id - id of the property deal
	 */
	updateRecord = (data: FormData | Partial<PropertyDealTypes>, id: number) => {
		return apiInstance.patch(`${this.endPoint}/${id}`, data, { headers: FormDataHeader });
	}

	/** Delete Property Deal
	 * @param id - id of the property deal
	 * */
	deleteRecord = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/${id}`);
	}
}
