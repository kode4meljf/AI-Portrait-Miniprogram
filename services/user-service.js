/**
 * @file 用户中心模块接口（开发环境模拟版）
 * @description 登录、写真相册、积分体系 - 开发阶段模拟后端
 */

import { post, get } from "../utils/request";
import { encryptStorage } from "../utils/storage";
import { STORAGE_KEYS } from "../utils/constants";

/**
 * 发送验证码（开发环境直接返回成功）
 * @param {string} phone - 手机号
 * @returns {Promise<boolean>}
 */
export const sendSMSCode = async (phone) => {
  // ========== 开发环境模拟 ==========
  console.log(`[开发模式] 验证码已发送至 ${phone}，验证码：123456`);
  return true;
  // ========== 生产环境请注释以上代码，启用下方真实请求 ==========
  /*
  try {
    const result = await post("/user/send-code", { phone });
    return result.code === 0;
  } catch (err) {
    console.error("发送验证码失败:", err);
    return false;
  }
  */
};

/**
 * 手机号+验证码登录（开发环境验证码固定为123456）
 * @param {string} phone - 手机号
 * @param {string} code - 验证码
 * @returns {Promise<Object>}
 */
export const loginByPhone = async (phone, code) => {
  // ========== 开发环境模拟 ==========
  if (code === "123456") {
    const mockUserInfo = {
      userId: "dev_" + Date.now(),
      phone: phone,
      storeId: "mock_store_001",
      nickName: "测试用户",
    };
    const mockToken = "mock_token_" + Date.now();
    const expireAt = Date.now() + 7 * 24 * 3600 * 1000;
    encryptStorage(STORAGE_KEYS.TOKEN, mockToken);
    encryptStorage(STORAGE_KEYS.USER_INFO, mockUserInfo);
    encryptStorage(STORAGE_KEYS.TOKEN_EXPIRE, expireAt);
    return { success: true, userInfo: mockUserInfo };
  }
  throw new Error("验证码错误（开发环境请使用 123456）");
  // ========== 生产环境请注释以上代码，启用下方真实请求 ==========
  /*
  try {
    const result = await post("/user/login", { phone, code });
    if (result.code === 0) {
      const { token, userInfo, expireAt } = result.data;
      encryptStorage(STORAGE_KEYS.TOKEN, token);
      encryptStorage(STORAGE_KEYS.USER_INFO, userInfo);
      encryptStorage(STORAGE_KEYS.TOKEN_EXPIRE, expireAt);
      return { success: true, userInfo };
    }
    throw new Error(result.message || "登录失败");
  } catch (err) {
    console.error("登录失败:", err);
    throw err;
  }
  */
};

/**
 * 获取用户写真相册列表
 * @param {number} page
 * @param {number} pageSize
 * @param {string} filterYear
 * @returns {Promise<Array>}
 */
export const getAlbumList = async (page = 1, pageSize = 20, filterYear = "") => {
  // 开发环境模拟数据
  console.log("[开发模式] 获取相册列表");
  return [
    {
      id: "1",
      coverUrl: "https://picsum.photos/200/200?random=1",
      createTime: "2026-04-13",
      images: ["https://picsum.photos/200/200?random=1"],
    },
    {
      id: "2",
      coverUrl: "https://picsum.photos/200/200?random=2",
      createTime: "2026-04-12",
      images: ["https://picsum.photos/200/200?random=2"],
    },
  ];
  // 生产环境启用真实请求
  // try {
  //   const result = await get(`/user/album?page=${page}&pageSize=${pageSize}&year=${filterYear}`);
  //   if (result.code === 0) return result.data.list;
  //   throw new Error(result.message);
  // } catch (err) { ... }
};

/**
 * 获取用户积分余额
 * @returns {Promise<number>}
 */
export const getUserPoints = async () => {
  // 开发环境模拟
  return 1280;
  // 生产环境...
};

/**
 * 积分兑换
 */
export const redeemPoints = async (points, orderId) => {
  console.log("[开发模式] 积分兑换", points, orderId);
  return { success: true };
};