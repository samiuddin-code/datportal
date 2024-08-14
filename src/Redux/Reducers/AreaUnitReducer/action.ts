import api from "../../../services/axiosInstance";
import { RootState } from "../../store";
import { dispatchType } from "../commonTypes";
import {
	ADD_AREA_UNIT_DATA,
	SET_AREA_UNIT_DATA,
	EDIT_AREA_UNIT_DATA,
	DELETE_AREA_UNIT_DATA,
	GET_SINGLE_AREA_UNIT_DATA,
	AreaUnit,
} from "./types";
import { errorHandler } from "../../../helpers";

export const getAreaUnitData = (id?: number) => 
	async (dispatch: dispatchType, getState: () => RootState) => {
		const { areaUnitData, singleAreaUnitData } = getState()["areaUnitReducer"];
		const currentData = id ? singleAreaUnitData : areaUnitData;
		const CURRENT_TYPE = id ? GET_SINGLE_AREA_UNIT_DATA : SET_AREA_UNIT_DATA
		const url = id ? `area-unit/${id}` : 'area-unit'

		dispatch({
			type: CURRENT_TYPE,
			payload: { ...currentData, loading: true },
		});

		try {
			await api.get(url).then(res => {
				dispatch({
					type: CURRENT_TYPE,
					payload: { ...currentData, loading: false, data: res?.data?.data },
				});
			}).catch(error => {
				const errorData = errorHandler(error);

				dispatch({
					type: CURRENT_TYPE,
					payload: { 
						...currentData, 
						loading: false, 
						error: true, 
						errorData
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

export const addAreaUnitDataAction =
	(data: AreaUnit, callback?: () => void) =>
	async (dispatch: dispatchType, getState: () => RootState) => {
		const { addAreaUnitData } = getState()["areaUnitReducer"];
		dispatch({
			type: ADD_AREA_UNIT_DATA,
			payload: { ...addAreaUnitData, loading: true },
		});
		try {
			await api.post("area-unit", data).then(res => {
				dispatch({
					type: ADD_AREA_UNIT_DATA,
					payload: { ...addAreaUnitData, loading: false, data: res?.data?.data },
				});

				callback && callback();
			}).catch(error => {
				let errorData = errorHandler(error);
			
				dispatch({
					type: ADD_AREA_UNIT_DATA,
					payload: { 
						...addAreaUnitData,
						loading: false, 
						errorData
					},
				});

				setTimeout(() => {
					dispatch({
						type: ADD_AREA_UNIT_DATA,
						payload: { 
							...addAreaUnitData,
							loading: false, 
							errorData: {}
						},
					});
				}, 5000)
			});
		} catch (error) {
			dispatch({
				type: ADD_AREA_UNIT_DATA,
				payload: { ...addAreaUnitData, loading: false, errorData: error },
			});
		}
	};

export const editAreaUnitDataAction =
	(data?: Partial<AreaUnit>, item?: AreaUnit, callback?: () => void) =>
	async (dispatch: dispatchType, getState: () => RootState) => {
		const { editAreaUnitData } = getState()["areaUnitReducer"];
		dispatch({
			type: EDIT_AREA_UNIT_DATA,
			payload: { ...editAreaUnitData, loading: true },
		});
		try {
			await api.patch(`area-unit/${item?.id}`, data).then(res => {
				dispatch({
					type: EDIT_AREA_UNIT_DATA,
					payload: {
						...editAreaUnitData,
						loading: false,
						data: res?.data?.data,
					},
				});
				
				callback && callback();
			}).catch(error => {
				const errorData = errorHandler(error);
				dispatch({
					type: EDIT_AREA_UNIT_DATA,
					payload: { 
						...editAreaUnitData, 
						loading: false, 
						errorData
					},
				});
			});
		} catch (error) {
			dispatch({
				type: EDIT_AREA_UNIT_DATA,
				payload: { ...editAreaUnitData, loading: false, errorData: error },
			});
		}
	};

export const deleteAreaUnit =
	(id: number, callback?: () => void) =>
	async (dispatch: dispatchType, getState: () => RootState) => {
		const { deleteAreaUnitData } = getState()["areaUnitReducer"];
		dispatch({
			type: DELETE_AREA_UNIT_DATA,
			payload: { ...deleteAreaUnitData, loading: true },
		});
		try {
			await api.delete(`area-unit/${id}`).then(res => {
				dispatch({
					type: DELETE_AREA_UNIT_DATA,
					payload: {
						...deleteAreaUnitData,
						loading: false,
						data: res?.data?.data,
					},
				});

				callback && callback();
			}).catch(error => {
				const errorData = errorHandler(error);

				dispatch({
					type: DELETE_AREA_UNIT_DATA,
					payload: {
						...deleteAreaUnitData,
						loading: false,
						errorData
					},
				});
			});
		} catch (error) {
			dispatch({
				type: DELETE_AREA_UNIT_DATA,
				payload: { ...deleteAreaUnitData, loading: false, errorData: error },
			});
		}
	};
