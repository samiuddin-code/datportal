import axios from "axios";
import axiosInstance, { BASE_URL } from "./axiosInstance";
import TokenService from "./tokenService";

const setup = () => {
  axiosInstance.interceptors.request.use((config) => {
    const authToken = TokenService.getLocalAccessToken();
    if (authToken) {
      if (config.headers) {
        config.headers["Authorization"] = `Bearer ${authToken}`;
      }
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  axiosInstance.interceptors.response.use((res) => {
    return res;
  }, async (err) => {
    const originalConfig = err.config;
    if (originalConfig?.url !== "/auth/login" && err.response) {
      // Access Token was expired
      if (err.response.status === 401 && !originalConfig._retry) {
        originalConfig._retry = true;

        try {
          const refreshToken = TokenService.getLocalRefreshToken();
          if (refreshToken) {
            if (TokenService.isResourceBusy !== true) {
              TokenService.isResourceBusy = true;
              const res = await axios.post(`${BASE_URL}auth/refresh`, { refreshToken, }).catch(err => {
                if (err.response.status === 401 || err.response.status === 404) {
                  TokenService.removeTokens(false)
                }
                TokenService.isResourceBusy = false;
                throw err
              });
              if (res.data.data) {
                TokenService.isResourceBusy = false;
                TokenService.updateLocalAccessToken(res.data.data.access_token);
                TokenService.updateLocalRefreshToken(res.data.data.refresh_token);
              }
              return axiosInstance(originalConfig);
            } else {
              return await new Promise((resolve, reject) => {
                let tryHits = 0;
                let myTracker = setInterval(() => {
                  tryHits++;
                  if (TokenService.isResourceBusy !== true) {
                    let access_token = TokenService.getLocalAccessToken();
                    clearInterval(myTracker);
                    if (access_token) resolve(access_token);
                    else reject();
                  }

                  if (tryHits > 3 || TokenService.isResourceBusy !== true) {
                    clearInterval(myTracker);
                    reject();
                  }
                }, 300)
              }).then(res => {
                return axiosInstance(originalConfig);
              }).catch(err => {
                throw err
              });
            }
          } else {
            throw err
          }
        } catch (_error) {
          if (typeof window == "undefined") {
            return Promise.reject(_error);
          } else {
            let currentUrl = encodeURIComponent(window.location.href);
            window.location.href = "/login?redirectUrl=" + currentUrl;
            return Promise.reject(_error);
          }
        }

      }
    }
    return Promise.reject(err);
  });
};

export default setup;
