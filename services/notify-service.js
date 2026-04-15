/**
 * @file 通知触达模块接口
 * @description 微信服务通知订阅、推送
 */

import { post } from "../utils/request";

/**
 * 请求订阅消息授权
 * @param {string} tmplId - 模板ID
 * @returns {Promise<boolean>}
 */
export const requestSubscribeMessage = async (tmplId) => {
  return new Promise((resolve) => {
    wx.requestSubscribeMessage({
      tmplIds: [tmplId],
      success: (res) => {
        const status = res[tmplId];
        resolve(status === "accept");
      },
      fail: () => resolve(false),
    });
  });
};

/**
 * 订阅生成完成通知
 */
export const subscribeGenerateComplete = () => {
  const tmplId = "your_generate_complete_template_id"; // 替换为实际模板ID
  return requestSubscribeMessage(tmplId);
};

/**
 * 订阅到店领取通知
 */
export const subscribeArrivedNotice = () => {
  const tmplId = "your_arrived_notice_template_id";
  return requestSubscribeMessage(tmplId);
};

/**
 * 订阅余额不足提醒（门店管理员）
 */
export const subscribeInsufficientPoints = () => {
  const tmplId = "your_insufficient_points_template_id";
  return requestSubscribeMessage(tmplId);
};

/**
 * 发送测试通知（后端调用，前端仅为记录）
 * @param {string} openid
 * @param {string} templateId
 * @param {Object} data
 */
export const sendNotify = async (openid, templateId, data) => {
  try {
    const result = await post("/notify/send", { openid, templateId, data });
    return result.code === 0;
  } catch (err) {
    console.error("发送通知失败:", err);
    return false;
  }
};