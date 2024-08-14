/** Error handling helper function in axios */
export const errorHandler = (error: any) => {
	if (error.response && error.response.data) {
		// Request made and server responded
		return error.response.data;
	} else if (error.request && error.request.data) {
		// The request was made but no response was received
		return error.request;
	} else {
		// Something happened in setting up the request that triggered an Error
		return error;
	}
};
