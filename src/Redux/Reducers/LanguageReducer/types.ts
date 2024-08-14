// action constants

export const SET_LANGUAGE_DATA = "SET_LANGUAGE_DATA";
export const ADD_LANGUAGE_DATA = "ADD_LANGUAGE_DATA";
export const SET_LANGUAGE_DROPDOWN_DATA = "SET_LANGUAGE_DROPDOWN_DATA";
export const EDIT_LANGUAGE_DATA = "EDIT_LANGUAGE_DATA";
export const DELETE_LANGUAGE_DATA = "DELETE_LANGUAGE_DATA";
export const GET_SINGLE_LANGUAGE_DATA = "GET_SINGLE_LANGUAGE_DATA";

// types
export type Language = {
	id: number;
	name: string;
	code: string;
	nativeName: string;
	isPublished: boolean;
	isDeleted: boolean;
};
