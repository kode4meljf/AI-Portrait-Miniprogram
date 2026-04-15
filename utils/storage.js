/**
 * @file 加密存储工具
 * @author AI写真团队
 * @date 2026-04-13
 * @description 提供加密/解密存储功能，保护敏感数据
 */

// 注意：实际生产环境中，加密密钥应通过安全方式配置，不可硬编码
// 此处使用简单的Base64编码作为示例，生产环境应使用更强的加密算法
// 建议：敏感数据（token、openid）加密存储，非敏感数据可明文存储

/**
 * 简单的Base64编码（仅用于演示，生产环境请使用更安全的加密方案）
 * @param {string} str - 待编码字符串
 * @returns {string} 编码后的字符串
 */
const encodeBase64 = (str) => {
  try {
    return wx.arrayBufferToBase64(new TextEncoder().encode(str));
  } catch (err) {
    console.error("Base64编码失败:", err);
    return str;
  }
};

/**
 * 简单的Base64解码
 * @param {string} str - 待解码字符串
 * @returns {string} 解码后的字符串
 */
const decodeBase64 = (str) => {
  try {
    const buffer = wx.base64ToArrayBuffer(str);
    return new TextDecoder().decode(buffer);
  } catch (err) {
    console.error("Base64解码失败:", err);
    return str;
  }
};

/**
 * 加密存储数据
 * @param {string} key - 存储键名
 * @param {any} data - 待存储数据
 * @returns {boolean} 是否存储成功
 */
export const encryptStorage = (key, data) => {
  try {
    const jsonStr = JSON.stringify(data);
    const encrypted = encodeBase64(jsonStr);
    wx.setStorageSync(key, encrypted);
    return true;
  } catch (err) {
    console.error(`加密存储失败 [${key}]:`, err);
    return false;
  }
};

/**
 * 解密读取数据
 * @param {string} key - 存储键名
 * @returns {any|null} 解密后的数据，失败返回null
 */
export const decryptStorage = (key) => {
  try {
    const encrypted = wx.getStorageSync(key);
    if (!encrypted) return null;
    const jsonStr = decodeBase64(encrypted);
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error(`解密读取失败 [${key}]:`, err);
    return null;
  }
};

/**
 * 普通存储（非敏感数据）
 * @param {string} key - 存储键名
 * @param {any} data - 待存储数据
 */
export const setStorage = (key, data) => {
  try {
    wx.setStorageSync(key, data);
  } catch (err) {
    console.error(`存储失败 [${key}]:`, err);
  }
};

/**
 * 普通读取
 * @param {string} key - 存储键名
 * @returns {any|null}
 */
export const getStorage = (key) => {
  try {
    return wx.getStorageSync(key);
  } catch (err) {
    console.error(`读取失败 [${key}]:`, err);
    return null;
  }
};

/**
 * 删除存储
 * @param {string} key - 存储键名
 */
export const removeStorage = (key) => {
  try {
    wx.removeStorageSync(key);
  } catch (err) {
    console.error(`删除失败 [${key}]:`, err);
  }
};

/**
 * 清除所有存储
 */
export const clearStorage = () => {
  try {
    wx.clearStorageSync();
  } catch (err) {
    console.error("清除存储失败:", err);
  }
};