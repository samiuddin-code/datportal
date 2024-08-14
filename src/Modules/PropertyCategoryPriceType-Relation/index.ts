import apiInstance from "../../services/axiosInstance";
import { PropertyCatTypePriceRelationType } from "./types";

/** Property Category Price Type Relation Module*/
export class Property_Cat_Type_Price_Relation_Module {
	private readonly endPoint = 'category-type-price-relation'

	getAllRecords = () => {
		return apiInstance.get(this.endPoint);
	};

	getRecordByCategoryAndTypeId = (categoryId: number, typeId: number) => {
		return apiInstance.get(`${this.endPoint}/${categoryId}/${typeId}`);
	}

	createRecord = (data: {
		categoryId: number,
		typeId: number,
		priceTypeIds: number[]
	}) => {
		return apiInstance.post(this.endPoint + "/", data);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/${id}`);
	};

	deleteRecordByCategoryAndTypeId = (categoryId: number, typeId: number) => {
		return apiInstance.delete(`${this.endPoint}/${categoryId}/${typeId}`);
	};

	updateRecord = (data: Partial<PropertyCatTypePriceRelationType>) => {
		return apiInstance.patch(`${this.endPoint}`, data);
	};

	/** delete multiple records */
	deleteMultipleRecords = (data: {
		categoryId: number,
		typeId: number,
		priceTypeIds: number[]
	}) => {
		return apiInstance.delete(`${this.endPoint}/removeMultiple/${data.categoryId}/${data.typeId}`, {
			params: { priceTypeIds: data.priceTypeIds },
		});
	};
}
