/**
 * @file 写真云相册页
 * @description 展示用户所有历史写真，按时间倒序，支持筛选和下载
 */

import { getAlbumList } from "../../../services/user-service";

Page({
  data: {
    albums: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 20,
    filterType: "all", // all / year
    selectedYear: "",
    years: [],
  },

  onLoad() {
    this.loadAlbums();
  },

  onShow() {
    // 每次显示刷新列表（可能有新生成的写真）
    this.setData({ albums: [], page: 1, hasMore: true });
    this.loadAlbums();
  },

  async loadAlbums() {
    if (this.data.loading || !this.data.hasMore) return;
    this.setData({ loading: true });
    try {
      const list = await getAlbumList(this.data.page, this.data.pageSize);
      if (list.length < this.data.pageSize) {
        this.setData({ hasMore: false });
      }
      const newAlbums = [...this.data.albums, ...list];
      this.setData({
        albums: newAlbums,
        page: this.data.page + 1,
        loading: false,
      });
      this.extractYears(newAlbums);
    } catch (err) {
      console.error("加载相册失败:", err);
      this.setData({ loading: false });
      wx.showToast({ title: "加载失败", icon: "none" });
    }
  },

  extractYears(albums) {
    const yearsSet = new Set();
    albums.forEach(item => {
      const year = new Date(item.createTime).getFullYear();
      yearsSet.add(year);
    });
    const years = Array.from(yearsSet).sort((a, b) => b - a);
    this.setData({ years });
  },

  onFilterChange(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ filterType: type });
    if (type === "year") {
      // 弹出年份选择器
      wx.showActionSheet({
        itemList: this.data.years.map(y => y + "年"),
        success: (res) => {
          const selectedYear = this.data.years[res.tapIndex];
          this.setData({ selectedYear });
          this.filterAlbums();
        },
      });
    } else {
      this.setData({ selectedYear: "" });
      this.filterAlbums();
    }
  },

  filterAlbums() {
    let filtered = [...this.data.albums];
    if (this.data.filterType === "year" && this.data.selectedYear) {
      filtered = filtered.filter(item => {
        const year = new Date(item.createTime).getFullYear();
        return year === this.data.selectedYear;
      });
    }
    this.setData({ filteredAlbums: filtered });
  },

  onPreviewImage(e) {
    const { url, urls } = e.currentTarget.dataset;
    wx.previewImage({ current: url, urls: JSON.parse(urls) });
  },

  onDownload(e) {
    const { url } = e.currentTarget.dataset;
    wx.getSetting({
      success: (res) => {
        if (res.authSetting["scope.writePhotosAlbum"]) {
          this.downloadImage(url);
        } else {
          wx.authorize({
            scope: "scope.writePhotosAlbum",
            success: () => this.downloadImage(url),
            fail: () => {
              wx.showModal({ title: "提示", content: "需要授权保存图片", showCancel: false });
            },
          });
        }
      },
    });
  },

  downloadImage(url) {
    wx.showLoading({ title: "保存中..." });
    wx.downloadFile({
      url,
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            wx.hideLoading();
            wx.showToast({ title: "保存成功", icon: "success" });
          },
          fail: () => {
            wx.hideLoading();
            wx.showToast({ title: "保存失败", icon: "none" });
          },
        });
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: "下载失败", icon: "none" });
      },
    });
  },

  onLoadMore() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadAlbums();
    }
  },
});