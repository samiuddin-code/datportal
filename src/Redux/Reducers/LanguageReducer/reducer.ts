import { actionType } from "../commonTypes";
import {
	ADD_LANGUAGE_DATA,
	SET_LANGUAGE_DATA,
	SET_LANGUAGE_DROPDOWN_DATA,
	GET_SINGLE_LANGUAGE_DATA,
	DELETE_LANGUAGE_DATA,
	EDIT_LANGUAGE_DATA,
} from "./types";
const initialState = {
	languageData: { data: [], loading: false, error: false, errorData: {} },
	addLanguageData: { data: [], loading: false, error: false, errorData: {} },
	editLanguageData: { data: [], loading: false, error: false, errorData: {} },
	deleteLanguageData: { data: [], loading: false, error: false, errorData: {} },
	singleLanguageData: { data: [], loading: false, error: false, errorData: {} },
	languageDropdown: [],
};
export default function languageReducer(state = initialState, action: actionType) {
	switch (action.type) {
		case SET_LANGUAGE_DATA:
			return { ...state, languageData: action.payload };
		case ADD_LANGUAGE_DATA:
			return { ...state, addLanguageData: action.payload };
		case EDIT_LANGUAGE_DATA:
			return { ...state, editLanguageData: action.payload };
		case GET_SINGLE_LANGUAGE_DATA:
			return { ...state, singleLanguageData: action.payload };
		case DELETE_LANGUAGE_DATA:
			return { ...state, deleteLanguageData: action.payload };
		case SET_LANGUAGE_DROPDOWN_DATA:
			return { ...state, languageDropdown: action.payload };
		default:
			return state;
	}
}
