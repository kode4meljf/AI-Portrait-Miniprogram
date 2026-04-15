/**
 * @file AI生成模块接口服务（支持开发环境 Mock）
 * @description 封装AI写真生成相关接口，开发模式下返回模拟数据
 */

import { post, get } from "../utils/request";

// 判断是否为开发模式（可根据实际需要调整，例如使用 wx.getAccountInfoSync 判断）
const IS_DEV = true; // 开发时设为 true，上线前改为 false

/**
 * 获取风格列表
 */
export const getStyleList = async () => {
  if (IS_DEV) {
    // 模拟风格数据
    return [
      { id: "style_1", name: "古风写真", previewUrl: "https://picsum.photos/300/400?random=1", description: "仙气飘飘，古典韵味" },
      { id: "style_2", name: "韩系写真", previewUrl: "https://picsum.photos/300/400?random=2", description: "清新甜美，韩式浪漫" },
      { id: "style_3", name: "日系清新", previewUrl: "https://picsum.photos/300/400?random=3", description: "温暖治愈，简约自然" },
      { id: "style_4", name: "欧式复古", previewUrl: "https://picsum.photos/300/400?random=4", description: "典雅高贵，油画质感" },
    ];
  }
  // 真实接口
  const result = await get("/style/list");
  if (result.code === 0) return result.data.list;
  throw new Error(result.message);
};

/**
 * 创建AI生成任务
 */
export const createGenerateTask = async (params) => {
  if (IS_DEV) {
    console.log("[Mock] 创建生成任务", params);
    // 模拟任务创建成功，返回一个随机的 taskId
    return { taskId: "mock_task_" + Date.now() };
  }
  const result = await post("/ai/create-task", params);
  if (result.code === 0) return result.data;
  throw new Error(result.message);
};

/**
 * 查询任务状态（Mock 模拟：首次排队，第二次生成中，第三次完成）
 */
let mockPollCount = new Map(); // 用于模拟进度
export const getTaskStatus = async (taskId) => {
  if (IS_DEV) {
    let count = mockPollCount.get(taskId) || 0;
    count++;
    mockPollCount.set(taskId, count);
    
    if (count === 1) {
      return { status: "queueing", estimatedTime: 3, queuePosition: 2 };
    } else if (count === 2) {
      return { status: "generating", progress: 50 };
    } else {
      // 第三次轮询时标记为完成
      mockPollCount.delete(taskId);
      return { 
        status: "completed", 
        resultImages: Array(9).fill().map((_, i) => `https://picsum.photos/300/300?random=${taskId}_${i}`)
      };
    }
  }
  const result = await get(`/ai/task/status?taskId=${taskId}`);
  if (result.code === 0) return result.data;
  throw new Error(result.message);
};

/**
 * 获取生成结果（已完成任务）
 */
export const getTaskResult = async (taskId) => {
  if (IS_DEV) {
    return {
      images: Array(9).fill().map((_, i) => `https://picsum.photos/300/300?random=${taskId}_${i}`)
    };
  }
  const result = await get(`/ai/task/result?taskId=${taskId}`);
  if (result.code === 0) return result.data;
  throw new Error(result.message);
};

/**
 * 获取队列预估时间
 */
export const getEstimatedQueueTime = async () => {
  if (IS_DEV) return 5;
  try {
    const result = await get("/ai/queue/estimated-time");
    if (result.code === 0) return result.data.estimatedTime;
    return 60;
  } catch { return 60; }
};

/**
 * 取消生成任务
 */
export const cancelTask = async (taskId) => {
  if (IS_DEV) {
    console.log("[Mock] 取消任务", taskId);
    return true;
  }
  try {
    const result = await post("/ai/task/cancel", { taskId });
    return result.code === 0;
  } catch { return false; }
};

/**
 * 获取门店积分余额
 */
export const getStorePoints = async (storeId) => {
  if (IS_DEV) return 9999;
  const result = await get(`/store/points?storeId=${storeId}`);
  if (result.code === 0) return result.data.points;
  throw new Error(result.message);
};