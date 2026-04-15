AI-Portrait-Miniprogram/
│
├── app.js                              # 小程序入口：全局数据、登录状态、订单轮询、生命周期
├── app.json                            # 全局配置：页面路径、分包、tabBar、权限、懒加载
├── app.wxss                            # 全局样式：reset、flex工具、安全区域、骨架屏动画
├── sitemap.json                        # 搜索索引配置：允许所有页面被收录
├── project.config.json                 # 开发者工具配置：编译选项、appid、编辑器设置
│
├── pages/                              # 主包页面（仅首页，其他分包）
│   └── index/                          # 首页入口页（P0）
│       ├── index.js                    # 逻辑：检查登录、加载案例写真、跳转拍摄、分享
│       ├── index.wxml                  # 结构：立即拍摄按钮 + 横向滚动案例（最多6张）
│       ├── index.wxss                  # 样式：渐变背景、按钮阴影、骨架屏动画
│       └── index.json                  # 配置：导航栏标题“AI写真馆”
│
├── packageCore/                        # 核心功能分包（6个P0页面）
│   └── pages/
│       ├── upload/                     # 拍照/上传页（P0）
│       │   ├── upload.js               # 逻辑：相机/相册选择、图片压缩、人脸检测、质量评估、安全检测、上传OSS、跳转风格页
│       │   ├── upload.wxml             # 结构：模式切换（拍照/相册）、相机预览、图片预览、操作按钮
│       │   ├── upload.wxss             # 样式：模式标签、相机控件、预览区、加载遮罩
│       │   └── upload.json             # 配置：导航栏标题“拍摄照片”
│       │
│       ├── style/                      # 风格选择页（P0）
│       │   ├── style.js                # 逻辑：获取风格列表、选中风格、创建生成任务、跳转等待页
│       │   ├── style.wxml              # 结构：2列宫格风格列表、底部生成按钮
│       │   ├── style.wxss              # 样式：宫格卡片、选中边框、底部固定按钮
│       │   └── style.json              # 配置：导航栏标题“选择风格”
│       │
│       ├── generate/                   # 生成等待页（P0）
│       │   ├── generate.js             # 逻辑：轮询任务状态（3秒）、进度动画、预估等待时间、完成后跳转写真展示页
│       │   ├── generate.wxml           # 结构：骨骼动画、进度条、状态信息、取消/刷新按钮
│       │   ├── generate.wxss           # 样式：脉冲动画、进度填充、操作按钮
│       │   └── generate.json           # 配置：导航栏标题“生成中”、禁止滚动
│       │
│       ├── gallery/                    # 写真展示页（P0）
│       │   ├── gallery.js              # 逻辑：展示9张写真、预览大图、长按保存/设为封面、选图跳转确认页
│       │   ├── gallery.wxml            # 结构：九宫格图片、每个格子带“选这张”徽章
│       │   ├── gallery.wxss            # 样式：3列网格、选中徽章、骨架屏
│       │   └── gallery.json            # 配置：导航栏标题“写真展示”
│       │
│       ├── confirm/                    # 选图确认页（P0）
│       │   ├── confirm.js              # 逻辑：大图展示选中照片、重新选择、确认后创建订单、跳转相框页
│       │   ├── confirm.wxml            # 结构：大图预览区、重新选择按钮、底部确认按钮、相框入口
│       │   ├── confirm.wxss            # 样式：黑底大图、半透明重新选择、白色底部栏
│       │   └── confirm.json            # 配置：导航栏标题“确认选图”、黑色背景、白色文字
│       │
│       └── frame/                      # 相框款式页（P0）
│           ├── frame.js                # 逻辑：获取相框列表、选中款式、通知员工下单、跳转订单列表
│           ├── frame.wxml              # 结构：横向滚动相框列表、底部通知按钮
│           ├── frame.wxss              # 样式：相框卡片、选中边框、固定底部按钮
│           └── frame.json              # 配置：导航栏标题“选择相框”
│
├── packageUser/                        # 用户中心分包（P0登录、P0云相册、P1订单、P1积分）
│   └── pages/
│       ├── login/                      # 手机号+验证码登录（P0）
│       │   ├── login.js                # 逻辑：发送验证码、倒计时、登录、存储token、跳转首页
│       │   ├── login.wxml              # 结构：Logo、手机号输入、验证码输入、获取验证码按钮、登录按钮
│       │   ├── login.wxss              # 样式：居中卡片、输入框、按钮绿色
│       │   └── login.json              # 配置：导航栏标题“登录”
│       │
│       ├── cloud-album/                # 写真云相册（P0）
│       │   ├── cloud-album.js          # 逻辑：加载历史写真、年份筛选、分页加载、预览、保存到相册
│       │   ├── cloud-album.wxml        # 结构：年份筛选栏、2列网格图片、下载按钮
│       │   ├── cloud-album.wxss        # 样式：筛选胶囊、图片卡片、空状态
│       │   └── cloud-album.json        # 配置：导航栏标题“写真云相册”、下拉刷新
│       │
│       ├── order-list/                 # 订单状态查看（P1）
│       │   ├── order-list.js           # 逻辑：Tab切换（进行中/已完成）、加载订单列表、跳转详情
│       │   ├── order-list.wxml         # 结构：Tab栏、订单卡片（订单号、状态、图片、预计时间）
│       │   ├── order-list.wxss         # 样式：Tab指示器、卡片圆角、状态色
│       │   └── order-list.json         # 配置：导航栏标题“我的订单”、下拉刷新
│       │
│       └── points/                     # 积分体系（P1）
│           ├── points.js               # 逻辑：展示积分余额、Tab切换获取/使用记录、跳转拍照
│           ├── points.wxml             # 结构：积分卡片、Tab、记录列表、底部按钮
│           ├── points.wxss             # 样式：渐变积分卡、Tab切换胶囊、红绿积分数字
│           └── points.json             # 配置：导航栏标题“积分中心”
│
├── components/                         # 公共组件
│   ├── loading/                        # 全局加载组件
│   │   ├── loading.js                  # 逻辑：控制显示/隐藏、文本、遮罩可关闭
│   │   ├── loading.wxml                # 结构：全屏遮罩、旋转动画、加载文字
│   │   ├── loading.wxss                # 样式：半透明黑色背景、白色圆角卡片、旋转动画
│   │   └── loading.json                # 配置：组件声明
│   │
│   ├── modal/                          # 通用弹窗组件
│   │   ├── modal.js                    # 逻辑：显示/隐藏、标题、内容、确认/取消按钮、遮罩关闭
│   │   ├── modal.wxml                  # 结构：遮罩层、弹窗容器、标题区、内容区、底部双按钮
│   │   ├── modal.wxss                  # 样式：淡入动画、圆角、按钮分割线
│   │   └── modal.json                  # 配置：组件声明
│   │
│   ├── gallery-grid/                   # 九宫格写真组件
│   │   ├── gallery-grid.js             # 逻辑：接收图片数组、支持点击预览、长按菜单、选图事件
│   │   ├── gallery-grid.wxml           # 结构：3列网格、图片、可选“选这张”徽章
│   │   ├── gallery-grid.wxss           # 样式：网格布局、图片比例1:1、徽章定位
│   │   └── gallery-grid.json           # 配置：组件声明
│   │
│   └── frame-list/                     # 相框横向滚动组件
│       ├── frame-list.js               # 逻辑：接收相框列表、选中样式、详情弹窗
│       ├── frame-list.wxml             # 结构：横向滚动容器、相框卡片（图片、名称、价格、详情按钮）
│       ├── frame-list.wxss             # 样式：inline-flex布局、卡片阴影、选中边框
│       └── frame-list.json             # 配置：组件声明
│
├── utils/                              # 工具函数库
│   ├── constants.js                    # 全局常量：API地址、存储Key、任务状态、订单状态、图片质量阈值、轮询间隔
│   ├── request.js                      # 统一请求封装：拦截器、token自动注入、重试机制、token刷新队列
│   ├── storage.js                      # 加密存储：Base64加解密、setStorage/getStorage、敏感数据加密存储
│   ├── image-helper.js                 # 图片处理：压缩（canvas降采样+wx.compressImage）、人脸检测、质量评估、上传OSS
│   ├── security.js                     # 内容安全：文本检测(msgSecCheck)、图片检测、敏感信息脱敏、验证码校验
│   └── share.js                        # 分享工具：生成分享图、小程序码、分享成功回调（注：原清单中未列，但为完整性补充）
│
├── services/                           # API服务层
│   ├── ai-service.js                   # AI模块接口：获取风格列表、创建生成任务、查询任务状态、获取结果、队列时间、取消任务
│   ├── order-service.js                # 订单模块接口：获取相框列表、提交订单、订单详情、订单列表、取消订单
│   ├── user-service.js                 # 用户模块接口：发送验证码、手机号登录、获取相册列表、积分余额、积分兑换
│   └── notify-service.js               # 通知模块接口：订阅消息、发送通知（模板ID预留）
│
├── assets/                             # 静态资源
│   ├── images/                         # 图片资源（共13个占位图，实际需替换）
│   │   ├── camera-icon.png             # 相机按钮图标（base64占位）
│   │   ├── album-placeholder.png       # 相册占位图
│   │   ├── check-circle.png            # 选中勾选图标
│   │   ├── empty-style.png             # 空状态占位图
│   │   ├── share-cover.png             # 分享封面图
│   │   ├── empty-album.png             # 云相册空状态图
│   │   ├── empty-order.png             # 订单空状态图
│   │   ├── empty-style.png             # 风格空状态图
│   │   ├── logo.png                    # 应用Logo
│   │   ├── icon-share.png              # 分享图标（积分页）
│   │   ├── icon-rule.png               # 规则图标（积分页）
│   │   ├── tab-home.png                # 首页Tab未选中图标
│   │   ├── tab-home-active.png         # 首页Tab选中图标
│   │   ├── tab-album.png               # 相册Tab未选中图标
│   │   ├── tab-album-active.png        # 相册Tab选中图标
│   │   ├── tab-order.png               # 订单Tab未选中图标
│   │   ├── tab-order-active.png        # 订单Tab选中图标
│   │   ├── tab-user.png                # 我的Tab未选中图标
│   │   └── tab-user-active.png         # 我的Tab选中图标
│   │
│   └── styles/                         # 全局样式片段
│       └── common.wxss                 # 公共样式：主题色变量、通用按钮、卡片、分割线、骨架屏动画
│
├── miniprogram_npm/                    # npm依赖（按需，本工程未使用第三方包，目录可空）
│
└── project.private.config.json         # 私有配置（开发者工具自动生成，不纳入版本控制）