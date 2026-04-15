/**
 * @file AI生成模块接口服务
 * @author AI写真团队
 * @date 2026-04-13
 * @description 封装AI写真生成相关接口
 */

import { post, get } from "../utils/request";

/**
 * 获取风格列表
 * @returns {Promise<Array>} 风格列表
 */
export const getStyleList = async () => {
  try {
    const result = await get("/style/list");
    if (result.code === 0) {
      return result.data.list;
    }
    throw new Error(result.message || "获取风格列表失败");
  } catch (err) {
    console.error("获取风格列表失败:", err);
    throw err;
  }
};

/**
 * 创建AI生成任务
 * @param {Object} params - 参数
 * @param {string} params.imageUrl - 上传的图片URL
 * @param {string} params.styleId - 风格ID
 * @param {string} params.storeId - 门店ID
 * @returns {Promise<Object>} 任务信息
 */
export const createGenerateTask = async (params) => {
  try {
    const result = await post("/ai/create-task", params);
    if (result.code === 0) {
      return result.data;
    }
    throw new Error(result.message || "创建任务失败");
  } catch (err) {
    console.error("创建任务失败:", err);
    throw err;
  }
};

/**
 * 查询任务状态
 * @param {string} taskId - 任务ID
 * @returns {Promise<Object>} 任务状态信息
 */
export const getTaskStatus = async (taskId) => {
  try {
    const result = await get(`/ai/task/status?taskId=${taskId}`);
    if (result.code === 0) {
      return result.data;
    }
    throw new Error(result.message || "查询任务状态失败");
  } catch (err) {
    console.error("查询任务状态失败:", err);
    throw err;
  }
};

/**
 * 获取生成结果（已完成任务）
 * @param {string} taskId - 任务ID
 * @returns {Promise<Object>} 生成结果
 */
export const getTaskResult = async (taskId) => {
  try {
    const result = await get(`/ai/task/result?taskId=${taskId}`);
    if (result.code === 0) {
      return result.data;
    }
    throw new Error(result.message || "获取结果失败");
  } catch (err) {
    console.error("获取结果失败:", err);
    throw err;
  }
};

/**
 * 获取队列预估时间
 * @returns {Promise<number>} 预估等待秒数
 */
export const getEstimatedQueueTime = async () => {
  try {
    const result = await get("/ai/queue/estimated-time");
    if (result.code === 0) {
      return result.data.estimatedTime;
    }
    return 60;
  } catch (err) {
    console.error("获取队列时间失败:", err);
    return 60;
  }
};

/**
 * 取消生成任务
 * @param {string} taskId - 任务ID
 * @returns {Promise<boolean>}
 */
export const cancelTask = async (taskId) => {
  try {
    const result = await post("/ai/task/cancel", { taskId });
    return result.code === 0;
  } catch (err) {
    console.error("取消任务失败:", err);
    return false;
  }
};

/**
 * 获取门店积分余额
 * @param {string} storeId - 门店ID
 * @returns {Promise<number>}
 */
export const getStorePoints = async (storeId) => {
  try {
    const result = await get(`/store/points?storeId=${storeId}`);
    if (result.code === 0) {
      return result.data.points;
    }
    throw new Error(result.message || "获取积分失败");
  } catch (err) {
    console.error("获取积分失败:", err);
    throw err;
  }
};