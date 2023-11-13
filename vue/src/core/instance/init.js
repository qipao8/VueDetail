/* @flow */

import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

let uid = 0

export function initMixin(Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // a uid
    vm._uid = uid++

    let startTag, endTag
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed
    vm._isVue = true
    // 初始化实例属性：在 _init 函数的开始部分，会给 Vue 实例添加一些属性，如 _isVue 标记，以及初始化一些对象，如 $options、$parent、$children、$refs 等。

    // merge options
    // 合并选项：使用 initMixin 函数合并构造函数选项和实例选项。这里的“选项”指的是创建 Vue 实例时传递的选项，如 data、methods、computed 和 watch。
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options)
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    // 初始化生命周期：设置了实例的 _watchers 属性，这是一个数组，用于存储所有的观察者对象。然后调用 initLifecycle 函数来初始化实例的父子关系。
    initLifecycle(vm)
    // 初始化事件：通过 initEvents 函数初始化事件监听器，这涉及到父子组件之间的事件通信。
    initEvents(vm)
    // 初始化渲染：调用 initRender 函数，初始化渲染函数和 createElement 方法。这是 Vue 的虚拟 DOM 实现的一部分，关键于后续的模板编译和渲染过程。
    initRender(vm)
    // 调用 beforeCreate 钩子：在实例完全初始化之前，调用 beforeCreate 生命周期钩子。
    callHook(vm, 'beforeCreate')
    // 初始化注入器和响应式属性：通过 initInjections 和 initState 函数初始化依赖注入和实例的响应式属性。initState 函数是响应式系统的核心，它初始化了实例的 props、methods、data、computed 和 watch。
    initInjections(vm) // resolve injections before data/props
    initState(vm)
    // 调用 created 钩子：在实例创建完成后（即所有的响应式数据和计算属性都已设置好），调用 created 生命周期钩子。
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }
    // 挂载实例：如果在实例化时传递了 el 选项（即挂载点），Vue 将自动调用 $mount 方法进行挂载。否则，需要手动调用 $mount 方法。
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}

// 这个函数用于优化内部组件的初始化过程。在 Vue 中，组件实例化时会进行大量的选项合并操作（即将全局选项和传入的选项合并）。对于一些内部组件（如 <keep-alive>、<transition> 等），Vue 会使用 initInternalComponent 函数来进行更高效的选项合并。这是因为这些内部组件的选项在编译时就已知，不需要进行正常组件那样的完整选项合并过程。
export function initInternalComponent(vm: Component, options: InternalComponentOptions) {
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode

  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}

// 这个函数用于解析构造函数的选项。在 Vue 中，每个组件都可以被视为一个构造函数的实例。当你使用 Vue.extend 创建一个子类或者使用组件时，Vue 内部会用到这个函数来获取当前构造函数的选项。这个函数会考虑到继承关系，确保从基类（例如 Vue）到派生类（例如通过 Vue.extend 创建的子类）的所有选项都被正确解析和合并。
export function resolveConstructorOptions(Ctor: Class<Component>) {
  let options = Ctor.options
  if (Ctor.super) {
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}

// 这个函数的作用是解析一个构造函数的修改后的选项。在 Vue 应用中，你可能会使用 Vue.mixin 或者在组件中定义选项，如 methods、computed 等。当通过 Vue.extend 创建一个子类时，Vue 需要知道相对于基类（Vue）这个子类具有哪些不同的选项。resolveModifiedOptions 函数就是用来获取这些差异化的选项的，这样 Vue 可以仅应用那些新增或修改过的选项，从而优化性能。
function resolveModifiedOptions(Ctor: Class<Component>): ?Object {
  let modified
  const latest = Ctor.options
  const sealed = Ctor.sealedOptions
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = latest[key]
    }
  }
  return modified
}
