/**
 * @file 订单列表页
 * @description 展示所有订单，含预计完成时间、物流信息，支持查看详情
 */

import { getOrderList } from "../../../services/order-service";
import { ORDER_STATUS } from "../../../utils/constants";

Page({
  data: {
    orders: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    statusMap: {
      pending: "待确认",
      confirmed: "已确认",
      processing: "制作中",
      shipped: "已发货",
      arrived: "已到店",
      completed: "已完成",
      cancelled: "已取消",
    },
  },

  onLoad() {
    this.loadOrders();
  },

  onShow() {
    // 刷新订单状态
    this.setData({ orders: [], page: 1, hasMore: true });
    this.loadOrders();
  },

  async loadOrders() {
    if (this.data.loading || !this.data.hasMore) return;
    this.setData({ loading: true });
    try {
      const result = await getOrderList(this.data.page, this.data.pageSize);
      const { list, total } = result;
      if (list.length < this.data.pageSize || this.data.orders.length + list.length >= total) {
        this.setData({ hasMore: false });
      }
      const newOrders = [...this.data.orders, ...list];
      this.setData({
        orders: newOrders,
        page: this.data.page + 1,
        loading: false,
      });
    } catch (err) {
      console.error("加载订单失败:", err);
      this.setData({ loading: false });
      wx.showToast({ title: "加载失败", icon: "none" });
    }
  },

  onViewDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/packageUser/pages/order-detail/order-detail?orderId=${id}`,
    });
  },

  onLoadMore() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadOrders();
    }
  },

  onPullDownRefresh() {
    this.setData({ orders: [], page: 1, hasMore: true });
    this.loadOrders().then(() => {
      wx.stopPullDownRefresh();
    });
  },
});