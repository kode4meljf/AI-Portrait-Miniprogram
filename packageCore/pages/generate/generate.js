/**
 * @file 生成等待页
 * @description 展示生成动效，轮询任务状态，完成后自动跳转
 */

import { getTaskStatus, cancelTask } from "../../../services/ai-service";
import { TASK_STATUS, STORAGE_KEYS } from "../../../utils/constants";
import { setStorage } from "../../../utils/storage";

Page({
  data: {
    taskId: "",
    styleName: "",
    taskStatus: TASK_STATUS.QUEUEING,
    estimatedTime: 60,
    progress: 0,
    errorMsg: "",
    pollingTimer: null,
    progressTimer: null,
  },

  onLoad(options) {
    const { taskId, styleName } = options;
    if (!taskId) {
      wx.showToast({ title: "参数错误", icon: "none" });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }
    this.setData({
      taskId,
      styleName: decodeURIComponent(styleName || "默认风格"),
    });
    this.startPolling();
    this.startProgressAnimation();
  },

  onUnload() {
    this.stopPolling();
    this.stopProgressAnimation();
  },

  /**
   * 开始轮询任务状态（每3秒）
   */
  startPolling() {
    // 立即执行一次
    this.pollTaskStatus();
    // 设置定时器
    this.data.pollingTimer = setInterval(() => {
      this.pollTaskStatus();
    }, 3000);
  },

  stopPolling() {
    if (this.data.pollingTimer) {
      clearInterval(this.data.pollingTimer);
      this.setData({ pollingTimer: null });
    }
  },

  /**
   * 轮询任务状态（核心逻辑）
   */
  async pollTaskStatus() {
    try {
      const result = await getTaskStatus(this.data.taskId);
      const { status, estimatedTime, progress, resultImages, errorMsg } = result;

      this.setData({ taskStatus: status });

      if (status === TASK_STATUS.QUEUEING) {
        // 更新预估时间
        if (estimatedTime) {
          this.setData({ estimatedTime });
        }
      } else if (status === TASK_STATUS.GENERATING) {
        // 更新进度（如果后端返回了进度）
        if (progress !== undefined) {
          this.setData({ progress });
        }
      } else if (status === TASK_STATUS.COMPLETED) {
        // 生成完成
        this.stopPolling();
        this.stopProgressAnimation();
        // 缓存结果（用于后续页面）
        if (resultImages && resultImages.length) {
          setStorage(`${STORAGE_KEYS.GENERATE_CACHE}_${this.data.taskId}`, {
            taskId: this.data.taskId,
            images: resultImages,
            styleName: this.data.styleName,
            timestamp: Date.now(),
          });
        }
        // 跳转到写真展示页
        wx.redirectTo({
          url: `/packageCore/pages/gallery/gallery?taskId=${this.data.taskId}&images=${encodeURIComponent(JSON.stringify(resultImages || []))}`,
        });
      } else if (status === TASK_STATUS.FAILED) {
        // 生成失败
        this.stopPolling();
        this.stopProgressAnimation();
        this.setData({ errorMsg: errorMsg || "生成失败，请重试" });
        wx.showModal({
          title: "生成失败",
          content: this.data.errorMsg,
          confirmText: "重新生成",
          cancelText: "返回首页",
          success: (res) => {
            if (res.confirm) {
              wx.navigateBack();
            } else {
              wx.navigateBack({ delta: 2 });
            }
          },
        });
      }
    } catch (err) {
      console.error("轮询任务状态失败:", err);
      // 轮询失败不中断，继续重试
    }
  },

  /**
   * 进度动画（模拟，仅当后端未提供进度时使用）
   */
  startProgressAnimation() {
    // 初始进度为0
    let currentProgress = 0;
    // 每2秒增加5%，最多到95%
    this.data.progressTimer = setInterval(() => {
      if (currentProgress < 95) {
        currentProgress += 5;
        this.setData({ progress: currentProgress });
      }
    }, 2000);
  },

  stopProgressAnimation() {
    if (this.data.progressTimer) {
      clearInterval(this.data.progressTimer);
      this.setData({ progressTimer: null });
    }
  },

  /**
   * 手动刷新状态
   */
  onRefresh() {
    this.pollTaskStatus();
  },

  /**
   * 取消生成
   */
  async onCancel() {
    wx.showModal({
      title: "提示",
      content: "确定要取消生成吗？",
      confirmText: "确定",
      cancelText: "继续等待",
      success: async (res) => {
        if (res.confirm) {
          try {
            await cancelTask(this.data.taskId);
          } catch (err) {
            console.error("取消任务失败:", err);
          }
          this.stopPolling();
          this.stopProgressAnimation();
          wx.navigateBack();
        }
      },
    });
  },

  onShareAppMessage() {
    return {
      title: "AI写真馆 | 一键生成专属AI写真",
      path: "/pages/index/index",
    };
  },
});