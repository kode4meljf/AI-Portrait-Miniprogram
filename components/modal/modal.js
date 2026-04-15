/**
 * @file 通用弹窗组件
 * @description 支持标题、内容、按钮配置，可自定义
 */

Component({
  options: {
    styleIsolation: "isolated",
  },

  properties: {
    visible: {
      type: Boolean,
      value: false,
    },
    title: {
      type: String,
      value: "提示",
    },
    content: {
      type: String,
      value: "",
    },
    showCancel: {
      type: Boolean,
      value: true,
    },
    cancelText: {
      type: String,
      value: "取消",
    },
    confirmText: {
      type: String,
      value: "确定",
    },
    maskClosable: {
      type: Boolean,
      value: false,
    },
  },

  methods: {
    onMaskTap() {
      if (this.properties.maskClosable) {
        this.onCancel();
      }
    },

    onCancel() {
      this.triggerEvent("cancel");
    },

    onConfirm() {
      this.triggerEvent("confirm");
    },

    // 阻止冒泡
    stopPropagation() {},
  },
});