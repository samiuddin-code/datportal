import { actionType } from "../commonTypes";
import { GET_CATEGORY_TYPE_PRICE_RELATION, SET_PRICE } from "./types";
const initialState = {
  categoryTypePriceRelationData: {
    data: { fixedData: [], splitPriceData: [] },
    loading: false,
    error: false,
    errorData: {},
  },
  price: {
    fixedData: { price: 0, yearlyService: 0 },
    splitPriceData: [],
  },
};
export default function AddPriceReducer(
  state = initialState,
  action: actionType
) {
  switch (action.type) {
    case GET_CATEGORY_TYPE_PRICE_RELATION:
      return { ...state, categoryTypePriceRelationData: action.payload };
    case SET_PRICE:
      return { ...state, price: action.payload };
    default:
      return state;
  }
}
