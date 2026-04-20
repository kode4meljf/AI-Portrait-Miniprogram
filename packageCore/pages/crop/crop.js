// 图片裁剪
Page({
  data: {
    imageSrc: '',
    rotation: 0,
    hasChange: false
  },

  onLoad(options) {
    if (options.src) {
      this.setData({
        imageSrc: decodeURIComponent(options.src)
      });
    } else {
      this.setData({
        imageSrc: '/assets/images/placeholder.png'
      });
    }
  },

  // 旋转
  onRotate() {
    const newRotation = (this.data.rotation + 90) % 360;
    this.setData({
      rotation: newRotation,
      hasChange: true
    });
  },

  // 还原
  onReset() {
    if (!this.data.hasChange) return;
    this.setData({
      rotation: 0,
      hasChange: false
    });
  },

  // 取消
  onCancel() {
    if (this.data.hasChange) {
      wx.showModal({
        title: '提示',
        content: '确定放弃编辑吗？',
        success: (res) => {
          if (res.confirm) wx.navigateBack();
        }
      });
    } else {
      wx.navigateBack();
    }
  },

  // 完成
  onDone() {
    const { imageSrc, rotation } = this.data;
    if (rotation !== 0) {
      wx.showLoading({ title: '处理中...' });
      setTimeout(() => {
        wx.hideLoading();
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        if (prevPage && prevPage.onCropComplete) {
          prevPage.onCropComplete({ src: imageSrc, rotation });
        }
        wx.navigateBack();
      }, 500);
    } else {
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];
      if (prevPage && prevPage.onCropComplete) {
        prevPage.onCropComplete({ src: imageSrc, rotation: 0 });
      }
      wx.navigateBack();
    }
  }
});