/**
 * @file 首页入口页
 * @author AI写真团队
 * @date 2026-04-13
 * @description 展示「立即拍摄」按钮和已完成写真案例，引导用户开始体验
 */

import { get } from "../../utils/request";
import { STORAGE_KEYS } from "../../utils/constants";
import { decryptStorage } from "../../utils/storage";

Page({
  data: {
    // 案例写真列表（最多6张）
    caseImages: [],
    // 加载状态
    loading: false,
    // 是否已登录
    isLoggedIn: false,
  },

  /**
   * 页面加载
   */
  onLoad(options) {
    this.checkLoginStatus();
    this.loadCaseImages();
  },

  /**
   * 页面显示
   */
  onShow() {
    this.checkLoginStatus();
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const token = decryptStorage(STORAGE_KEYS.TOKEN);
    const isLoggedIn = !!token;
    this.setData({ isLoggedIn });
    
    // 如果已登录，可以加载用户相关数据
    if (isLoggedIn) {
      this.loadUserInfo();
    }
  },

  /**
   * 加载用户信息
   */
  async loadUserInfo() {
    try {
      const userInfo = decryptStorage(STORAGE_KEYS.USER_INFO);
      if (userInfo) {
        this.setData({ userInfo });
      }
    } catch (err) {
      console.error("加载用户信息失败:", err);
    }
  },

  /**
   * 加载案例写真图片
   */
  async loadCaseImages() {
    const IS_DEV = true; // 开发模式，上线前改为 false

    if (IS_DEV) {
      this.setData({ caseImages: this.getDefaultCaseImages() });
      return;
    }

    try {
      this.setData({ loading: true });
      
      // 从后端获取案例图片
      const result = await get("/case/list", { limit: 6 });
      
      if (result.code === 0 && result.data.list) {
        this.setData({
          caseImages: result.data.list,
        });
      } else {
        this.setData({
          caseImages: this.getDefaultCaseImages(),
        });
      }
    } catch (err) {
      console.error("加载案例图片失败:", err);
      this.setData({
        caseImages: this.getDefaultCaseImages(),
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 获取默认案例图片
   */
  getDefaultCaseImages() {
    return [
      { id: "1", url: "/assets/images/case-1.jpg", title: "古风写真" },
      { id: "2", url: "/assets/images/case-2.jpg", title: "韩系写真" },
      { id: "3", url: "/assets/images/case-3.jpg", title: "日系清新" },
      { id: "4", url: "/assets/images/case-4.jpg", title: "欧式复古" },
      { id: "5", url: "/assets/images/case-5.jpg", title: "国潮风" },
      { id: "6", url: "/assets/images/case-6.jpg", title: "梦幻童话" },
    ];
  },

  /**
   * 立即拍摄按钮点击
   */
  onStartShoot() {
    // 检查登录状态
    if (!this.data.isLoggedIn) {
      wx.showModal({
        title: "提示",
        content: "请先登录后使用",
        confirmText: "去登录",
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: "/packageUser/pages/login/login",
            });
          }
        },
      });
      return;
    }
    
    // 跳转到拍照/上传页
    wx.navigateTo({
      url: "/packageCore/pages/upload/upload",
    });
  },

  /**
   * 点击案例图片查看大图
   */
  onPreviewImage(e) {
    const { url, index } = e.currentTarget.dataset;
    const urls = this.data.caseImages.map((img) => img.url);
    
    wx.previewImage({
      current: url,
      urls: urls,
    });
  },

  /**
   * 页面分享配置
   */
  onShareAppMessage() {
    return {
      title: "AI写真馆 | 一键生成专属AI写真",
      path: "/pages/index/index",
      imageUrl: "/assets/images/share-cover.png",
    };
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    return {
      title: "AI写真馆 | 一键生成专属AI写真",
      query: "",
      imageUrl: "/assets/images/share-cover.png",
    };
  },
});