import { actionType } from "../commonTypes";
import { ADD_CURRENCY_DATA, SET_CURRENCYDROPDOWN_DATA, SET_CURRENCY_DATA } from "./types";
const initialState = {
  currencyData: { data: [], loading: false, error: false, errorData: {} },
  addCurrencyData: { data: [], loading: false, error: false, errorData: {} },
  currencyDropdown:[]
};
export default function currencyReducer(
  state = initialState,
  action: actionType
) {
  switch (action.type) {
    case SET_CURRENCY_DATA:
      return { ...state, currencyData: action.payload };
    case ADD_CURRENCY_DATA:
      return { ...state, addCurrencyData: action.payload };
    case SET_CURRENCYDROPDOWN_DATA:
      return { ...state, currencyDropdown: action.payload };
    default:
      return state;
  }
}
