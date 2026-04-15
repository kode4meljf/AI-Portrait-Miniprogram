Page({
  data: { phone: "", loginLoading: false },
  onPhoneInput(e) { this.setData({ phone: e.detail.value }); },
  onLogin() {
    const { phone } = this.data;
    if (!phone) { wx.showToast({ title: "请输入手机号", icon: "none" }); return; }
    this.setData({ loginLoading: true });
    // 模拟登录成功
    const mockUserInfo = { userId: "dev_" + Date.now(), phone, storeId: "mock_store_001", nickName: "测试用户" };
    const mockToken = "mock_token_" + Date.now();
    wx.setStorageSync("ai_portrait_token", mockToken);
    wx.setStorageSync("ai_portrait_user_info", mockUserInfo);
    wx.setStorageSync("ai_portrait_token_expire", Date.now() + 7 * 24 * 3600 * 1000);
    setTimeout(() => {
      this.setData({ loginLoading: false });
      wx.showToast({ title: "登录成功", icon: "success" });
      wx.switchTab({ url: "/pages/index/index" });
    }, 500);
  },
});