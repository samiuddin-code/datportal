import api from "../../../services/axiosInstance";
import { RootState } from "../../store";
import { dispatchType } from "../commonTypes";
import {
	ADD_COUNTRY_DATA,
	DELETE_COUNTRY_DATA,
	EDIT_COUNTRY_DATA,
	SET_COUNTRY_DATA,
} from "./types";

export const getCountryData =
	(callback?: () => void) => async (dispatch: dispatchType, getState: () => RootState) => {
		const { countryData } = getState()["countryReducer"];
		dispatch({
			type: SET_COUNTRY_DATA,
			payload: { ...countryData, loading: true },
		});
		try {
			const res = await api.get("country");
			dispatch({
				type: SET_COUNTRY_DATA,
				payload: { ...countryData, loading: false, data: res?.data?.data },
			});
			callback && callback();
		} catch (error) {
			dispatch({
				type: SET_COUNTRY_DATA,
				payload: { ...countryData, loading: false, errorData: error },
			});
		}
	};
export const deleteCountry =
	(id: string, callback?: () => void) =>
	async (dispatch: dispatchType, getState: () => RootState) => {
		const { deleteCountryData } = getState()["countryReducer"];
		dispatch({
			type: DELETE_COUNTRY_DATA,
			payload: { ...deleteCountryData, loading: true },
		});
		try {
			const res = await api.delete(`country/${id}`);
			dispatch({
				type: DELETE_COUNTRY_DATA,
				payload: {
					...deleteCountryData,
					loading: false,
					data: res?.data?.data,
				},
			});
			callback && callback();
		} catch (error) {
			dispatch({
				type: DELETE_COUNTRY_DATA,
				payload: { ...deleteCountryData, loading: false, errorData: error },
			});
		}
	};
export const addCountryDataAction =
	(data: any, callback?: () => void) =>
	async (dispatch: dispatchType, getState: () => RootState) => {
		const { addCountryData } = getState()["countryReducer"];
		dispatch({
			type: ADD_COUNTRY_DATA,
			payload: { ...addCountryData, loading: true },
		});
		try {
			const res = await api.post("country", data);
			dispatch({
				type: ADD_COUNTRY_DATA,
				payload: { ...addCountryData, loading: false, data: res?.data?.data },
			});
			callback && callback();
		} catch (error) {
			dispatch({
				type: ADD_COUNTRY_DATA,
				payload: { ...addCountryData, loading: false, errorData: error },
			});
		}
	};
export const editCountryDataAction =
	(data: any, country: { id: string }, callback?: () => void) =>
	async (dispatch: dispatchType, getState: () => RootState) => {
		const { editCountryData } = getState()["countryReducer"];
		dispatch({
			type: EDIT_COUNTRY_DATA,
			payload: { ...editCountryData, loading: true },
		});
		try {
			const res = await api.patch(`country/${country?.id}`, data);
			dispatch({
				type: EDIT_COUNTRY_DATA,
				payload: {
					...editCountryData,
					loading: false,
					data: res?.data?.data,
				},
			});
			callback && callback();
		} catch (error) {
			dispatch({
				type: EDIT_COUNTRY_DATA,
				payload: { ...editCountryData, loading: false, errorData: error },
			});
		}
	};
