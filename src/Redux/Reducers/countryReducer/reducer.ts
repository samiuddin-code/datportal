import { actionType } from "../commonTypes";
import { ADD_COUNTRY_DATA, DELETE_COUNTRY_DATA, EDIT_COUNTRY_DATA, SET_COUNTRY_DATA } from "./types";
const initialState = {
  countryData: { data: [], loading: false, error: false, errorData: {} },
  addCountryData: { data: [], loading: false, error: false, errorData: {} },
  editCountryData: { data: [], loading: false, error: false, errorData: {} },
  deleteCountryData: { data: [], loading: false, error: false, errorData: {} },
};
export default function countryReducer(
  state = initialState,
  action: actionType
) {
  switch (action.type) {
    case SET_COUNTRY_DATA:
      return { ...state, countryData: action.payload };
    case ADD_COUNTRY_DATA:
      return { ...state, addCountryData: action.payload };
    case EDIT_COUNTRY_DATA:
      return { ...state, editCountryData: action.payload };
    case DELETE_COUNTRY_DATA:
      return { ...state, deleteCountryData: action.payload };
    default:
      return state;
  }
}
