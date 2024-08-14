import { actionType } from "../commonTypes";
import {
	ADD_SYSTEM_MODULES_DATA,
	SET_SYSTEM_MODULES_DATA,
	SET_SYSTEM_MODULES_DROPDOWN_DATA,
	EDIT_SYSTEM_MODULES_DATA,
	DELETE_SYSTEM_MODULES_DATA,
	GET_SINGLE_SYSTEM_MODULES_DATA,
} from "./types";

const initialState = {
	systemModulesData: { data: [], loading: false, error: false, errorData: {} },
	addSystemModuleData: { data: [], loading: false, error: false, errorData: {} },
	editSystemModuleData: { data: [], loading: false, error: false, errorData: {} },
	deleteSystemModuleData: { data: [], loading: false, error: false, errorData: {} },
	singleSystemModuleData: { data: [], loading: false, error: false, errorData: {} },
	systemModuleDropdown: [],
};

export default function systemModulesReducer(state = initialState, action: actionType) {
	switch (action.type) {
		case SET_SYSTEM_MODULES_DATA:
			return { ...state, systemModulesData: action.payload };
		case ADD_SYSTEM_MODULES_DATA:
			return { ...state, addSystemModuleData: action.payload };
		case EDIT_SYSTEM_MODULES_DATA:
			return { ...state, editSystemModuleData: action.payload };
		case DELETE_SYSTEM_MODULES_DATA:
			return { ...state, deleteSystemModuleData: action.payload };
		case GET_SINGLE_SYSTEM_MODULES_DATA:
			return { ...state, singleSystemModuleData: action.payload };
		case SET_SYSTEM_MODULES_DROPDOWN_DATA:
			return { ...state, systemModuleDropdown: action.payload };
		default:
			return state;
	}
}
