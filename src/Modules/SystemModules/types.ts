import { APIResponseObject } from "../Common/common.interface";
import { PermissionsType } from "../Permissions/types";

export type SystemModulesType = {
	id: number;
	name: string;
	description?: string;
	slug: string;
	icon: string | null;
	isDeleted: boolean;
	isPublished: boolean;
	Permissions: Array<PermissionsType>;
};

export enum SystemModuleVisibility {
	"Organization" = "organization",
	"System" = "system",
}

export type SystemModulesResponseObject = APIResponseObject & { data: SystemModulesType };
export type SystemModulesResponseArray = APIResponseObject & { data: Array<SystemModulesType> };
