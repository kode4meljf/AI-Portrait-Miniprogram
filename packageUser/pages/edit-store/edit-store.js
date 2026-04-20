// 编辑门店信息
Page({
  data: {
    formData: {
      name: '',
      contact: '',
      phone: '',
      address: ''
    },
    originalData: null,
    hasChange: false
  },

  onLoad(options) {
    // 获取当前门店信息
    this.loadStoreInfo();
  },

  // 加载门店信息
  loadStoreInfo() {
    // Mock数据
    const storeInfo = {
      name: '光影记忆摄影工作室',
      contact: '张经理',
      phone: '138****8888',
      address: '北京市朝阳区建国路88号SOHO现代城B座1208'
    };

    this.setData({
      formData: { ...storeInfo },
      originalData: { ...storeInfo }
    });
  },

  // 输入变化
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`formData.${field}`]: value
    }, () => {
      this.checkChange();
    });
  },

  // 检查是否有修改
  checkChange() {
    const { formData, originalData } = this.data;
    const hasChange = Object.keys(formData).some(
      key => formData[key] !== originalData[key]
    );
    this.setData({ hasChange });
  },

  // 顶部保存按钮
  onSave() {
    if (!this.data.hasChange) return;
    this.submitForm();
  },

  // 底部保存按钮
  onSubmit() {
    this.submitForm();
  },

  // 提交表单
  submitForm() {
    const { formData } = this.data;
    
    // 表单验证
    if (!formData.name.trim()) {
      wx.showToast({ title: '请输入门店名称', icon: 'none' });
      return;
    }
    if (!formData.contact.trim()) {
      wx.showToast({ title: '请输入联系人', icon: 'none' });
      return;
    }
    if (!formData.phone.trim()) {
      wx.showToast({ title: '请输入联系电话', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中...' });
    
    // TODO: 调用云函数保存数据
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: '保存成功', icon: 'success' });
      
      // 更新原始数据
      this.setData({
        originalData: { ...formData },
        hasChange: false
      });

      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }, 1000);
  },

  // 返回
  onBack() {
    if (this.data.hasChange) {
      wx.showModal({
        title: '提示',
        content: '有未保存的修改，确定返回吗？',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack();
          }
        }
      });
    } else {
      wx.navigateBack();
    }
  }
});
