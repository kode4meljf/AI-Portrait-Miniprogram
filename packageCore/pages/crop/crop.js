// 图片裁剪
Page({
  data: {
    imageSrc: '',
    rotation: 0,
    hasChange: false
  },

  onLoad(options) {
    // 获取传入的图片路径
    if (options.src) {
      this.setData({
        imageSrc: decodeURIComponent(options.src)
      });
    } else {
      // 使用占位图
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
          if (res.confirm) {
            wx.navigateBack();
          }
        }
      });
    } else {
      wx.navigateBack();
    }
  },

  // 完成
  onDone() {
    const { imageSrc, rotation } = this.data;
    
    // 如果有旋转，需要处理图片
    if (rotation !== 0) {
      wx.showLoading({ title: '处理中...' });
      
      // TODO: 使用 canvas 旋转图片
      // 这里简化处理，直接返回图片路径和旋转角度
      setTimeout(() => {
        wx.hideLoading();
        
        // 返回结果给上一页
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        if (prevPage) {
          // 调用上一页的回调函数
          if (prevPage.onCropComplete) {
            prevPage.onCropComplete({
              src: imageSrc,
              rotation: rotation
            });
          }
        }
        
        wx.navigateBack();
      }, 500);
    } else {
      // 没有旋转，直接返回
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];
      if (prevPage && prevPage.onCropComplete) {
        prevPage.onCropComplete({
          src: imageSrc,
          rotation: 0
        });
      }
      wx.navigateBack();
    }
  }
});
