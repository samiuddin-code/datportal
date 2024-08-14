import { APIResponseObject } from "../Common/common.interface";

export type FAQCategoryTypes = {
    id: number;
    slug: string;
    parentId: null;
    isPublished: boolean;
    isDeleted: boolean;
    localization: FAQLocalizationTypes[];
    ChildCategory: ChildCategoryTypes[];
    title: string;
    description: string;
    Faqs: {
        slug: string;
        localization: FAQLocalizationTypes[];
        title: string;
        description: string
    }[]
}

export type ChildCategoryTypes = {
    slug: string;
    localization: FAQLocalizationTypes[];
    _count: CountTypes;
    title: string;
}

export type CountTypes = {
    Faqs: number;
}

export type FAQLocalizationTypes = {
    title: string;
    description: string;
}

export type FAQCategoryTypesResponseObject = APIResponseObject & { data: FAQCategoryTypes };
export type FAQCategoryTypesResponseArray = APIResponseObject & { data: Array<FAQCategoryTypes> };


export type FaqsCategoryParamsTypes = {
    page?: number,
    perPage?: number,
    title?: string,
    isRoot?: boolean,
    parentId?: boolean
}