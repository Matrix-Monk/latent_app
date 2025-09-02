import axios2, { AxiosRequestConfig, AxiosResponse, Method } from "axios";

// Normalized response type: always return AxiosResponse-like object
export type NormalizedResponse<T = any> = AxiosResponse<T> & {
  error?: boolean; // optional flag if it was an error
};

async function request<T = any, D = any>(
  method: Method,
  url: string,
  data?: D,
  config?: AxiosRequestConfig<D>
): Promise<NormalizedResponse<T>> {
  try {
    const res = await axios2.request<T, AxiosResponse<T>, D>({
      method,
      url,
      data,
      ...config,
    });
    return res;
  } catch (e: any) {
    if (e.response) {
      return { ...e.response, error: true };
    }
    throw e; // network or unexpected error
  }
}

export const axios = {
  post: <T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ) => request<T, D>("POST", url, data, config),

  get: <T = any, D = any>(url: string, config?: AxiosRequestConfig<D>) =>
    request<T, D>("GET", url, undefined, config),

  put: <T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ) => request<T, D>("PUT", url, data, config),

  delete: <T = any, D = any>(url: string, config?: AxiosRequestConfig<D>) =>
    request<T, D>("DELETE", url, undefined, config),
};
