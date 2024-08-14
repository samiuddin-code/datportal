import { APIResponseObject } from "../Common/common.interface";

export type DepartmentType = {
	id:          number;
    title:       string;
    slug:        string;
    isPublished: boolean;
    isDeleted:   boolean;
    addedDate:   Date | string;
};

export type DepartmentResponseObject = APIResponseObject & { data: DepartmentType };
export type DepartmentResponseArray = APIResponseObject & {
	data: Array<DepartmentType>;
};
