// 门店中心页
const app = getApp();

Page({
  data: {
    // 门店信息
    storeInfo: {
      name: '',
      contact: '',
      phone: '',
      address: ''
    },
    // 会员数据
    memberData: {
      levelName: '加载中...',
      remainingUses: '--',
      monthlyUsed: 0,
      monthlyTotal: 0,
      monthlyPercent: 0,
      expireDays: '--',
      expirePercent: 0
    },
    // 订单统计
    orderStats: {
      totalAmount: 0,
      monthPct: 0,
      portraitFrame: 0,
      album: 0,
      travelVideo: 0,
      memoir: 0
    },
    // 打卡数据
    checkinStats: {
      yesterday: '--',
      today: '--',
      uncheckedCount: '--',
      uncheckedList: []
    }
  },

  onLoad() {
    this.loadAllData();
  },

  onShow() {
    // 每次显示页面时刷新打卡数据
    this.loadCheckinStats();
  },

  loadAllData() {
    wx.showLoading({ title: '加载中...' });
    Promise.all([
      this.loadProfileStats(),
      this.loadOrderStats(),
      this.loadCheckinStats()
    ]).finally(() => {
      wx.hideLoading();
    });
  },

  // 加载门店信息 + 会员数据
  loadProfileStats() {
    return new Promise((resolve) => {
      if (app.globalData.IS_DEV) {
        // Mock 数据（开发阶段）
        setTimeout(() => {
          this.setData({
            storeInfo: {
              name: '禅城澜石店',
              contact: '张经理',
              phone: '138-0000-0000',
              address: '上海市徐汇区漕宝路88号光影广场3楼301室'
            },
            memberData: {
              levelName: '黄金会员',
              remainingUses: 186,
              monthlyUsed: 64,
              monthlyTotal: 250,
              monthlyPercent: 26,
              expireDays: 32,
              expirePercent: 55
            }
          });
          resolve();
        }, 300);
        return;
      }

      wx.cloud.callFunction({
        name: 'getProfileStats',
        success: res => {
          if (res.result.code === 0) {
            const d = res.result.data;
            this.setData({
              storeInfo: d.storeInfo,
              memberData: d.memberData
            });
          }
        },
        fail: err => console.error(err),
        complete: () => resolve()
      });
    });
  },

  // 加载订单统计
  loadOrderStats() {
    return new Promise((resolve) => {
      if (app.globalData.IS_DEV) {
        setTimeout(() => {
          this.setData({
            orderStats: {
              totalAmount: 28640,
              monthPct: 12,
              portraitFrame: 128,
              album: 56,
              travelVideo: 34,
              memoir: 22
            }
          });
          resolve();
        }, 200);
        return;
      }

      wx.cloud.callFunction({
        name: 'getOrderStats',
        success: res => {
          if (res.result.code === 0) {
            this.setData({ orderStats: res.result.data });
          }
        },
        fail: err => console.error(err),
        complete: () => resolve()
      });
    });
  },

  // 加载打卡数据
  loadCheckinStats() {
    return new Promise((resolve) => {
      if (app.globalData.IS_DEV) {
        setTimeout(() => {
          this.setData({
            checkinStats: {
              yesterday: 43,
              today: 27,
              uncheckedCount: 16,
              uncheckedList: []
            }
          });
          resolve();
        }, 200);
        return;
      }

      wx.cloud.callFunction({
        name: 'getCheckinStats',
        success: res => {
          if (res.result.code === 0) {
            this.setData({ checkinStats: res.result.data });
          }
        },
        fail: err => console.error(err),
        complete: () => resolve()
      });
    });
  },

  // 编辑门店信息
  onEditStore() {
    wx.showToast({ title: '编辑功能开发中', icon: 'none' });
  },

  // 充值套餐
  onRecharge() {
    wx.showToast({ title: '充值功能开发中', icon: 'none' });
  },

  // 点击查看全部订单（按品类筛选）
  onViewOrders() {
    wx.navigateTo({
      url: '/packageUser/pages/order-list/order-list'
    });
  },

  // 点击品类卡片
  onCategoryTap(e) {
    const type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: `/packageUser/pages/order-list/order-list?category=${type}`
    });
  },

  // 查看未打卡名单
  onViewUnchecked() {
    const unchecked = this.data.checkinStats.uncheckedList;
    if (!unchecked || unchecked.length === 0) {
      wx.showToast({ title: '暂无未打卡数据', icon: 'none' });
      return;
    }
    const names = unchecked.map(i => `${i.name} ${i.phone}`).join('\n');
    wx.showModal({
      title: '今日未打卡名单',
      content: names,
      showCancel: false
    });
  },

  // 查看打卡详情
  onViewCheckinDetail() {
    wx.showToast({ title: '打卡详情开发中', icon: 'none' });
  }
});