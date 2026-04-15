/**
 * @file 相框横向滚动列表组件
 * @description 支持横向滑动选择相框，展示图片、名称、价格
 */

Component({
  options: {
    styleIsolation: "isolated",
  },

  properties: {
    frames: {
      type: Array,
      value: [],
      observer(newVal) {
        this.setData({ frameList: newVal });
      },
    },
    selectedId: {
      type: String,
      value: "",
      observer(newVal) {
        this.setData({ selectedFrameId: newVal });
      },
    },
  },

  data: {
    frameList: [],
    selectedFrameId: "",
  },

  lifetimes: {
    attached() {
      this.setData({
        frameList: this.properties.frames,
        selectedFrameId: this.properties.selectedId,
      });
    },
  },

  methods: {
    onSelectFrame(e) {
      const { id } = e.currentTarget.dataset;
      this.setData({ selectedFrameId: id });
      this.triggerEvent("select", { frameId: id });
    },

    onShowDetail(e) {
      const { frame } = e.currentTarget.dataset;
      this.triggerEvent("detail", { frame });
    },
  },
});