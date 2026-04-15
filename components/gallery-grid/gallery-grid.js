/**
 * @file 九宫格图片展示组件
 * @description 用于写真展示页，支持点击预览、长按菜单
 */

Component({
  options: {
    styleIsolation: "isolated",
  },

  properties: {
    images: {
      type: Array,
      value: [],
      observer(newVal) {
        this.setData({ imageList: newVal });
      },
    },
    showSelectBadge: {
      type: Boolean,
      value: true,
    },
    selectBadgeText: {
      type: String,
      value: "选这张",
    },
  },

  data: {
    imageList: [],
  },

  lifetimes: {
    attached() {
      this.setData({ imageList: this.properties.images });
    },
  },

  methods: {
    onImageTap(e) {
      const { index } = e.currentTarget.dataset;
      this.triggerEvent("preview", { index, url: this.data.imageList[index] });
    },

    onImageLongPress(e) {
      const { index, url } = e.currentTarget.dataset;
      this.triggerEvent("longpress", { index, url });
    },

    onSelectTap(e) {
      const { index, url } = e.currentTarget.dataset;
      this.triggerEvent("select", { index, url });
      // 阻止冒泡，避免同时触发预览
      e.stopPropagation();
    },
  },
});