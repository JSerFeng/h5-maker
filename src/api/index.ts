import axios from "axios"


export enum ErrorCode {
  Success = 200,
  Error = 500
}

export interface Res<T = null> {
  code: ErrorCode,
  data: T,
  message: string
}

const baseURL = "http://localhost:7001"

export const request = axios.create({
  baseURL
})

request.interceptors.response.use(
  res => {
    return res.data
  },
  err => {
    return {
      code: ErrorCode.Error,
      message: "未知错误",
      data: null
    }
  }
)
