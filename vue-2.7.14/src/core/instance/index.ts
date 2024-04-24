import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'
import type { GlobalAPI } from 'types/global-api'
// import type 是用来协助进行类型检查和声明的，在运行时是完全不存在的。
function Vue(options) {
  if (__DEV__ && !(this instanceof Vue)) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options) // 内置_init属性方法接收初始化配置参数,具体实现在initMixin
}

//@ts-expect-error Vue has function type
initMixin(Vue) // 初始化
//@ts-expect-error Vue has function type
stateMixin(Vue) // 状态
//@ts-expect-error Vue has function type
eventsMixin(Vue) // 事件
//@ts-expect-error Vue has function type
lifecycleMixin(Vue) // 生命周期
//@ts-expect-error Vue has function type
renderMixin(Vue) // 渲染

export default Vue as unknown as GlobalAPI
