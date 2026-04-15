/**
 * @file 选图确认页
 * @description 大图展示已选写真，可重新选择，确认后通知门店工作台
 */

import { post } from "../../../utils/request";
import { getStorage } from "../../../utils/storage";
import { STORAGE_KEYS } from "../../../utils/constants";

Page({
  data: {
    // 当前选中的图片URL
    imageUrl: "",
    // 任务ID
    taskId: "",
    // 选中的索引
    selectedIndex: 0,
    // 所有写真列表（用于切换）
    allImages: [],
    // 提交中
    submitting: false,
  },

  onLoad(options) {
    const { taskId, imageUrl, index } = options;
    this.setData({
      taskId: taskId || "",
      imageUrl: decodeURIComponent(imageUrl || ""),
      selectedIndex: parseInt(index) || 0,
    });
    
    // 获取所有写真列表（从缓存）
    this.loadAllImages();
  },

  async loadAllImages() {
    const cacheKey = `${STORAGE_KEYS.GENERATE_CACHE}_${this.data.taskId}`;
    const cached = getStorage(cacheKey);
    if (cached && cached.images) {
      this.setData({ allImages: cached.images });
    }
  },

  /**
   * 预览大图（左右滑动）
   */
  onPreviewImage() {
    wx.previewImage({
      current: this.data.imageUrl,
      urls: this.data.allImages.length ? this.data.allImages : [this.data.imageUrl],
    });
  },

  /**
   * 重新选择（返回写真展示页）
   */
  onReselect() {
    wx.navigateBack();
  },

  /**
   * 确认选图，通知门店工作台
   */
  async onConfirm() {
    if (this.data.submitting) return;
    
    try {
      this.setData({ submitting: true });
      wx.showLoading({ title: "确认中..." });
      
      const userInfo = getStorage(STORAGE_KEYS.USER_INFO);
      const storeId = userInfo?.storeId || "";
      
      // 通知门店工作台
      const result = await post("/order/create", {
        taskId: this.data.taskId,
        imageUrl: this.data.imageUrl,
        storeId: storeId,
        selectedIndex: this.data.selectedIndex,
      });
      
      if (result.code === 0) {
        wx.hideLoading();
        // 跳转到相框款式页
        wx.navigateTo({
          url: `/packageCore/pages/frame/frame?orderId=${result.data.orderId}`,
        });
      } else {
        throw new Error(result.message || "确认失败");
      }
    } catch (err) {
      wx.hideLoading();
      console.error("确认选图失败:", err);
      wx.showToast({
        title: err.message || "确认失败，请重试",
        icon: "none",
      });
    } finally {
      this.setData({ submitting: false });
    }
  },

  /**
   * 跳转相框款式页
   */
  onGoToFrame() {
    // 已在确认时跳转，此方法供底部按钮使用
    if (this.data.orderId) {
      wx.navigateTo({
        url: `/packageCore/pages/frame/frame?orderId=${this.data.orderId}`,
      });
    }
  },
});