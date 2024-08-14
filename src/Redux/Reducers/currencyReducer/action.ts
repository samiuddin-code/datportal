
import api from "../../../services/axiosInstance"
import { RootState } from "../../store";
import { dispatchType } from "../commonTypes";
import { ADD_CURRENCY_DATA, SET_CURRENCYDROPDOWN_DATA, SET_CURRENCY_DATA } from "./types";


export const getCurrencyData = (callback?: (() => void) ) => async(dispatch:dispatchType,getState: () => RootState) => {
    const { currencyData } = getState()["currencyReducer"];
    dispatch({
      type: SET_CURRENCY_DATA,
      payload: { ...currencyData ,loading:true},
    });
    try {
        const res = await api.get("currency");
        dispatch({
          type: SET_CURRENCY_DATA,
          payload: { ...currencyData, loading: false, data: res?.data?.data },
        });
        dispatch({
          type: SET_CURRENCYDROPDOWN_DATA,
          payload: res?.data?.data.map((item: { id: string; name: string; symbol: string; }) => ({
            value: item.id,
            label: `${item.name}(${item.symbol})`,
          })),
        });
        callback&&callback();
    } catch (error) {
       dispatch({
         type: SET_CURRENCY_DATA,
         payload: { ...currencyData, loading: false, errorData: error },
       }); 
    }
};
export const addCurrencyData =
  (data: any, callback?: () => void) =>
  async (dispatch: dispatchType, getState: () => RootState) => {
    const { addCurrencyData } = getState()["currencyReducer"];
    dispatch({
      type: ADD_CURRENCY_DATA,
      payload: { ...addCurrencyData, loading: true },
    });
    try {
      const res = await api.post("currency", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      dispatch({
        type: ADD_CURRENCY_DATA,
        payload: { ...addCurrencyData, loading: false, data: res?.data?.data },
      });
      callback && callback();
    } catch (error) {
      dispatch({
        type: ADD_CURRENCY_DATA,
        payload: { ...addCurrencyData, loading: false, errorData: error },
      });
    }
  };