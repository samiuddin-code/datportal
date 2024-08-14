// import { PropertyCategories } from "../../helpers/commonEnums";
import { APIResponseObject } from "../Common/common.interface";

export type PropertyCategoryLocalization = {
    language: string;
    title: string;
    propertyCategoryId: number;
    isDefault: number;
}
export type ProjectTypeType = {
    id: number;
    title: string;
    slug: string;
    isDefault: boolean;
    shouldCloseProject: boolean;
    order: number;
    isPublished: boolean;
    isDeleted: boolean;
    addedDate: Date;
};

export type PropertyCategoryType = {
    id: number;
    slug: any
    isDeleted: boolean;
    isPublished: boolean;
    localization: PropertyCategoryLocalization[];
};

export type PropertyCategoryResponseObject = APIResponseObject & { data: PropertyCategoryType };
export type PropertyCategoryResponseArray = APIResponseObject & {
    data: Array<PropertyCategoryType>;
}
export type ProjectTypeResponseObject = APIResponseObject & { data: ProjectTypeType };
export type ProjectTypeResponseArray = APIResponseObject & {
    data: Array<ProjectTypeType>;
};