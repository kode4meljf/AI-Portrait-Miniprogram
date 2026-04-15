/**
 * @file 相框款式页
 * @description 展示可选相框列表，选择款式后通知员工下单
 */

import { getFrameList, submitOrder } from "../../../services/order-service";
import { getStorage } from "../../../utils/storage";
import { STORAGE_KEYS } from "../../../utils/constants";

Page({
  data: {
    // 相框列表
    frameList: [],
    // 选中的相框ID
    selectedFrameId: null,
    // 订单ID
    orderId: "",
    // 加载状态
    loading: false,
    // 提交中
    submitting: false,
  },

  onLoad(options) {
    const { orderId } = options;
    this.setData({ orderId: orderId || "" });
    this.loadFrameList();
  },

  async loadFrameList() {
    try {
      this.setData({ loading: true });
      const list = await getFrameList();
      this.setData({
        frameList: list,
        loading: false,
      });
    } catch (err) {
      console.error("加载相框列表失败:", err);
      this.setData({ loading: false });
      wx.showToast({
        title: "加载失败，请重试",
        icon: "none",
      });
    }
  },

  onSelectFrame(e) {
    const { id } = e.currentTarget.dataset;
    this.setData({ selectedFrameId: id });
    
    // 展开详情
    const selected = this.data.frameList.find(f => f.id === id);
    if (selected) {
      wx.showModal({
        title: selected.name,
        content: `材质：${selected.material}\n尺寸：${selected.size}\n价格：¥${selected.price}`,
        showCancel: false,
        confirmText: "知道了",
      });
    }
  },

  async onNotifyEmployee() {
    if (!this.data.selectedFrameId) {
      wx.showToast({
        title: "请先选择相框款式",
        icon: "none",
      });
      return;
    }
    
    if (this.data.submitting) return;
    
    try {
      this.setData({ submitting: true });
      wx.showLoading({ title: "通知员工..." });
      
      const userInfo = getStorage(STORAGE_KEYS.USER_INFO);
      const storeId = userInfo?.storeId || "";
      
      const result = await submitOrder({
        orderId: this.data.orderId,
        frameId: this.data.selectedFrameId,
        storeId: storeId,
      });
      
      if (result.code === 0) {
        wx.hideLoading();
        wx.showModal({
          title: "已通知门店",
          content: "员工确认后会通过服务通知告知您，请留意微信消息。",
          showCancel: false,
          success: () => {
            // 跳转到订单列表页
            wx.switchTab({
              url: "/packageUser/pages/order-list/order-list",
            });
          },
        });
      } else {
        throw new Error(result.message || "通知失败");
      }
    } catch (err) {
      wx.hideLoading();
      console.error("通知员工失败:", err);
      wx.showToast({
        title: err.message || "操作失败，请重试",
        icon: "none",
      });
    } finally {
      this.setData({ submitting: false });
    }
  },
});