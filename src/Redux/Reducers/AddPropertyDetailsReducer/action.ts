import api from "../../../services/axiosInstance";
import { RootState } from "../../store";
import { dispatchType } from "../commonTypes";
import {
  GET_CATEGORIES_DATA, GET_CATEGORY_BASED_PROPERTY_TYPE, GET_PROPERTY_TYPES, SET_DEFAULT_CATEGORY_ID
} from "./types";

export const getPropertyCategoriesData =
  (callback?: (id: number) => void) =>
    async (dispatch: dispatchType, getState: () => RootState) => {
      const { categories } = getState()["AddPropertyDetailsReducer"];

      let url = `property-category`;
      dispatch({
        type: GET_CATEGORIES_DATA,
        payload: { ...categories, loading: true },
      });
      try {
        const res = await api.get(url);
        const id = res?.data?.data.filter(
          (item: { slug: string }) => item.slug === "residential-for-rent"
        )[0].id;

        dispatch({
          type: SET_DEFAULT_CATEGORY_ID,
          payload: id,
        });
        dispatch({
          type: GET_CATEGORIES_DATA,
          payload: {
            ...categories,
            loading: false,
            data: res?.data?.data,
          },
        });
        dispatch(getCategoryBasedPropertyTypeData(id));

        if (callback) {
          callback(id);
        }
      } catch (error) {
        dispatch({
          type: GET_CATEGORIES_DATA,
          payload: { ...categories, loading: false, errorData: error },
        });
      }
    };

// save the category data in the redux
export const SaveCategoriesData = (data: any) =>
  async (dispatch: dispatchType, getState: () => RootState) => {
    const { categories } = getState()["AddPropertyDetailsReducer"];

    dispatch({
      type: GET_CATEGORIES_DATA,
      payload: {
        ...categories,
        loading: false,
        data
      },
    });
  };

export const getCategoryBasedPropertyTypeData =
  (data: string | number, callback?: () => void) =>
    async (dispatch: dispatchType, getState: () => RootState) => {
      const { categoryBasedPropertyType } =
        getState()["AddPropertyDetailsReducer"];

      let url = `type-category-relation/${data}`;
      dispatch({
        type: GET_CATEGORY_BASED_PROPERTY_TYPE,
        payload: { ...categoryBasedPropertyType, loading: true },
      });
      try {
        const res = await api.get(url);
        dispatch({
          type: GET_CATEGORY_BASED_PROPERTY_TYPE,
          payload: {
            ...categoryBasedPropertyType,
            loading: false,
            data: res?.data?.data,
          },
        });
        callback && callback();
      } catch (error) {
        dispatch({
          type: GET_CATEGORY_BASED_PROPERTY_TYPE,
          payload: {
            ...categoryBasedPropertyType,
            loading: false,
            errorData: error,
          },
        });
      }
    };
export const getPropertyTypesData =
  (data?: string, callback?: () => void) =>
    async (dispatch: dispatchType, getState: () => RootState) => {
      const { propertyTypes } = getState()["AddPropertyDetailsReducer"];

      let url = `property-type`;
      dispatch({
        type: GET_PROPERTY_TYPES,
        payload: { ...propertyTypes, loading: true },
      });
      try {
        const res = await api.get(url);
        dispatch({
          type: GET_PROPERTY_TYPES,
          payload: {
            ...propertyTypes,
            loading: false,
            data: res?.data?.data,
          },
        });
        callback && callback();
      } catch (error) {
        dispatch({
          type: GET_PROPERTY_TYPES,
          payload: {
            ...propertyTypes,
            loading: false,
            errorData: error,
          },
        });
      }
    };
