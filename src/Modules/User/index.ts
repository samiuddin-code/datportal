import axios from "axios";
import apiInstance, { BASE_URL } from "@services/axiosInstance";
import { UserDetailsType, UserTypes } from "./types";
import { FormDataHeader } from "../Common/config";
import { dashboardPermissionsSet } from "./permissions";

export class UserModule {
	private readonly endPoint = "user";

	/** Available permissions for dashboard  */
	protected dashboardPermissionsSet = dashboardPermissionsSet

	/** Check the permissions of the currently logged in user */
	getPermissions = (queryData: { slugs: string[] }, readOrganization: boolean = true) => {
		if (readOrganization) {
			queryData.slugs = [...queryData.slugs, ...this.dashboardPermissionsSet];
		} else {
			queryData.slugs = [...queryData.slugs];
		}
		return apiInstance.get(`${this.endPoint}/check-user-permissions`, { params: queryData });
	}

	getAllRecords = (queryData?: any) => {
		return apiInstance.get<{ data: UserTypes[] }>(this.endPoint, { params: queryData });
	};

	getAgents = (queryData?: any) => {
		return axios.get(`${BASE_URL}${this.endPoint}/find-agents`, { params: queryData });
	};

	getRecordById = <ReturnDataType = any>(id: number) => {
		return apiInstance.get<{ data: ReturnDataType | UserDetailsType }>(`${this.endPoint}/${id}?all=true`);
	};

	getLoggedInUser = () => {
		return apiInstance.get(`${this.endPoint}/me?roles=true`);
	};

	/** Get user profile overview scores based on what details is completed */
	getUserProfileScores = () => {
		return apiInstance.get(`${this.endPoint}/meWithScores`);
	}

	/** Get Dashboard Stats Data */
	getDashboardStats = () => {
		return apiInstance.get(`${this.endPoint}/dashboard`);
	}
	/** Get Dashboard Stats Data */
	getMyDashboardElements = () => {
		return apiInstance.get(`${this.endPoint}/getMyDashboardElements`);
	}

	/** Get Yallah Dashboard Stats Data */
	getYallahDashboardStats = () => {
		return apiInstance.get(`${this.endPoint}/yallahDashboard`);
	}

	createRecord = (data: FormData | Partial<UserTypes>) => {
		return apiInstance.post(this.endPoint + "/", data, { headers: FormDataHeader });
	};

	updateRecord = (data: FormData | Partial<UserTypes>, id: number) => {
		return apiInstance.patch(`${this.endPoint}/${id}`, data, { headers: FormDataHeader });
	};

	/** Update currently logged in user profile */
	updateMe = (data: FormData | Partial<UserTypes>) => {
		return apiInstance.patch(`${this.endPoint}/update-me`, data, { headers: FormDataHeader });
	}
	/** Update currently logged in user profile */
	updateSalary = (data: { amount: number, startDate: string }, id: number) => {
		return apiInstance.patch(`${this.endPoint}/updateSalary/${id}`, data);
	}
	/** Update currently logged in user profile */
	uploadUserDocuments = (data: FormData) => {
		return apiInstance.post(`${this.endPoint}/uploadUserDocuments`, data, { headers: FormDataHeader });
	}
	updateUserDocument = (data: { title: string, documentType: string, documentId: number }) => {
		return apiInstance.patch(`${this.endPoint}/updateUserDocument`, data);
	}
	deleteUserDocument = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/deleteUserDocument/${id}`);
	}

	/**Update User Meta Data */
	updateUserMeta = (data: {
		userMeta: Array<{ key: string, value: string }> | undefined;
	}, id: number) => {
		return apiInstance.patch(`${this.endPoint}/update-meta/${id}`, data);
	}

	deleteRecord = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/${id}`);
	};

	/** Add roles to user
	 * @param {number} id - The id of the user
	 * @param {number[]} data.roleIds - The ids of the roles
	 */
	addRoles = (data: { roleIds: number[] }, id: number) => {
		return apiInstance.post(`${this.endPoint}/addUserRole/${id}`, data);
	}

	/**
	 * Remove roles from user
	 * @param {number} id - The id of the user
	 * @param {number[]} data.roleIds - The ids of the roles
	 */
	removeRoles = (data: { roleIds: number[] }, id: number) => {
		return apiInstance.patch(`${this.endPoint}/removeUserRole/${id}`, data);
	}

	/** Add country access to user
	 * @param {number} data.userId - The id of the user
	 * @param {number[]} data.userCountryList - The ids of the country
	 */
	addCountryAccess = (data: { userCountryList: number[], userId: number }) => {
		return apiInstance.post(`${this.endPoint}/addUserCountry`, data);
	}

	/**
	 * Remove  country access from user
	 * @param {number} data.userId - The id of the user
	 * @param {number[]} data.userCountryList - The ids of the country
	 */
	removeCountryAccess = (data: { userCountryList: number[], userId: number }) => {
		return apiInstance.post(`${this.endPoint}/removeUserCountry`, data);
	}

	/** Get Active Users or Login History */
	getActiveUsers = (queryData?: any) => {
		return apiInstance.get(`${this.endPoint}/findAuthTokensIssued`, { params: queryData });
	}

	/** Manual Action */
	manualAction = (data: { message: string, value: number }, id: number) => {
		return apiInstance.patch(`${this.endPoint}/manualAction/${id}`, data);
	}
}
