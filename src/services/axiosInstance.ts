import axios from "axios";
// export const BASE_URL = "https://api.portal.datconsultancy.com/";
export const BASE_URL = "http://localhost:5569/";
// Main API instance
const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
