import { GetResponseTypes } from "@modules/Common/common.interface";
import apiInstance from "@services/axiosInstance";
import { ProductType } from "./types";

export class ProductModule {
	private readonly endPoint = "product";

	/** Get All Records */
	getAllRecords = <Type extends GetResponseTypes<ProductType[]>>(query?: Type['query']) => {
		return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint, { params: query });
	};

	/**Find published client records
	* @param slug - product slug
	*/
	findByCode = <Type extends GetResponseTypes<ProductType[]>>(slug: string) => {
		return apiInstance.get<Exclude<Type, 'query'>>(`${this.endPoint}/find-by-product-code/${slug}`);
	}

	/** Get Record By Id
	 * @param id - Product id
	 */
	getRecordById = <Type extends GetResponseTypes<ProductType>>(id: number) => {
		return apiInstance.get<Exclude<Type, 'query'>>(`${this.endPoint}/${id}`);
	};

	/** Delete Record By Id
	 * @param id - Product id
	 */
	deleteRecord = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/${id}`);
	};

	/** Create Record 
	 * @param data - Product data
	*/
	createRecord = (data: Partial<ProductType>) => {
		return apiInstance.post(this.endPoint, data);
	};

	/** Update Record
	 * @param data - Product data
	 */
	updateRecord = (data: Partial<ProductType>, id: number) => {
		return apiInstance.patch(`${this.endPoint}/${id}`, data);
	};
}