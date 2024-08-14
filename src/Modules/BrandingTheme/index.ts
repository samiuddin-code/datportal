import { GetResponseTypes } from "@modules/Common/common.interface";
import apiInstance from "@services/axiosInstance";
import { BrandingThemeType } from "./types";

export class BrandingThemeModule {
	private readonly endPoint = "branding-theme";

	/** Get All Records */
	getAllRecords = <Type extends GetResponseTypes<BrandingThemeType[]>>(query?: Type['query']) => {
		return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint, { params: query });
	};

	/** Get Record By Id */
	getRecordById = <Type extends GetResponseTypes<BrandingThemeType>>(id: number) => {
		return apiInstance.get<Exclude<Type, 'query'>>(`${this.endPoint}/${id}`);
	};

	/** Delete Record By Id */
	deleteRecord = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/${id}`);
	};

	/** Create Record */
	createRecord = (data: Partial<BrandingThemeType>) => {
		return apiInstance.post(this.endPoint, data);
	};

	/** Update Record */
	updateRecord = (data: Partial<BrandingThemeType>, id: number) => {
		return apiInstance.patch(`${this.endPoint}/${id}`, data);
	};
}