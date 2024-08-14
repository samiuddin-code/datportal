import apiInstance from "../../services/axiosInstance";
import { PropertyTypeCategoryRelationType } from "./types";

export class Property_Type_Category_Relation_Module {
	private readonly endPoint = "type-category-relation";

	getAllRecords = () => {
		return apiInstance.get(this.endPoint);
	};

	getRecordById = (id: number) => {
		return apiInstance.get(`${this.endPoint}/${id}`);
	};

	/** get category with category id and type id */
	getRecordByCategoryIdAndTypeId = (categoryId: number, typeId: number) => {
		return apiInstance.get(`${this.endPoint}/${categoryId}/${typeId}`);
	};

	/** get property type, category relation by category id */
	getRecordByCategoryId = (categoryId: number) => {
		return apiInstance.get(`${this.endPoint}/property-type-by-category/${categoryId}`);
	};

	createRecord = (data: PropertyTypeCategoryRelationType) => {
		return apiInstance.post(this.endPoint + "/", data);
	};

	updateRecord = (data: Partial<PropertyTypeCategoryRelationType>) => {
		return apiInstance.patch(`${this.endPoint}`, data);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/${id}`);
	};

	/** delete category and type relation */
	deleteCategoryAndTypeRelation = (categoryId: number, typeId: number) => {
		return apiInstance.delete(`${this.endPoint}/${categoryId}/${typeId}`);
	};

	//TODO: Multiple delete

	/** delete multiple records */
	deleteMultipleRecords = (categoryId: number, typeIds: number[]) => {
		return apiInstance.delete(`${this.endPoint}/removeMultiple/${categoryId}`, {
			params: typeIds,
		});
	};
}
