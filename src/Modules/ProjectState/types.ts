import { APIResponseObject } from "../Common/common.interface";

export type ProjectStateType = {
    id: number;
    title: string;
    slug: string;
    isDefault: boolean;
    shouldCloseProject: boolean;
    bgColor: string;
    textColor: string;
    order: number;
    isPublished: boolean;
    isDeleted: boolean;
    addedDate: Date | string;
};

export type ProjectStateResponseObject = APIResponseObject & { data: ProjectStateType };
export type ProjectStateResponseArray = APIResponseObject & {
    data: Array<ProjectStateType>;
};
