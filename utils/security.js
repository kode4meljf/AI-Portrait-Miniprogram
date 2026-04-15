/**
 * @file 内容安全检测工具
 * @author AI写真团队
 * @date 2026-04-13
 * @description 调用微信内容安全API，检测用户输入内容
 */

import { request } from "./request";

/**
 * 文本内容安全检测
 * @param {string} text - 待检测文本
 * @returns {Promise<boolean>} true-安全，false-违规
 */
export const checkTextSecurity = async (text) => {
  if (!text || text.trim() === "") {
    return true;
  }
  
  try {
    // 方案一：通过云函数调用微信内容安全接口
    // 调用云函数进行内容安全检测
    const result = await wx.cloud.callFunction({
      name: "msgSecCheck",
      data: { content: text },
    });
    
    if (result.result && result.result.errCode === 0) {
      return true;
    } else if (result.result && result.result.errCode === 87014) {
      // 87014 表示内容违规
      wx.showToast({
        title: "内容包含违规信息",
        icon: "none",
        duration: 2000,
      });
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("文本安全检测失败:", err);
    // 检测失败时，为保障安全，拒绝提交
    wx.showToast({
      title: "内容安全检测失败，请稍后重试",
      icon: "none",
    });
    return false;
  }
};

/**
 * 图片内容安全检测（异步）
 * @param {string} imagePath - 图片临时路径
 * @returns {Promise<boolean>}
 */
export const checkImageSecurity = async (imagePath) => {
  try {
    // 调用后端图片审核接口
    const result = await request({
      url: "/security/img-check",
      method: "POST",
      data: { imageUrl: imagePath },
    });
    
    if (result.code === 0) {
      return result.data.isSafe;
    } else {
      console.warn("图片审核失败:", result.message);
      return true; // 审核失败默认通过
    }
  } catch (err) {
    console.error("图片安全检测失败:", err);
    return true; // 检测失败默认通过
  }
};

/**
 * 敏感信息脱敏
 * @param {string} text - 原始文本
 * @returns {string} 脱敏后的文本
 */
export const maskSensitiveInfo = (text) => {
  if (!text) return text;
  
  // 手机号脱敏：保留前3后4
  let masked = text.replace(/1[3-9]\d{9}/g, (match) => {
    return match.slice(0, 3) + "****" + match.slice(-4);
  });
  
  // 身份证脱敏：保留前6后4
  masked = masked.replace(/[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]/g, (match) => {
    return match.slice(0, 6) + "********" + match.slice(-4);
  });
  
  return masked;
};

/**
 * 验证码安全校验（防暴力破解）
 * @param {string} phone - 手机号
 * @param {string} code - 验证码
 * @returns {Promise<boolean>}
 */
export const verifySMSCode = async (phone, code) => {
  try {
    const result = await request({
      url: "/user/verify-code",
      method: "POST",
      data: { phone, code },
    });
    
    if (result.code === 0) {
      return true;
    } else {
      wx.showToast({
        title: result.message || "验证码错误",
        icon: "none",
      });
      return false;
    }
  } catch (err) {
    console.error("验证码校验失败:", err);
    wx.showToast({
      title: "验证服务异常",
      icon: "none",
    });
    return false;
  }
};