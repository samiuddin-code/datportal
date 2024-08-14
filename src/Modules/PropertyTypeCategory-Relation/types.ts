import { APIResponseObject } from "../Common/common.interface";

export type PropertyTypeCategoryRelationLocalization = {
	language: string;
	title: string;
};

export type PropertyTypeCategoryRelationType = {
	categoryId: number;
	typeId: number;
	bedroom: boolean;
	bathroom: boolean;
	livingRoom: boolean;
	completionStatus: boolean;
	buildArea: boolean;
	plotSize: boolean;
	type: {
		localization: PropertyTypeCategoryRelationLocalization[];
	};
	category: {
		localization: PropertyTypeCategoryRelationLocalization[];
	};
};

export type PropertyTypeCategoryRelationResponseObject = APIResponseObject & {
	data: PropertyTypeCategoryRelationType;
};

export type PropertyTypeCategoryRelationResponseArray = APIResponseObject & {
	data: Array<PropertyTypeCategoryRelationType>;
};
