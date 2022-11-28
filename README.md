## vue2源码详情解析

vue3的源码在这：[vuejs/core](https://github.com/vuejs/core).

### 1. 点击查看[项目结构](项目结构.md)
方便后面了解原理时，查找相应应代码。

### 2. 从new Vue说起
初始化入口文件在[src/core/instance/index.ts](./src/core/instance/index.ts)

创建构建函数Vue,内部使用__init接收options参数,在进行一系列初始化。

1. 首先执行initMixin(Vue)函数，内部重构__init方法用于初始化vue实例vm。详见[src/core/instance/init.ts](./src/core/instance/init.ts)
2. vue组件分为：内部组件(keep-alive、transition、transition-group)和实例组件。根据_isComponent和_isVue区分，初始化生成vm.$options。
3. 生命周期、事件方法、渲染、数据监听各项初始化，可以看出在beforeCreate时并没有初始化data
```
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate', undefined, false /* setContext */)
    initInjections(vm) // resolve injections before data/props
    initState(vm)  // 初始化props,methods,data,computed,watch
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')
```
4. initState: 详见[src/core/instance/state.ts](./src/core/instance/state.ts) 内部使用observer观察者类，即vm.$data.__ob__
5. observer：详见[src/core/observer/index.ts](./src/core/observer/index.ts)




### 3. 核心原理
#### 数据响应式核心
说人话就是：**页面用到一些数据，这些数据改变之后，页面上的数据也随之改变。** 用脚指头想想就知道，要实现响应式，我们需要主要解决下面这些问题：
1. 获取页面用到的数据，即数据劫持
2. 当数据变化能够知道，即数据监听
3. 数据更新到页面用到的位置，即依赖收集与分发
4. 数据变化影响到一些其他地方，需要进行一些其他操作，即响应操作
