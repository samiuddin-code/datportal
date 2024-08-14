import { actionType } from "../commonTypes";
import { ADD_PROPERTIES_DATA, DELETE_PROPERTIES_DATA, EDIT_PROPERTIES_DATA, GET_PROPERTIES_NUMBER, GET_PROPERTY_DATA_BY_ID, SET_PROPERTIES_DATA } from "./types";
const initialState = {
  propertiesData: { data: [], loading: false, error: false, errorData: {} },
  addPropertiesData: { data: [], loading: false, error: false, errorData: {} },
  editPropertiesData: { data: [], loading: false, error: false, errorData: {} },
  deletePropertiesData: { data: [], loading: false, error: false, errorData: {} },
  propertyDataById: { data: [], loading: false, error: false, errorData: {} },
  propertiesNumber: { data: [], loading: false, error: false, errorData: {} },
};
export default function propertiesReducer(
  state = initialState,
  action: actionType
) {
  switch (action.type) {
    case SET_PROPERTIES_DATA:
      return { ...state, propertiesData: action.payload };
    case ADD_PROPERTIES_DATA:
      return { ...state, addPropertiesData: action.payload };
    case EDIT_PROPERTIES_DATA:
      return { ...state, editPropertiesData: action.payload };
    case DELETE_PROPERTIES_DATA:
      return { ...state, deletePropertiesData: action.payload };
    case GET_PROPERTY_DATA_BY_ID:
      return { ...state, propertyDataById: action.payload };
    case GET_PROPERTIES_NUMBER:
      return { ...state, propertiesNumber: action.payload };
    default:
      return state;
  }
}
