import { APIResponseObject } from "../Common/common.interface";

export type AuthoritiesType = {
	id:          number;
    title:       string;
    slug:        string;
    isPublished: boolean;
    isDeleted:   boolean;
    addedDate:   Date | string;
};

export type AuthoritiesResponseObject = APIResponseObject & { data: AuthoritiesType };
export type AuthoritiesResponseArray = APIResponseObject & {
	data: Array<AuthoritiesType>;
};
