export interface APIResponseObject {
	statusCode: number;
	error?: any;
	loading?: boolean;
	buttonLoading?: boolean;
	message: string;
	data?: any;
	meta?: {
		page?: number;
		perPage?: number;
		total?: number;
		pageCount?: number;
	};
}

export interface APIResponseArray {
	statusCode: number;
	error?: any;
	loading?: boolean;
	buttonLoading?: boolean;
	data: Array<any>;
	message: string;
}

export type QueryType<T = any> = { [key in keyof T]?: T[key] } & APIResponseObject['meta'];


/**Common Get Response Type for all modules
 * @param Data Type of the data
 * @param Query Type of the query
 * @example
 * // Response for GET user by id request
 * GetResponseType<UserType, { id: number }>
 */
export type GetResponseTypes<Data = any, Query = QueryType> = {
	data: Data;
	query?: Partial<Query>;
	meta?: APIResponseObject['meta'];
}

/** Get the type of the values of an enum object */
export type TypeFromEnumValues<T extends object> = T[keyof T];

