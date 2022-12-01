## vue2源码详情解析

vue3的源码在这：[vuejs/core](https://github.com/vuejs/core).

### 1. 点击查看[项目结构](项目结构.md)
方便后面了解原理时，查找相应应代码。
- vscode代码展开与折叠快捷键
```
Ctrl+k Ctrl+0/_ : 全部折叠
Ctrl+k Ctrl+J/=: 全部展开
```

### 2. 从new Vue说起
初始化入口文件在[src/core/instance/index.ts](./src/core/instance/index.ts)

创建构建函数Vue,内部使用__init接收options参数,在进行一系列初始化。

1. 首先执行initMixin(Vue)函数，内部重构__init方法用于初始化vue实例vm。详见[src/core/instance/init.ts](./src/core/instance/init.ts)
2. vue组件分为：内部组件(keep-alive、transition、transition-group)和实例组件。根据_isComponent和_isVue区分，初始化生成vm.$options。
3. 初始化创建vue组件实例->初始化生命周期->绑定事件(事件总线相关)->初始化渲染->beforeCreate->初始化依赖注入&响应式数据->created
```
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate', undefined, false /* setContext */)
    initInjections(vm) // 解析依赖数据 before data/props
    initState(vm)  // 初始化props,methods,data,computed,watch
    initProvide(vm) // 解析注入数据 after data/props
    callHook(vm, 'created')
```
#### [VNode](./src/core/vdom/vnode.ts)
- 虚拟dom就是用js对象的形式描述一个dom节点。操作真实dom非常耗费性能，因此需要vdom减少真实dom操作消耗。对应于vm的 **_vnode** 属性
- VNode包括：注释节点、文本节点、克隆节点、元素节点(普通元素)、组件节点(SFC单文件组件)、函数式组件节点。
- VNode主要属性：tag(标签名),data(VNodeData),children(子VNode数组),text,elm(真实dom),context(对应的vm),componentOptions(SFC参数),componentInstance(SFC对应实例),fnContext(函数式组件对应实例),fnOptions(函数式组件参数)

4. initRender：
5. initState: 详见[src/core/instance/state.ts](./src/core/instance/state.ts) 内部使用observer观察者类，即vm.$data.__ob__
6. observer：详见[src/core/observer/index.ts](./src/core/observer/index.ts)




### 3. 核心原理
#### 数据响应式核心
说人话就是：**页面用到一些数据，这些数据改变之后，页面上的数据也随之改变。** 用脚指头想想就知道，要实现响应式，我们需要主要解决下面这些问题：
1. 获取页面用到的数据，即数据劫持
2. 当数据变化能够知道，即数据监听
3. 数据更新到页面用到的位置，即依赖收集与分发
4. 数据变化影响到一些其他地方，需要进行一些其他操作，即响应操作
