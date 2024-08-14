import { actionType } from "../commonTypes";
import {
	ADD_AREA_UNIT_DATA,
	SET_AREA_UNIT_DATA,
	SET_AREA_UNIT_DROPDOWN_DATA,
	EDIT_AREA_UNIT_DATA,
	DELETE_AREA_UNIT_DATA,
	GET_SINGLE_AREA_UNIT_DATA
} from "./types";
const initialState = {
	areaUnitData: { data: [], loading: false, error: false, errorData: {} },
	addAreaUnitData: { data: [], loading: false, error: false, errorData: {} },
	editAreaUnitData: { data: [], loading: false, error: false, errorData: {} },
	deleteAreaUnitData: { data: [], loading: false, error: false, errorData: {} },
	singleAreaUnitData: { data: [], loading: false, error: false, errorData: {} },
	areaUnitDropdown: [],
};
export default function areaUnitReducer(
	state = initialState,
	action: actionType
) {
	switch (action.type) {
		case SET_AREA_UNIT_DATA:
			return { ...state, areaUnitData: action.payload };
		case ADD_AREA_UNIT_DATA:
			return { ...state, addAreaUnitData: action.payload };
		case EDIT_AREA_UNIT_DATA:
			return { ...state, editAreaUnitData: action.payload };
		case DELETE_AREA_UNIT_DATA:
			return { ...state, deleteAreaUnitData: action.payload };
		case SET_AREA_UNIT_DROPDOWN_DATA:
			return { ...state, areaUnitDropdown: action.payload };
		case GET_SINGLE_AREA_UNIT_DATA:
			return { ...state, singleAreaUnitData: action.payload };
		default:
			return state;
	}
}
