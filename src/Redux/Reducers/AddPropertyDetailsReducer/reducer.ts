import { actionType } from "../commonTypes";
import { GET_CATEGORIES_DATA, GET_CATEGORY_BASED_PROPERTY_TYPE, GET_PROPERTY_TYPES, SET_DEFAULT_CATEGORY_ID} from "./types";
const initialState = {
  categories: { data: [], loading: false, error: false, errorData: {} },
  categoryBasedPropertyType: { data: [], loading: false, error: false, errorData: {} },
  defaultCategoryId:0,
  propertyTypes:{ data: [], loading: false, error: false, errorData: {} }
};
export default function AddPropertyDetailsReducer(
  state = initialState,
  action: actionType
) {
  switch (action.type) {
    case GET_CATEGORIES_DATA:
      return { ...state, categories: action.payload };
    case GET_CATEGORY_BASED_PROPERTY_TYPE:
      return { ...state, categoryBasedPropertyType: action.payload };
    case SET_DEFAULT_CATEGORY_ID:
      return { ...state, defaultCategoryId: action.payload };
    case GET_PROPERTY_TYPES:
      return { ...state, propertyTypes: action.payload };
    default:
      return state;
  }
}
