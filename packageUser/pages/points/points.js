/**
 * @file 积分体系页
 * @description 展示用户积分余额、获取记录、积分规则
 */

import { getUserPoints } from "../../../services/user-service";

Page({
  data: {
    points: 0,
    records: [],
    loading: false,
    rules: [
      { action: "首次登录", points: 100 },
      { action: "每日签到", points: 10 },
      { action: "生成写真", points: 50 },
      { action: "分享小程序", points: 20 },
      { action: "评价订单", points: 30 },
    ],
  },

  onLoad() {
    this.loadPoints();
    this.loadRecords();
  },

  async loadPoints() {
    try {
      const points = await getUserPoints();
      this.setData({ points });
    } catch (err) {
      console.error("获取积分失败:", err);
    }
  },

  async loadRecords() {
    this.setData({ loading: true });
    try {
      // 调用后端获取积分明细
      // 模拟数据
      const mockRecords = [
        { time: "2026-04-13 10:30", action: "生成写真", points: 50, type: "income" },
        { time: "2026-04-12 15:20", action: "分享小程序", points: 20, type: "income" },
        { time: "2026-04-11 09:00", action: "兑换相框", points: -100, type: "expense" },
      ];
      this.setData({ records: mockRecords, loading: false });
    } catch (err) {
      console.error("加载积分记录失败:", err);
      this.setData({ loading: false });
    }
  },

  onGoToShare() {
    // 引导分享
    wx.showShareMenu({
      withShareTicket: true,
      menus: ["shareAppMessage", "shareTimeline"],
    });
    wx.showToast({ title: "点击右上角分享", icon: "none" });
  },

  onViewRules() {
    wx.showModal({
      title: "积分规则",
      content: this.data.rules.map(r => `${r.action}：+${r.points}分`).join("\n"),
      showCancel: false,
    });
  },

  onShareAppMessage() {
    // 分享成功回调可增加积分
    return {
      title: "AI写真馆 | 生成专属AI写真",
      path: "/pages/index/index",
      success: () => {
        wx.showToast({ title: "分享成功 +20积分", icon: "success" });
        // 调用后端增加积分
      },
    };
  },
});