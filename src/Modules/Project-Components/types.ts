import { APIResponseObject } from "../Common/common.interface";

export type ProjectComponentType = {
    id: number;
    title: string;
    slug: string;
    isPublished: boolean;
    isDeleted: boolean;
    addedDate: string;
};

export type ProjectComponentResponseObject = APIResponseObject & { data: ProjectComponentType };
export type ProjectComponentResponseArray = APIResponseObject & {
    data: Array<ProjectComponentType>;
};
