import axios from "axios";
import { getAuthentication } from "../Auth";
import { FetchQuotaResponse } from "./api.model";

export const axiosAuthInstance = await axios.create({
  baseURL: "https://api.sellerapp.com",
});

axiosAuthInstance.interceptors.request.use(
  (config) => {
    console.log(config);
    // Do something before request is sent
    return new Promise(async (resolve, reject) => {
      const headers = config.headers;
      const auth = getAuthentication();
      const currentUser = await auth.currentUser;
      const token = await currentUser?.getIdToken();
      // config.headers = { ...headers, "x-token": token, "X-Client": "plugin" };
      config.headers["x-token"] = token;
      config.headers["x-client"] = "plugin";
      resolve(config);
    });
  },
  (error) => {
    // Do something with request error
    console.log(error);
    return Promise.reject(error);
  }
);

export const fetchQuota = () => {
  return axiosAuthInstance.get<FetchQuotaResponse>("/auth/quota");
};

export const updateQuota = (usage: number) => {
  console.log(usage);
  const request = axiosAuthInstance.post<FetchQuotaResponse>(
    "/auth/extension/review_request?feature=ext",
    {
      usage,
    }
  );
  console.log(request, "request");
  return request;
};
