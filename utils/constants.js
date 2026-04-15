/**
 * @file 全局常量配置
 * @author AI写真团队
 * @date 2026-04-13
 * @description 定义所有全局常量，避免硬编码
 */

// API 基础配置
export const API_CONFIG = {
  // 后端服务地址（生产环境）
  BASE_URL: "https://api.aiportrait.com/v1",
  // 开发环境（可根据环境变量切换）
  // BASE_URL: "https://test-api.aiportrait.com/v1",
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
};

// 存储Key常量
export const STORAGE_KEYS = {
  TOKEN: "ai_portrait_token",
  TOKEN_EXPIRE: "ai_portrait_token_expire",
  USER_INFO: "ai_portrait_user_info",
  STORE_ID: "ai_portrait_store_id",
  GENERATE_CACHE: "ai_portrait_generate_cache",
  ORDER_CACHE: "ai_portrait_order_cache",
};

// 任务状态枚举
export const TASK_STATUS = {
  QUEUEING: "queueing",      // 排队中
  GENERATING: "generating",  // 生成中
  COMPLETED: "completed",    // 已完成
  FAILED: "failed",          // 失败
};

// 订单状态枚举
export const ORDER_STATUS = {
  PENDING: "pending",        // 待确认
  CONFIRMED: "confirmed",    // 已确认
  PROCESSING: "processing",  // 制作中
  SHIPPED: "shipped",        // 已发货
  ARRIVED: "arrived",        // 已到店
  COMPLETED: "completed",    // 已完成
  CANCELLED: "cancelled",    // 已取消
};

// 相框类型枚举
export const FRAME_TYPE = {
  STANDARD: "standard",      // 标准款
  PREMIUM: "premium",        // 高档款
  DELUXE: "deluxe",          // 豪华款
};

// 图片质量阈值
export const IMAGE_QUALITY = {
  MIN_WIDTH: 300,            // 最小宽度
  MIN_HEIGHT: 300,           // 最小高度
  MIN_FACE_RATIO: 0.3,       // 最小人脸占比
  MAX_FACE_COUNT: 1,         // 最大人脸数量
  TARGET_MAX_SIZE: 1080,     // 压缩后最大边长
  JPEG_QUALITY: 80,          // JPEG压缩质量
};

// 轮询间隔（毫秒）
export const POLLING_INTERVAL = {
  GENERATE_STATUS: 3000,     // 生成状态轮询（3秒）
  ORDER_STATUS: 30000,       // 订单状态轮询（30秒）
};

// 积分阈值
export const POINTS_THRESHOLD = 50;

// 敏感信息过滤正则
export const SENSITIVE_PATTERNS = {
  PHONE: /1[3-9]\d{9}/g,
  ID_CARD: /[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]/g,
};

// 分享配置
export const SHARE_CONFIG = {
  TITLE: "AI写真馆 | 一键生成专属AI写真",
  IMAGE_URL: "/assets/images/share-cover.png",
};