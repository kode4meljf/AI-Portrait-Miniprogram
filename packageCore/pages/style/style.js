/**
 * @file 风格选择页
 * @description 展示上线风格列表，宫格大图展示，选中后提交生成任务
 */

import { getStyleList, createGenerateTask } from "../../../services/ai-service";
import { getStorage } from "../../../utils/storage";
import { STORAGE_KEYS } from "../../../utils/constants";

Page({
  data: {
    styleList: [],
    selectedStyleId: null,
    taskId: "",
    imageUrl: "",
    loading: false,
    submitting: false,
  },

  onLoad(options) {
    const { taskId, imageUrl } = options;
    this.setData({
      taskId: taskId || "",
      imageUrl: decodeURIComponent(imageUrl || ""),
    });
    this.loadStyleList();
  },

  async loadStyleList() {
    try {
      this.setData({ loading: true });
      const list = await getStyleList();
      this.setData({ styleList: list, loading: false });
    } catch (err) {
      console.error("加载风格列表失败:", err);
      this.setData({ loading: false });
      wx.showToast({ title: "加载失败，请重试", icon: "none" });
    }
  },

  onSelectStyle(e) {
    const { id } = e.currentTarget.dataset;
    this.setData({ selectedStyleId: id });
  },

  async onGenerate() {
    if (!this.data.selectedStyleId) {
      wx.showToast({ title: "请先选择一个风格", icon: "none" });
      return;
    }
    if (this.data.submitting) return;
    try {
      this.setData({ submitting: true });
      wx.showLoading({ title: "提交任务..." });
      const userInfo = getStorage(STORAGE_KEYS.USER_INFO);
      const storeId = userInfo?.storeId || "";
      let taskId = this.data.taskId;
      if (!taskId) {
        const result = await createGenerateTask({
          imageUrl: this.data.imageUrl,
          styleId: this.data.selectedStyleId,
          storeId,
        });
        taskId = result.taskId;
      } else {
        await createGenerateTask({ taskId, styleId: this.data.selectedStyleId });
      }
      wx.hideLoading();
      const selectedStyle = this.data.styleList.find(s => s.id === this.data.selectedStyleId);
      const styleName = selectedStyle ? selectedStyle.name : "";
      wx.navigateTo({ url: `/packageCore/pages/generate/generate?taskId=${taskId}&styleName=${encodeURIComponent(styleName)}` });
    } catch (err) {
      wx.hideLoading();
      console.error("生成失败:", err);
      wx.showToast({ title: err.message || "提交失败，请重试", icon: "none" });
    } finally {
      this.setData({ submitting: false });
    }
  },

  onPreviewStyle(e) {
    const { url } = e.currentTarget.dataset;
    const urls = this.data.styleList.map(s => s.previewUrl);
    wx.previewImage({ current: url, urls });
  },
});