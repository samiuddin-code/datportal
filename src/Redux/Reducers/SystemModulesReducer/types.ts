// action constants
import { SystemModuleVisibility } from "../../../Modules/SystemModules/types";

export const SET_SYSTEM_MODULES_DATA = "SET_SYSTEM_MODULES_DATA";
export const ADD_SYSTEM_MODULES_DATA = "ADD_SYSTEM_MODULES_DATA";
export const SET_SYSTEM_MODULES_DROPDOWN_DATA = "SET_SYSTEM_MODULES_DROPDOWN_DATA";
export const EDIT_SYSTEM_MODULES_DATA = "EDIT_SYSTEM_MODULES_DATA";
export const DELETE_SYSTEM_MODULES_DATA = "DELETE_SYSTEM_MODULES_DATA";
export const GET_SINGLE_SYSTEM_MODULES_DATA = "GET_SINGLE_SYSTEM_MODULES_DATA";

// types
export type SystemModule = {
	id: number;
	name: string;
	slug: string;
	icon: string;
	isMenuItem: boolean;
	order: number;
	url: string;
	description: string;
	visibility: SystemModuleVisibility;
};