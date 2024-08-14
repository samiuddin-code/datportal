import { APIResponseObject } from "../Common/common.interface";

export type ProjectComponentsType = {
	id:          number;
    title:       string;
    slug:        string;
    isPublished: boolean;
    isDeleted:   boolean;
    addedDate:   Date | string;
};

export type ProjectComponentsResponseObject = APIResponseObject & { data: ProjectComponentsType };
export type ProjectComponentsResponseArray = APIResponseObject & {
	data: Array<ProjectComponentsType>;
};
