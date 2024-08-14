import api from "../../../services/axiosInstance";
import { RootState } from "../../store";
import { dispatchType } from "../commonTypes";
import {
	ADD_LANGUAGE_DATA,
	SET_LANGUAGE_DATA,
	EDIT_LANGUAGE_DATA,
	DELETE_LANGUAGE_DATA,
	GET_SINGLE_LANGUAGE_DATA,
	Language,
} from "./types";
import { errorHandler } from "../../../helpers";

export const getLanguageData = (id?: number) => async (dispatch: dispatchType, getState: () => RootState) => {
	const { languageData, singleLanguageData } = getState()["languageReducer"];
	const currentData = id ? languageData : singleLanguageData;
	const CURRENT_TYPE = id ? GET_SINGLE_LANGUAGE_DATA : SET_LANGUAGE_DATA;
	const url = id ? `language/${id}` : "language";

	dispatch({
		type: CURRENT_TYPE,
		payload: { ...currentData, loading: true },
	});

	try {
		await api.get(url).then((res) => {
			dispatch({
				type: CURRENT_TYPE,
				payload: { ...currentData, loading: false, data: res?.data?.data },
			});
		}).catch((error) => {
			const errorData = errorHandler(error);

			dispatch({
				type: CURRENT_TYPE,
				payload: {
					...currentData,
					loading: false,
					error: true,
					errorData,
				},
			});
		});
	} catch (error) {
		dispatch({
			type: CURRENT_TYPE,
			payload: { ...currentData, loading: false, errorData: error },
		});
	}
};

/** prettier-ignore */
export const addLanguageDataAction = (data: Language, callback?: () => void) =>
	async (dispatch: dispatchType, getState: () => RootState) => {
		const { addLanguageData } = getState()["languageReducer"];

		dispatch({
			type: ADD_LANGUAGE_DATA,
			payload: { ...addLanguageData, loading: true },
		});

		try {
			const res = await api.post("language", data);
			dispatch({
				type: ADD_LANGUAGE_DATA,
				payload: { ...addLanguageData, loading: false, data: res?.data?.data },
			});
			callback && callback();
		} catch (error) {
			dispatch({
				type: ADD_LANGUAGE_DATA,
				payload: { ...addLanguageData, loading: false, errorData: error },
			});
		}
	};

/** prettier-ignore */
export const editLanguageDataAction = (data?: Partial<Language>, item?: Language, callback?: () => void) =>
	async (dispatch: dispatchType, getState: () => RootState) => {
		const { editLanguageData } = getState()["languageReducer"];

		dispatch({
			type: EDIT_LANGUAGE_DATA,
			payload: { ...editLanguageData, loading: true },
		});

		try {
			const res = await api.patch(`language/${item?.id}`, data);
			dispatch({
				type: EDIT_LANGUAGE_DATA,
				payload: { ...editLanguageData, loading: false, data: res?.data?.data },
			});
			callback && callback();
		} catch (error) {
			dispatch({
				type: EDIT_LANGUAGE_DATA,
				payload: { ...editLanguageData, loading: false, errorData: error },
			});
		}
	};

/** prettier-ignore */
export const deleteLanguageDataAction = (id: number, callback?: () => void) =>
	async (dispatch: dispatchType, getState: () => RootState) => {
		const { deleteLanguageData } = getState()["languageReducer"];

		dispatch({
			type: DELETE_LANGUAGE_DATA,
			payload: { ...deleteLanguageData, loading: true },
		});

		try {
			const res = await api.delete(`language/${id}`);
			dispatch({
				type: DELETE_LANGUAGE_DATA,
				payload: { ...deleteLanguageData, loading: false, data: res?.data?.data },
			});
			callback && callback();
		} catch (error) {
			dispatch({
				type: DELETE_LANGUAGE_DATA,
				payload: { ...deleteLanguageData, loading: false, errorData: error },
			});
		}
	};
