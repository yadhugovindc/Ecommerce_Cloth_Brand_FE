import axios, { AxiosError, AxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");
export function imageUrl(src?: string | null): string {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/uploads/")) return `${API_ORIGIN}${src}`;
  return src;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions extends Omit<AxiosRequestConfig, "url" | "data"> {
  body?: AxiosRequestConfig["data"];
}

export async function api<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  try {
    const response = await axios.request<T>({
      baseURL: API_URL,
      url: path,
      method: options.method,
      data: options.body,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
      },
      withCredentials: true,
      signal: options.signal,
      params: options.params,
    });

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new ApiError(
      axiosError.response?.data?.message || axiosError.message || "Something went wrong",
      axiosError.response?.status || 0
    );
  }
}

export const apiUrl = API_URL;