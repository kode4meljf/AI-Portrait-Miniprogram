/**
 * @file 选图下单模块接口
 * @description 相框款式、订单提交、供应商对接
 */

import { post, get } from "../utils/request";

/**
 * 获取相框款式列表
 * @returns {Promise<Array>}
 */
export const getFrameList = async () => {
  try {
    const result = await get("/frame/list");
    if (result.code === 0) {
      return result.data.list;
    }
    throw new Error(result.message || "获取相框列表失败");
  } catch (err) {
    console.error("获取相框列表失败:", err);
    throw err;
  }
};

/**
 * 提交订单（通知门店工作台）
 * @param {Object} params
 * @returns {Promise<Object>}
 */
export const submitOrder = async (params) => {
  try {
    const result = await post("/order/submit", params);
    if (result.code === 0) {
      return result.data;
    }
    throw new Error(result.message || "提交订单失败");
  } catch (err) {
    console.error("提交订单失败:", err);
    throw err;
  }
};

/**
 * 获取订单详情
 * @param {string} orderId
 * @returns {Promise<Object>}
 */
export const getOrderDetail = async (orderId) => {
  try {
    const result = await get(`/order/detail?orderId=${orderId}`);
    if (result.code === 0) {
      return result.data;
    }
    throw new Error(result.message || "获取订单详情失败");
  } catch (err) {
    console.error("获取订单详情失败:", err);
    throw err;
  }
};

/**
 * 获取订单列表
 * @param {number} page
 * @param {number} pageSize
 * @returns {Promise<Object>}
 */
export const getOrderList = async (page = 1, pageSize = 10) => {
  try {
    const result = await get(`/order/list?page=${page}&pageSize=${pageSize}`);
    if (result.code === 0) {
      return result.data;
    }
    throw new Error(result.message || "获取订单列表失败");
  } catch (err) {
    console.error("获取订单列表失败:", err);
    throw err;
  }
};

/**
 * 取消订单
 * @param {string} orderId
 * @returns {Promise<boolean>}
 */
export const cancelOrder = async (orderId) => {
  try {
    const result = await post("/order/cancel", { orderId });
    return result.code === 0;
  } catch (err) {
    console.error("取消订单失败:", err);
    return false;
  }
};