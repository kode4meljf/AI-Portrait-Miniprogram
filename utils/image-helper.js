/**
 * @file 图片处理工具
 * @author AI写真团队
 * @date 2026-04-13
 * @description 图片压缩、人脸检测、质量评估
 */

import { IMAGE_QUALITY } from "./constants";
import { request } from "./request";

/**
 * 压缩图片（使用wx.compressImage + canvas降采样）
 * @param {string} tempFilePath - 图片临时路径
 * @returns {Promise<string>} 压缩后的图片路径
 */
export const compressImage = async (tempFilePath) => {
  try {
    // 第一步：获取图片信息
    const imageInfo = await getImageInfo(tempFilePath);
    let targetPath = tempFilePath;
    
    // 第二步：如果图片边长超过限制，使用canvas降采样
    const maxSide = Math.max(imageInfo.width, imageInfo.height);
    if (maxSide > IMAGE_QUALITY.TARGET_MAX_SIZE) {
      targetPath = await resizeImageWithCanvas(tempFilePath, IMAGE_QUALITY.TARGET_MAX_SIZE);
    }
    
    // 第三步：使用wx.compressImage压缩质量
    const compressResult = await wxCompressImage(targetPath, IMAGE_QUALITY.JPEG_QUALITY);
    return compressResult;
  } catch (err) {
    console.error("图片压缩失败:", err);
    return tempFilePath; // 压缩失败返回原图
  }
};

/**
 * 获取图片信息
 * @param {string} filePath - 图片路径
 * @returns {Promise<Object>}
 */
const getImageInfo = (filePath) => {
  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src: filePath,
      success: (res) => resolve(res),
      fail: reject,
    });
  });
};

/**
 * 使用Canvas缩放图片
 * @param {string} tempFilePath - 原图路径
 * @param {number} maxSize - 最大边长
 * @returns {Promise<string>}
 */
const resizeImageWithCanvas = (tempFilePath, maxSize) => {
  return new Promise((resolve, reject) => {
    const ctx = wx.createCanvasContext("compressCanvas");
    const canvasId = "compressCanvas";
    
    // 创建离屏Canvas（需要在wxml中预置canvas组件）
    wx.getImageInfo({
      src: tempFilePath,
      success: (info) => {
        let width = info.width;
        let height = info.height;
        let scale = 1;
        
        if (width > maxSize || height > maxSize) {
          scale = maxSize / Math.max(width, height);
          width = Math.floor(width * scale);
          height = Math.floor(height * scale);
        }
        
        // 绘制并导出
        ctx.drawImage(tempFilePath, 0, 0, width, height);
        ctx.draw(false, () => {
          wx.canvasToTempFilePath({
            canvasId: canvasId,
            destWidth: width,
            destHeight: height,
            fileType: "jpg",
            quality: IMAGE_QUALITY.JPEG_QUALITY / 100,
            success: (res) => resolve(res.tempFilePath),
            fail: reject,
          });
        });
      },
      fail: reject,
    });
  });
};

/**
 * 微信原生压缩
 * @param {string} src - 图片路径
 * @param {number} quality - 压缩质量
 * @returns {Promise<string>}
 */
const wxCompressImage = (src, quality) => {
  return new Promise((resolve, reject) => {
    wx.compressImage({
      src: src,
      quality: quality,
      success: (res) => resolve(res.tempFilePath),
      fail: reject,
    });
  });
};

/**
 * 人脸检测
 * @param {string} imagePath - 图片路径
 * @returns {Promise<Object>} 检测结果 {success, faceCount, facePosition, message}
 */
export const detectFace = async (imagePath) => {
  try {
    // 调用后端人脸检测接口
    const result = await request({
      url: "/ai/face-detect",
      method: "POST",
      data: { imageUrl: imagePath },
    });
    
    if (result.code === 0) {
      const { faceCount, facePositions, qualityScore } = result.data;
      
      // 校验条件：单人正面、脸部占比足够
      if (faceCount !== 1) {
        return {
          success: false,
          faceCount: faceCount,
          message: faceCount === 0 ? "未检测到人脸，请重新拍摄" : `检测到${faceCount}张人脸，请确保单人正面拍摄`,
        };
      }
      
      // 检查脸部占比（前端可粗略判断）
      if (qualityScore && qualityScore < 60) {
        return {
          success: false,
          faceCount: faceCount,
          message: "照片质量不佳，请确保光线充足、面部清晰可见",
        };
      }
      
      return {
        success: true,
        faceCount: faceCount,
        facePositions: facePositions,
        qualityScore: qualityScore,
      };
    } else {
      return {
        success: false,
        message: result.message || "人脸检测失败，请重试",
      };
    }
  } catch (err) {
    console.error("人脸检测失败:", err);
    return {
      success: false,
      message: "人脸检测服务异常，请稍后重试",
    };
  }
};

/**
 * 图片质量评分（亮度、清晰度、遮挡检测）
 * @param {string} imagePath - 图片路径
 * @returns {Promise<Object>}
 */
export const assessImageQuality = async (imagePath) => {
  try {
    const result = await request({
      url: "/ai/image-quality",
      method: "POST",
      data: { imageUrl: imagePath },
    });
    
    if (result.code === 0) {
      const { score, brightness, sharpness, occlusion } = result.data;
      let message = "";
      
      if (score < 60) {
        if (brightness < 30) message = "光线过暗，请调整光线重拍";
        else if (brightness > 80) message = "光线过强，请调整光线重拍";
        else if (sharpness < 40) message = "照片模糊，请保持手机稳定";
        else if (occlusion) message = "面部有遮挡，请确保面部无遮挡";
        else message = "照片质量不佳，请重拍";
      }
      
      return {
        success: score >= 60,
        score: score,
        brightness: brightness,
        sharpness: sharpness,
        occlusion: occlusion,
        message: message,
      };
    } else {
      return { success: true, score: 100 }; // 默认通过
    }
  } catch (err) {
    console.error("质量评估失败:", err);
    return { success: true, score: 100 }; // 评估失败默认通过
  }
};

/**
 * 上传图片到OSS
 * @param {string} tempFilePath - 压缩后的图片路径
 * @returns {Promise<string>} OSS URL
 */
export const uploadToOSS = async (tempFilePath) => {
  try {
    // 获取上传凭证
    const tokenResult = await request({
      url: "/upload/get-sts-token",
      method: "GET",
    });
    
    if (tokenResult.code !== 0) {
      throw new Error(tokenResult.message || "获取上传凭证失败");
    }
    
    const { ossUrl, credentials } = tokenResult.data;
    
    // 上传文件
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: ossUrl,
        filePath: tempFilePath,
        name: "file",
        formData: credentials,
        success: (res) => {
          try {
            const data = JSON.parse(res.data);
            if (data.url) {
              resolve(data.url);
            } else {
              reject(new Error("上传失败：未返回URL"));
            }
          } catch (err) {
            reject(new Error("解析上传结果失败"));
          }
        },
        fail: reject,
      });
    });
  } catch (err) {
    console.error("上传OSS失败:", err);
    throw err;
  }
};