/**
 * @file 拍照/上传页
 * @author AI写真团队
 * @date 2026-04-13
 * @description 支持拍摄或从相册选择，进行人脸检测和质量校验后提交后端
 */

import { compressImage, detectFace, assessImageQuality, uploadToOSS } from "../../../utils/image-helper";
import { post } from "../../../utils/request";
import { checkImageSecurity } from "../../../utils/security";

Page({
  data: {
    mode: "camera",
    processing: false,
    tempImagePath: "",
    previewUrl: "",
    faceDetectResult: null,
    qualityResult: null,
  },

  cameraContext: null,

  onLoad() {
    this.initCamera();
  },

  onUnload() {
    this.cameraContext = null;
  },

  initCamera() {
    try {
      this.cameraContext = wx.createCameraContext();
    } catch (err) {
      console.error("初始化相机失败:", err);
    }
  },

  onModeChange(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ mode });
    if (mode === "camera") this.initCamera();
  },

  onTakePhoto() {
    if (!this.cameraContext) {
      wx.showToast({ title: "相机未就绪", icon: "none" });
      return;
    }
    wx.showLoading({ title: "拍摄中..." });
    this.cameraContext.takePhoto({
      quality: "high",
      success: (res) => {
        wx.hideLoading();
        this.processImage(res.tempImagePath);
      },
      fail: (err) => {
        wx.hideLoading();
        console.error("拍照失败:", err);
        wx.showToast({ title: "拍照失败，请重试", icon: "none" });
      },
    });
  },

  onChooseFromAlbum() {
    wx.chooseImage({
      count: 1,
      sizeType: ["original", "compressed"],
      sourceType: ["album"],
      success: (res) => {
        this.processImage(res.tempFilePaths[0]);
      },
      fail: (err) => console.error("选择图片失败:", err),
    });
  },

  async processImage(imagePath) {
    this.setData({ processing: true, tempImagePath: imagePath });
    try {
      wx.showLoading({ title: "压缩图片..." });
      const compressedPath = await compressImage(imagePath);

      wx.showLoading({ title: "人脸检测..." });
      const faceResult = await detectFace(compressedPath);
      if (!faceResult.success) {
        wx.hideLoading();
        wx.showModal({
          title: "人脸检测失败",
          content: faceResult.message || "请确保照片为单人正面且面部清晰",
          confirmText: "重新拍摄",
          success: (res) => { if (res.confirm) this.resetImage(); },
        });
        this.setData({ processing: false });
        return;
      }
      this.setData({ faceDetectResult: faceResult });

      wx.showLoading({ title: "质量评估..." });
      const qualityResult = await assessImageQuality(compressedPath);
      if (!qualityResult.success) {
        wx.hideLoading();
        wx.showModal({
          title: "照片质量不佳",
          content: qualityResult.message || "请确保光线充足、照片清晰",
          confirmText: "重新拍摄",
          success: (res) => { if (res.confirm) this.resetImage(); },
        });
        this.setData({ processing: false });
        return;
      }
      this.setData({ qualityResult });

      wx.showLoading({ title: "安全检测..." });
      const isSafe = await checkImageSecurity(compressedPath);
      if (!isSafe) {
        wx.hideLoading();
        wx.showModal({
          title: "图片不合规",
          content: "上传的图片包含违规内容，请重新选择",
          confirmText: "重新选择",
          success: (res) => { if (res.confirm) this.resetImage(); },
        });
        this.setData({ processing: false });
        return;
      }

      this.setData({ previewUrl: compressedPath, processing: false });
      wx.hideLoading();
      wx.showToast({ title: "照片校验通过", icon: "success" });
    } catch (err) {
      wx.hideLoading();
      console.error("图片处理失败:", err);
      wx.showModal({ title: "处理失败", content: err.message || "图片处理异常", showCancel: false });
      this.setData({ processing: false });
    }
  },

  resetImage() {
    this.setData({ tempImagePath: "", previewUrl: "", faceDetectResult: null, qualityResult: null });
  },

  async onGenerate() {
    if (!this.data.previewUrl) {
      wx.showToast({ title: "请先拍摄照片", icon: "none" });
      return;
    }
    try {
      wx.showLoading({ title: "上传中..." });
      const ossUrl = await uploadToOSS(this.data.previewUrl);
      const result = await post("/ai/create-task", { imageUrl: ossUrl });
      if (result.code === 0) {
        const { taskId } = result.data;
        wx.navigateTo({ url: `/packageCore/pages/style/style?taskId=${taskId}&imageUrl=${encodeURIComponent(ossUrl)}` });
      } else {
        throw new Error(result.message || "创建任务失败");
      }
    } catch (err) {
      wx.hideLoading();
      console.error("提交失败:", err);
      wx.showToast({ title: err.message || "提交失败", icon: "none" });
    } finally {
      wx.hideLoading();
    }
  },

  onPreviewImage() {
    if (this.data.previewUrl) wx.previewImage({ urls: [this.data.previewUrl] });
  },
});