import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { cookieManager } from "../../../utilities/cookie-manager";
import apiTags from "./tags";

export interface TokenResponse {
  statusCode: number;
  data: {
    accessToken: string;
    refreshToken: string;
  };
  message: string;
  success: boolean;
}

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL as string,
  // credentials: "include",
  prepareHeaders: (headers) => {
    const token = cookieManager.getCookie("accessToken");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

export const API = createApi({
  reducerPath: "api",
  baseQuery: baseQuery,
  endpoints: () => ({}),
  tagTypes: [...apiTags],
});
