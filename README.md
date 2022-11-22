## vue2源码详情解析

vue3的源码在这：[vuejs/core](https://github.com/vuejs/core).

### 1. 点击查看[项目结构](项目结构.md)
方便后面了解原理时，查找相应应代码。

### 2. 从new Vue说起
初始化入口文件在[src/core/instance/index.ts](./src/core/instance/index.ts)

创建构建函数Vue,内部使用__init接收options参数,在进行一系列初始化。

1. 首先执行initMixin(Vue)函数，内部重构__init方法用于初始化组件。详见[src/core/instance/init.ts](./src/core/instance/init.ts)


### 3. 核心原理
#### 数据响应式核心
说人话就是：**页面用到一些数据，这些数据改变之后，页面上的数据也随之改变。** 用脚指头想想就知道，要实现响应式，我们需要主要解决下面这些问题：
1. 获取页面用到的数据，即数据劫持
2. 当数据变化能够知道，即数据监听
3. 数据更新到页面用到的位置，即依赖收集与分发
4. 数据变化影响到一些其他地方，需要进行一些其他操作，即响应操作
