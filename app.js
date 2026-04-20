/**
 * @file 小程序全局入口文件
 * @author AI写真团队
 * @date 2026-04-13
 * @description 小程序初始化、全局数据管理、生命周期处理
 */

import { SECRET_CONFIG, STORAGE_KEYS, API_CONFIG } from "./utils/constants";
import { encryptStorage, decryptStorage } from "./utils/storage";

App({
  /**
   * 全局数据
   */
  globalData: {
    userInfo: null,           // 用户信息
    token: null,              // 登录令牌
    isLoggedIn: false,        // 登录状态
    storeId: null,            // 门店ID
    points: 0,                // 用户积分
    orderRefreshTimer: null,  // 订单状态轮询定时器
  },

  /**
   * 小程序启动时执行
   */
  onLaunch(options) {
    // 初始化云开发环境
    if (wx.cloud) {
      wx.cloud.init({
        env: 'ai-photo-0g22lzk94d0b6846', // TODO: 替换为你的云开发环境ID
        traceUser: true
      });
      this.cloud = wx.cloud;
    }
    
    // 检查登录状态
    this.checkLoginStatus();
    
    // 初始化微信服务通知订阅（可选，在需要时调用）
    this.initSubscribeMessage();
    
    // 获取系统信息
    this.getSystemInfo();
    
    // 性能监控（开发环境）
    if (wx.getPerformance) {
      const performance = wx.getPerformance();
      console.log("小程序启动性能监控已启用");
    }
  },

  /**
   * 检查登录状态
   */
  async checkLoginStatus() {
    try {
      // 从加密存储中读取token
      const token = decryptStorage(STORAGE_KEYS.TOKEN);
      const userInfo = decryptStorage(STORAGE_KEYS.USER_INFO);
      const expireTime = decryptStorage(STORAGE_KEYS.TOKEN_EXPIRE);
      
      if (token && userInfo && expireTime && Date.now() < expireTime) {
        // token有效，恢复登录状态
        this.globalData.token = token;
        this.globalData.userInfo = userInfo;
        this.globalData.storeId = userInfo.storeId;
        this.globalData.isLoggedIn = true;
        
        // 获取最新用户积分
        this.refreshUserPoints();
        
        // 启动订单状态轮询
        this.startOrderPolling();
      } else {
        // token无效或已过期
        this.clearLoginState();
      }
    } catch (err) {
      console.error("检查登录状态失败:", err);
      this.clearLoginState();
    }
  },

  /**
   * 刷新用户积分
   */
  async refreshUserPoints() {
    if (!this.globalData.isLoggedIn) return;
    
    try {
      const points = await this.requestUserPoints();
      this.globalData.points = points;
    } catch (err) {
      console.error("获取积分失败:", err);
    }
  },

  /**
   * 清除登录状态
   */
  clearLoginState() {
    this.globalData.userInfo = null;
    this.globalData.token = null;
    this.globalData.isLoggedIn = false;
    this.globalData.storeId = null;
  },

  /**
   * 获取系统信息
   */
  getSystemInfo() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      this.globalData.systemInfo = systemInfo;
    } catch (err) {
      console.error("获取系统信息失败:", err);
    }
  },

  /**
   * 初始化订阅消息（预先授权）
   */
  initSubscribeMessage() {
    // 在需要时调用，此处仅预留接口
    // 实际调用时机在用户触发操作时
  },

  /**
   * 请求用户积分
   */
  requestUserPoints() {
    return new Promise((resolve, reject) => {
      // 实际项目中调用后端接口获取积分
      // 模拟数据
      setTimeout(() => resolve(1280), 100);
    });
  },

  /**
   * 启动订单状态轮询
   */
  startOrderPolling() {
    if (this.globalData.orderRefreshTimer) {
      clearInterval(this.globalData.orderRefreshTimer);
    }
    
    this.globalData.orderRefreshTimer = setInterval(() => {
      if (this.globalData.isLoggedIn) {
        this.refreshOrderStatus();
      }
    }, 30000); // 每30秒轮询一次订单状态
  },

  /**
   * 刷新订单状态
   */
  async refreshOrderStatus() {
    try {
      // 调用后端接口获取最新订单状态
      // 通过事件总线通知各页面更新
      const eventChannel = this.getEventChannel();
      if (eventChannel && eventChannel.emit) {
        eventChannel.emit("orderStatusUpdate");
      }
    } catch (err) {
      console.error("刷新订单状态失败:", err);
    }
  },

  /**
   * 小程序显示时执行
   */
  onShow(options) {
    // 刷新用户信息（如果已登录）
    if (this.globalData.isLoggedIn) {
      this.refreshUserPoints();
    }
  },

  /**
   * 小程序隐藏时执行
   */
  onHide() {
    // 保留定时器，不在此处清除，因为后台仍需接收通知
    // 订单轮询定时器在页面退出登录时才会清除
  },

  /**
   * 页面错误监听
   */
  onError(err) {
    console.error("小程序全局错误:", err);
    // 可上报错误到监控平台
  }
});