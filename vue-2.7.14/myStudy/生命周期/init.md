### new 一个 Vue 开始说起

建议配合[vue 源码系列-生命周期篇](https://vue-js.com/learn-vue/lifecycle/newVue.html#/_2-new-vue-%E9%83%BD%E5%B9%B2%E4%BA%86%E4%BB%80%E4%B9%88)一同观看学习，本文以源码中的[commits](../../examples/classic/commits/app.js)为例。

1. 在 new Vue 的代码行打上断点，刷新页面进入调试，进入下一个函数调用
   ![alt text](image.png)

2. options 配置初始化
   ![alt text](image-1.png)

3. [src/core/instance/init.ts](../../src/core/instance/init.ts) 部分重点代码

```javascript
export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this
    vm.$options = mergeOptions(
      resolveConstructorOptions(vm.constructor),
      options || {},
      vm
    )
    vm._self = vm
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate')
    initInjections(vm) // resolve injections before data/props
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}
```

进行一系列初始化，重点关注**vm**
![alt text](image-2.png)

**vm.\$options**

- 引入其他组件，实际上就是改变$options 中的 components，因此可以动态修改引入组件。
- directives：指令
- filters: 过滤
  ![alt text](image-3.png)

**mergeOptions** 该方法在./mergeOptions.md 中单独介绍

```javascript
vm.$options = mergeOptions(
    resolveConstructorOptions(vm.constructor as any),
    options || {},
    vm
)
```

4. [initLifecycle](https://vue-js.com/learn-vue/lifecycle/initLifecycle.html#_2-initlifecycle%E5%87%BD%E6%95%B0%E5%88%86%E6%9E%90) 代码位置 src/core/instance/lifecycle.ts
   (ps:在源码中搜索 abstract，发现默认 abstract:true 的是内置组件 keep-alive，transition)

```javascript
export function initLifecycle(vm: Component) {
  const options = vm.$options

  // locate first non-abstract parent
  let parent = options.parent
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent
    }
    parent.$children.push(vm)
  }

  vm.$parent = parent
  vm.$root = parent ? parent.$root : vm

  vm.$children = []
  vm.$refs = {}

  vm._provided = parent ? parent._provided : Object.create(null)
  vm._watcher = null
  vm._inactive = null
  vm._directInactive = false
  vm._isMounted = false
  vm._isDestroyed = false
  vm._isBeingDestroyed = false
}
```

5. [initEvents](https://vue-js.com/learn-vue/lifecycle/initEvents.html#_1-%E5%89%8D%E8%A8%80)
   初始化\_events 用于存储事件，将 parent 事件注册到子组件。

```javascript
export function initEvents(vm: Component) {
  vm._events = Object.create(null)
  vm._hasHookEvent = false
  // init parent attached events
  const listeners = vm.$options._parentListeners
  if (listeners) {
    updateComponentListeners(vm, listeners)
  }
}
```

事件绑定涉及模板编译，后续在模板编译篇再展开分析。

6. [initRender](../../src/core/instance/render.ts)

```javascript
export function initRender(vm: Component) {
  vm._vnode = null // the root of the child tree
  vm._staticTrees = null // v-once cached trees
  const options = vm.$options
  const parentVnode = (vm.$vnode = options._parentVnode!) // the placeholder node in parent tree
  const renderContext = parentVnode && (parentVnode.context as Component)
  vm.$slots = resolveSlots(options._renderChildren, renderContext)
  vm.$scopedSlots = parentVnode
    ? normalizeScopedSlots(
        vm.$parent!,
        parentVnode.data!.scopedSlots,
        vm.$slots
      )
    : emptyObject
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
  const parentData = parentVnode && parentVnode.data
    defineReactive(
      vm,
      '$attrs',
      (parentData && parentData.attrs) || emptyObject,
      null,
      true
    )
    defineReactive(
      vm,
      '$listeners',
      options._parentListeners || emptyObject,
      null,
      true
    )
}
```

**createElement**用于生成 vnode，后续再展开介绍。
**defineReactive**定义响应式数据，给 vm 添加\$atts,$listeners

7. **callHook** 源码位置：./src/core/instance/lifecycle.ts

```javascript
export function callHook(
  vm: Component,
  hook: string,
  args?: any[],
  setContext = true
) {
  // #7573 disable dep collection when invoking lifecycle hooks
  pushTarget() // 禁用依赖收集
  const prev = currentInstance
  setContext && setCurrentInstance(vm)
  const handlers = vm.$options[hook] // 当前调用的生命周期方法
  const info = `${hook} hook`
  if (handlers) {
    for (let i = 0, j = handlers.length; i < j; i++) {
      invokeWithErrorHandling(handlers[i], vm, args || null, vm, info)
    }
  }
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook)
  }
  setContext && setCurrentInstance(prev)
  popTarget() // 恢复依赖收集
}
```

8. **inject/provide** 源码位置：./src/core/instance/inject.ts

```javascript
import { warn, hasSymbol, isFunction, isObject } from '../util/index'
import { defineReactive, toggleObserving } from '../observer/index'
import type { Component } from 'types/component'
import { resolveProvided } from 'v3/apiInject'

export function initProvide(vm: Component) {
  const provideOption = vm.$options.provide
  if (provideOption) {
    const provided = isFunction(provideOption)
      ? provideOption.call(vm)
      : provideOption
    if (!isObject(provided)) {
      return
    }
    const source = resolveProvided(vm)
    // IE9 doesn't support Object.getOwnPropertyDescriptors so we have to
    // iterate the keys ourselves.
    const keys = hasSymbol ? Reflect.ownKeys(provided) : Object.keys(provided)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      Object.defineProperty(
        source,
        key,
        Object.getOwnPropertyDescriptor(provided, key)!
      )
    }
  }
}

export function initInjections(vm: Component) {
  const result = resolveInject(vm.$options.inject, vm)
  if (result) {
    toggleObserving(false)
    Object.keys(result).forEach(key => {
      /* istanbul ignore else */
      if (__DEV__) {
        defineReactive(vm, key, result[key], () => {
          warn(
            `Avoid mutating an injected value directly since the changes will be ` +
              `overwritten whenever the provided component re-renders. ` +
              `injection being mutated: "${key}"`,
            vm
          )
        })
      } else {
        defineReactive(vm, key, result[key])
      }
    })
    toggleObserving(true)
  }
}

export function resolveInject(
  inject: any,
  vm: Component
): Record<string, any> | undefined | null {
  if (inject) {
    // inject is :any because flow is not smart enough to figure out cached
    const result = Object.create(null)
    const keys = hasSymbol ? Reflect.ownKeys(inject) : Object.keys(inject)

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      // #6574 in case the inject object is observed...
      if (key === '__ob__') continue
      const provideKey = inject[key].from
      if (provideKey in vm._provided) {
        result[key] = vm._provided[provideKey]
      } else if ('default' in inject[key]) {
        const provideDefault = inject[key].default
        result[key] = isFunction(provideDefault)
          ? provideDefault.call(vm)
          : provideDefault
      } else if (__DEV__) {
        warn(`Injection "${key as string}" not found`, vm)
      }
    }
    return result
  }
}

```

遍历 inject 对象中的 key，通过 inject[key].from 获取 provideKey,vm.\_provided[provideKey]获取 inject[key]对应值；
其中 vm.\_provided 在**initLifecycle**中继承 parent.\_provided

> vm.\_provided = parent ? parent.\_provided : Object.create(null)

这里会对与 inject[key]**.from**有疑惑，这里的**.from**来自哪里？
(ps: 来自mergeOptions中的normalizeInject，规范化inject参数，解决使用时没有配置from的情况)

9. **initState** 源码位置：./src/core/instance/state.ts
```javascript
export function initState(vm: Component) {
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props)

  // Composition API
  initSetup(vm)

  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm)
  } else {
    const ob = observe((vm._data = {}))
    ob && ob.vmCount++
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}
```