import { APIResponseObject } from "../Common/common.interface";

export type PermissionsType = {
	id: number;
	name?: string;
	action: string;
	icon?: string;
	moduleId: number;
	//TODO: add types for condition
	condition: any;
	url?: string;
	isMenuItem: boolean;
	order: number;
	description?: string;
	visibility: string;
};

export type RolePermissionsType = {
	id: number;
	addedDate: Date;
	addedBy: number | null;
	roleId: number;
	permissionsId: number;
};

export type PermissionsResponseObject = APIResponseObject & { data: PermissionsType };
export type PermissionsResponseArray = APIResponseObject & { data: Array<PermissionsType> };
