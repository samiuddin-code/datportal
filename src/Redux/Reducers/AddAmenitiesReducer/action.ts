import api from "../../../services/axiosInstance";
import { RootState } from "../../store";
import { dispatchType } from "../commonTypes";
import { GET_AMENITIES_DATA } from "./types";

export const getAmenitiesData =
	(callback?: () => void) => async (dispatch: dispatchType, getState: () => RootState) => {
		const { amenitiesData } = getState()["AddAmenitiesReducer"];

		let url = `amenity`;
		dispatch({
			type: GET_AMENITIES_DATA,
			payload: { ...amenitiesData, loading: true },
		});
		try {
			const res = await api.get(url);
			dispatch({
				type: GET_AMENITIES_DATA,
				payload: {
					...amenitiesData,
					loading: false,
					data: res.data?.data,
				},
			});
			callback && callback();
		} catch (error) {
			dispatch({
				type: GET_AMENITIES_DATA,
				payload: {
					...amenitiesData,
					loading: false,
					errorData: error,
				},
			});
		}
	};
