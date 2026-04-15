/**
 * @file 统一网络请求封装
 * @author AI写真团队
 * @date 2026-04-13
 * @description 封装wx.request，提供拦截器、错误处理、token自动注入
 */

import { API_CONFIG, STORAGE_KEYS } from "./constants";
import { decryptStorage } from "./storage";

// 请求队列
let requestQueue = [];
let isRefreshing = false;

/**
 * 获取当前token
 * @returns {string|null}
 */
const getToken = () => {
  const token = decryptStorage(STORAGE_KEYS.TOKEN);
  return token;
};

/**
 * 刷新token（当token过期时调用）
 * @returns {Promise<string>}
 */
const refreshToken = async () => {
  // 实际项目中调用刷新token接口
  // 此处为示例实现
  return new Promise((resolve, reject) => {
    // 模拟刷新token
    setTimeout(() => {
      reject(new Error("Token刷新失败"));
    }, 1000);
  });
};

/**
 * 处理token过期
 * @param {Function} originalRequest - 原请求函数
 * @returns {Promise}
 */
const handleTokenExpire = (originalRequest) => {
  if (!isRefreshing) {
    isRefreshing = true;
    return refreshToken()
      .then((newToken) => {
        isRefreshing = false;
        // 重试队列中的所有请求
        requestQueue.forEach((cb) => cb(newToken));
        requestQueue = [];
        // 重新执行原请求
        return originalRequest();
      })
      .catch((err) => {
        isRefreshing = false;
        requestQueue = [];
        // 跳转登录页
        wx.navigateTo({ url: "/packageUser/pages/login/login" });
        throw err;
      });
  } else {
    // 正在刷新中，将请求加入队列
    return new Promise((resolve, reject) => {
      requestQueue.push((newToken) => {
        resolve(originalRequest());
      });
    });
  }
};

/**
 * 统一请求方法
 * @param {Object} options - 请求配置
 * @param {string} options.url - 请求路径
 * @param {string} options.method - 请求方法
 * @param {Object} options.data - 请求参数
 * @param {Object} options.header - 请求头
 * @param {number} options.retryCount - 重试次数
 * @returns {Promise}
 */
export const request = (options) => {
  const {
    url,
    method = "GET",
    data = {},
    header = {},
    retryCount = API_CONFIG.RETRY_COUNT,
  } = options;

  // 构造完整URL
  const fullUrl = url.startsWith("http") ? url : `${API_CONFIG.BASE_URL}${url}`;
  
  // 获取token
  const token = getToken();
  
  // 构建请求头
  const requestHeader = {
    "Content-Type": "application/json",
    ...header,
  };
  
  if (token) {
    requestHeader["Authorization"] = `Bearer ${token}`;
  }

  // 发起请求
  return new Promise((resolve, reject) => {
    wx.request({
      url: fullUrl,
      method: method,
      data: data,
      header: requestHeader,
      timeout: API_CONFIG.TIMEOUT,
      success: (res) => {
        if (res.statusCode === 200) {
          const response = res.data;
          
          // 根据业务状态码处理
          if (response.code === 0) {
            resolve(response);
          } else if (response.code === 401) {
            // token过期
            handleTokenExpire(() => request(options))
              .then(resolve)
              .catch(reject);
          } else {
            reject(response);
          }
        } else if (res.statusCode === 401) {
          handleTokenExpire(() => request(options))
            .then(resolve)
            .catch(reject);
        } else {
          reject({
            code: res.statusCode,
            message: `请求失败: ${res.statusCode}`,
          });
        }
      },
      fail: (err) => {
        console.error("网络请求失败:", err);
        
        // 重试机制
        if (retryCount > 0 && !err.noRetry) {
          setTimeout(() => {
            request({ ...options, retryCount: retryCount - 1 })
              .then(resolve)
              .catch(reject);
          }, 1000);
        } else {
          reject({
            code: -1,
            message: "网络连接失败，请检查网络设置",
          });
        }
      },
    });
  });
};

/**
 * GET请求
 * @param {string} url - 请求路径
 * @param {Object} data - 请求参数
 * @returns {Promise}
 */
export const get = (url, data = {}) => {
  return request({ url, method: "GET", data });
};

/**
 * POST请求
 * @param {string} url - 请求路径
 * @param {Object} data - 请求参数
 * @returns {Promise}
 */
export const post = (url, data = {}) => {
  return request({ url, method: "POST", data });
};

/**
 * PUT请求
 * @param {string} url - 请求路径
 * @param {Object} data - 请求参数
 * @returns {Promise}
 */
export const put = (url, data = {}) => {
  return request({ url, method: "PUT", data });
};

/**
 * DELETE请求
 * @param {string} url - 请求路径
 * @param {Object} data - 请求参数
 * @returns {Promise}
 */
export const del = (url, data = {}) => {
  return request({ url, method: "DELETE", data });
};