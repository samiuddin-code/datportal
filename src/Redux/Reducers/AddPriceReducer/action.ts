import api from "../../../services/axiosInstance";
import { RootState } from "../../store";
import { dispatchType } from "../commonTypes";
import {
  GET_CATEGORY_TYPE_PRICE_RELATION, SET_PRICE
} from "./types";

export const getCategoryTypePriceRelationData =
  (categoryId: string | number, typeId: string | number, callback?: () => void) =>
    async (dispatch: dispatchType, getState: () => RootState) => {
      const { categoryTypePriceRelationData } = getState()["AddPriceReducer"];

      let url = `category-type-price-relation/${categoryId}/${typeId}`;
      dispatch({
        type: GET_CATEGORY_TYPE_PRICE_RELATION,
        payload: { ...categoryTypePriceRelationData, loading: true },
      });
      try {
        const res = await api.get(url);
        let fixedData: any[] = [];
        let splitPriceData: any[] = [];
        res?.data?.data.forEach((item: { priceType: { slug: string } }) => {
          if (item.priceType.slug === "fixed") {
            fixedData = [...fixedData, item];
          } else {
            splitPriceData = [...splitPriceData, item];
          }
        });
        dispatch({
          type: GET_CATEGORY_TYPE_PRICE_RELATION,
          payload: {
            ...categoryTypePriceRelationData,
            loading: false,
            data: { fixedData, splitPriceData },
          },
        });
        callback && callback();

      } catch (error) {
        dispatch({
          type: GET_CATEGORY_TYPE_PRICE_RELATION,
          payload: {
            ...categoryTypePriceRelationData,
            loading: false,
            errorData: error,
          },
        });
      }
    };

export const setPrice = (data: any, type: string) => (dispatch: dispatchType) => {
  switch (type) {
    case "fixed": {
      dispatch({
        type: SET_PRICE,
        payload: { fixedData: data?.fixedData },
      });
      break;
    }
    case "split": {
      dispatch({
        type: SET_PRICE,
        payload: { splitPriceData: data?.splitPriceData },
      });
      break;
    }
    default:
      break;
  }
}
