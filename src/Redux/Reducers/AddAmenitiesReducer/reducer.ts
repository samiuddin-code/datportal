import { actionType } from "../commonTypes";
import { GET_AMENITIES_DATA} from "./types";
const initialState = {
  amenitiesData: {
    data: [],
    loading: false,
    error: false,
    errorData: {},
  },
};
export default function AddAmenitiesReducer(
  state = initialState,
  action: actionType
) {
  switch (action.type) {
    case GET_AMENITIES_DATA:
      return { ...state, amenitiesData: action.payload };
    default:
      return state;
  }
}
