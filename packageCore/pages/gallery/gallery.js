/**
 * @file 写真展示页
 * @description 9宫格展示生成的写真，支持预览、选择
 */

import { getTaskResult } from "../../../services/ai-service";
import { setStorage, getStorage } from "../../../utils/storage";
import { STORAGE_KEYS } from "../../../utils/constants";

Page({
  data: {
    images: [],
    taskId: "",
    selectedIndex: -1,
    loading: true,
  },

  onLoad(options) {
    const { taskId, images } = options;
    this.setData({ taskId });
    if (images) {
      try {
        const imageList = JSON.parse(decodeURIComponent(images));
        this.setData({ images: imageList, loading: false });
      } catch (err) { this.loadFromCache(); }
    } else { this.loadFromCache(); }
  },

  async loadFromCache() {
    const cacheKey = `${STORAGE_KEYS.GENERATE_CACHE}_${this.data.taskId}`;
    const cached = getStorage(cacheKey);
    if (cached && cached.images) {
      this.setData({ images: cached.images, loading: false });
    } else { await this.fetchResult(); }
  },

  async fetchResult() {
    try {
      this.setData({ loading: true });
      const result = await getTaskResult(this.data.taskId);
      if (result.images && result.images.length > 0) this.setData({ images: result.images });
      else throw new Error("未获取到写真图片");
    } catch (err) {
      console.error("获取结果失败:", err);
      wx.showModal({ title: "加载失败", content: "无法获取写真结果，请返回重试", showCancel: false, success: () => wx.navigateBack() });
    } finally { this.setData({ loading: false }); }
  },

  onPreviewImage(e) {
    const { index } = e.currentTarget.dataset;
    wx.previewImage({ current: this.data.images[index], urls: this.data.images });
  },

  onLongPressImage(e) {
    const { index, url } = e.currentTarget.dataset;
    wx.showActionSheet({
      itemList: ["保存到相册", "设为封面"],
      success: (res) => {
        if (res.tapIndex === 0) this.saveToAlbum(url);
        else if (res.tapIndex === 1) this.setAsCover(index);
      },
    });
  },

  saveToAlbum(url) {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting["scope.writePhotosAlbum"]) this.downloadAndSave(url);
        else wx.authorize({ scope: "scope.writePhotosAlbum", success: () => this.downloadAndSave(url), fail: () => wx.showModal({ title: "提示", content: "需要您授权保存图片到相册", showCancel: false }) });
      },
    });
  },

  downloadAndSave(url) {
    wx.showLoading({ title: "保存中..." });
    wx.downloadFile({
      url, success: (res) => {
        wx.saveImageToPhotosAlbum({ filePath: res.tempFilePath, success: () => { wx.hideLoading(); wx.showToast({ title: "保存成功", icon: "success" }); }, fail: (err) => { wx.hideLoading(); console.error("保存失败:", err); wx.showToast({ title: "保存失败", icon: "none" }); } });
      }, fail: (err) => { wx.hideLoading(); console.error("下载失败:", err); wx.showToast({ title: "下载失败", icon: "none" }); }
    });
  },

  setAsCover(index) { wx.showToast({ title: "已设为封面", icon: "success" }); },

  onSelectImage(e) {
    const { index, url } = e.currentTarget.dataset;
    this.setData({ selectedIndex: index });
    wx.navigateTo({ url: `/packageCore/pages/confirm/confirm?taskId=${this.data.taskId}&imageUrl=${encodeURIComponent(url)}&index=${index}` });
  },
});