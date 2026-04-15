/**
 * @file 分享工具
 * @author AI写真团队
 * @date 2026-04-14
 * @description 生成分享图、小程序码、处理分享成功回调及积分奖励
 */

import { request } from "./request";
import { getStorage, setStorage } from "./storage";
import { STORAGE_KEYS } from "./constants";

/**
 * 生成写真专属分享图（带小程序码）
 * @param {Object} params
 * @param {string} params.imageUrl - 写真图片URL
 * @param {string} params.title - 分享标题
 * @param {string} params.path - 小程序路径（带参数）
 * @returns {Promise<string>} 分享图临时路径
 */
export const generateShareImage = async (params) => {
  const { imageUrl, title = "AI写真馆", path = "/pages/index/index" } = params;
  
  try {
    wx.showLoading({ title: "生成分享图..." });
    
    // 1. 获取小程序码（后端生成，或前端调用云函数）
    const qrCodeRes = await getWXACode({ path, width: 280 });
    const qrCodePath = qrCodeRes.tempFilePath;
    
    // 2. 下载写真图片
    const photoRes = await downloadImage(imageUrl);
    const photoPath = photoRes.tempFilePath;
    
    // 3. 绘制分享图（canvas 2d）
    const shareImagePath = await drawShareImage({
      photoPath,
      qrCodePath,
      title,
    });
    
    wx.hideLoading();
    return shareImagePath;
  } catch (err) {
    wx.hideLoading();
    console.error("生成分享图失败:", err);
    throw err;
  }
};

/**
 * 获取微信小程序码（后端接口或云函数）
 * @param {Object} params
 * @returns {Promise<Object>} { tempFilePath }
 */
const getWXACode = async (params) => {
  // 方式一：调用后端接口获取
  try {
    const result = await request({
      url: "/share/get-wxacode",
      method: "POST",
      data: params,
    });
    if (result.code === 0 && result.data.qrCodeUrl) {
      return await downloadImage(result.data.qrCodeUrl);
    }
    throw new Error("获取小程序码失败");
  } catch (err) {
    console.error("获取小程序码失败:", err);
    // 方式二：使用云函数（需开通云开发）
    // return await wx.cloud.callFunction({ name: "getWXACode", data: params });
    throw err;
  }
};

/**
 * 下载图片到本地临时文件
 * @param {string} url
 * @returns {Promise<Object>}
 */
const downloadImage = (url) => {
  return new Promise((resolve, reject) => {
    wx.downloadFile({
      url,
      success: resolve,
      fail: reject,
    });
  });
};

/**
 * 绘制分享图（Canvas 2D）
 * @param {Object} params
 * @returns {Promise<string>}
 */
const drawShareImage = (params) => {
  return new Promise((resolve, reject) => {
    const query = wx.createSelectorQuery();
    query.select("#shareCanvas")
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0]) {
          reject(new Error("未找到canvas节点"));
          return;
        }
        const canvas = res[0].node;
        const ctx = canvas.getContext("2d");
        const { width, height } = res[0];
        
        // 设置画布尺寸（建议 750*1334）
        canvas.width = 750;
        canvas.height = 1334;
        
        // 绘制背景
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 加载图片
        const images = [
          { key: "photo", path: params.photoPath, x: 40, y: 200, w: 500, h: 500 },
          { key: "qr", path: params.qrCodePath, x: 580, y: 900, w: 130, h: 130 },
        ];
        
        let loadedCount = 0;
        images.forEach((img) => {
          const image = canvas.createImage();
          image.onload = () => {
            ctx.drawImage(image, img.x, img.y, img.w, img.h);
            loadedCount++;
            if (loadedCount === images.length) {
              // 绘制文字
              ctx.font = "bold 48px sans-serif";
              ctx.fillStyle = "#333333";
              ctx.fillText(params.title, 40, 120);
              
              ctx.font = "28px sans-serif";
              ctx.fillStyle = "#999999";
              ctx.fillText("长按识别小程序码", 580, 1080);
              
              // 导出图片
              wx.canvasToTempFilePath({
                canvas: canvas,
                success: (res) => resolve(res.tempFilePath),
                fail: reject,
              });
            }
          };
          image.onerror = reject;
          image.src = img.path;
        });
      });
  });
};

/**
 * 分享成功回调（增加积分）
 * @param {Object} options - 分享配置
 * @param {string} options.from - 分享来源（button/menu）
 * @param {string} options.type - 分享类型
 * @returns {Promise<void>}
 */
export const onShareSuccess = async (options) => {
  try {
    // 检查今日是否已分享过（防止重复奖励）
    const lastShareDate = getStorage("last_share_date");
    const today = new Date().toDateString();
    if (lastShareDate === today) {
      console.log("今日已分享过，不再重复奖励");
      return;
    }
    
    // 调用后端接口增加积分
    const result = await request({
      url: "/user/add-points",
      method: "POST",
      data: {
        source: "share",
        points: 20,
        shareInfo: options,
      },
    });
    
    if (result.code === 0) {
      setStorage("last_share_date", today);
      wx.showToast({
        title: "分享成功 +20积分",
        icon: "success",
        duration: 2000,
      });
    }
  } catch (err) {
    console.error("分享增加积分失败:", err);
  }
};

/**
 * 获取分享配置（用于页面的 onShareAppMessage）
 * @param {Object} customConfig - 自定义配置
 * @returns {Object} 分享配置
 */
export const getShareConfig = (customConfig = {}) => {
  const defaultConfig = {
    title: "AI写真馆 | 一键生成专属AI写真",
    path: "/pages/index/index",
    imageUrl: "/assets/images/share-cover.png",
  };
  
  const config = { ...defaultConfig, ...customConfig };
  
  // 添加分享成功回调
  config.success = (res) => {
    onShareSuccess(res);
  };
  
  return config;
};

/**
 * 分享到朋友圈配置
 * @param {Object} customConfig
 * @returns {Object}
 */
export const getTimelineConfig = (customConfig = {}) => {
  return {
    title: "AI写真馆 | 一键生成专属AI写真",
    query: "",
    imageUrl: "/assets/images/share-cover.png",
    ...customConfig,
  };
};