import api from "../../../services/axiosInstance";
import { RootState } from "../../store";
import { dispatchType } from "../commonTypes";
import {
	ADD_SYSTEM_MODULES_DATA,
	SET_SYSTEM_MODULES_DATA,
	EDIT_SYSTEM_MODULES_DATA,
	DELETE_SYSTEM_MODULES_DATA,
	GET_SINGLE_SYSTEM_MODULES_DATA,
	SystemModule,
} from "./types";
import { errorHandler } from "../../../helpers";

/** Get System Module(s) */
export const getSystemModulesData =
	(id?: number) => async (dispatch: dispatchType, getState: () => RootState) => {
		const { systemModulesData, singleSystemModuleData } = getState()["systemModulesReducer"];
		const currentData = id ? singleSystemModuleData : systemModulesData;
		const CURRENT_TYPE = id ? GET_SINGLE_SYSTEM_MODULES_DATA : SET_SYSTEM_MODULES_DATA;
		const url = id ? `system-modules/${id}` : "system-modules";

		dispatch({
			type: CURRENT_TYPE,
			payload: { ...currentData, loading: true },
		});

		try {
			await api
				.get(url)
				.then((res) => {
					dispatch({
						type: CURRENT_TYPE,
						payload: { ...currentData, loading: false, data: res?.data?.data },
					});
				})
				.catch((error) => {
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

/** Add System Module */
export const addSystemModuleDataAction =
	(data: SystemModule | FormData, callback?: () => void) =>
	async (dispatch: dispatchType, getState: () => RootState) => {
		const { addSystemModuleData } = getState()["systemModulesReducer"];

		dispatch({
			type: ADD_SYSTEM_MODULES_DATA,
			payload: { ...addSystemModuleData, loading: true },
		});

		try {
			await api
				.post("system-modules", data, {
					headers: {
						"Content-Type": "multipart/form-data",
					},
				})
				.then((res) => {
					dispatch({
						type: ADD_SYSTEM_MODULES_DATA,
						payload: { ...addSystemModuleData, loading: false, data: res?.data?.data },
					});

					callback && callback();
				})
				.catch((error) => {
					let errorData = errorHandler(error);

					dispatch({
						type: ADD_SYSTEM_MODULES_DATA,
						payload: {
							...addSystemModuleData,
							loading: false,
							errorData,
						},
					});

					// clear the error message after 5 seconds
					setTimeout(() => {
						dispatch({
							type: ADD_SYSTEM_MODULES_DATA,
							payload: {
								...addSystemModuleData,
								loading: false,
								errorData: {},
							},
						});
					}, 5000);
				});
		} catch (error) {
			dispatch({
				type: ADD_SYSTEM_MODULES_DATA,
				payload: { ...addSystemModuleData, loading: false, errorData: error },
			});
		}
	};

/** Edit System Module */
export const editSystemModuleDataAction =
	(data?: Partial<SystemModule | FormData>, item?: SystemModule, callback?: () => void) =>
	async (dispatch: dispatchType, getState: () => RootState) => {
		const { editSystemModuleData } = getState()["systemModulesReducer"];

		dispatch({
			type: EDIT_SYSTEM_MODULES_DATA,
			payload: { ...editSystemModuleData, loading: true },
		});

		try {
			await api
				.patch(`system-modules/${item?.id}`, data, {
					headers: {
						"Content-Type": "multipart/form-data",
					},
				})
				.then((res) => {
					dispatch({
						type: EDIT_SYSTEM_MODULES_DATA,
						payload: {
							...editSystemModuleData,
							loading: false,
							data: res?.data?.data,
						},
					});

					callback && callback();
				})
				.catch((error) => {
					const errorData = errorHandler(error);

					dispatch({
						type: EDIT_SYSTEM_MODULES_DATA,
						payload: {
							...editSystemModuleData,
							loading: false,
							errorData,
						},
					});
				});
		} catch (error) {
			dispatch({
				type: EDIT_SYSTEM_MODULES_DATA,
				payload: { ...editSystemModuleData, loading: false, errorData: error },
			});
		}
	};

/** Delete System Module */
export const deleteSystemModule =
	(id: number, callback?: () => void) =>
	async (dispatch: dispatchType, getState: () => RootState) => {
		const { deleteSystemModuleData } = getState()["systemModulesReducer"];

		dispatch({
			type: DELETE_SYSTEM_MODULES_DATA,
			payload: { ...deleteSystemModuleData, loading: true },
		});

		try {
			await api
				.delete(`system-modules/${id}`)
				.then((res) => {
					dispatch({
						type: DELETE_SYSTEM_MODULES_DATA,
						payload: {
							...deleteSystemModuleData,
							loading: false,
							data: res?.data?.data,
						},
					});

					callback && callback();
				})
				.catch((error) => {
					const errorData = errorHandler(error);

					dispatch({
						type: DELETE_SYSTEM_MODULES_DATA,
						payload: {
							...deleteSystemModuleData,
							loading: false,
							errorData,
						},
					});
				});
		} catch (error) {
			dispatch({
				type: DELETE_SYSTEM_MODULES_DATA,
				payload: { ...deleteSystemModuleData, loading: false, errorData: error },
			});
		}
	};
