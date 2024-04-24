import type { Component } from 'types/component'
import type { ComponentOptions } from 'types/options'
import type { VNodeComponentOptions, VNodeData } from 'types/vnode'

/**
 * @internal
 */
// VNode包括：注释节点、文本节点、克隆节点、元素节点、组件节点、函数式组件节点。
export default class VNode {
  tag?: string
  data: VNodeData | undefined
  children?: Array<VNode> | null
  text?: string
  elm: Node | undefined
  ns?: string
  context?: Component // 在该组件的范围内呈现
  key: string | number | undefined
  componentOptions?: VNodeComponentOptions
  componentInstance?: Component // 组件实例
  parent: VNode | undefined | null // 组件占位符节点

  // 严格的内部
  raw: boolean // contains raw HTML? (server only)
  isStatic: boolean // hoisted static node
  isRootInsert: boolean // necessary for enter transition check
  isComment: boolean // empty comment placeholder?
  isCloned: boolean // is a cloned node?
  isOnce: boolean // is a v-once node?
  asyncFactory?: Function // async component factory function
  asyncMeta: Object | void
  isAsyncPlaceholder: boolean
  ssrContext?: Object | void
  fnContext: Component | void // real context vm for functional nodes
  fnOptions?: ComponentOptions | null // for SSR caching
  devtoolsMeta?: Object | null // used to store functional render context for devtools
  fnScopeId?: string | null // functional scope id support
  isComponentRootElement?: boolean | null // for SSR directives

  constructor(
    tag?: string,
    data?: VNodeData,
    children?: Array<VNode> | null,
    text?: string,
    elm?: Node,
    context?: Component,
    componentOptions?: VNodeComponentOptions,
    asyncFactory?: Function
  ) {
    this.tag = tag /*当前节点的标签名*/
    this.data = data // 当前节点对应的对象，包含了具体的一些数据信息，是一个VNodeData类型，可以参考VNodeData类型中的数据信息
    this.children = children /*当前节点的子节点，是一个数组*/
    this.text = text /*当前节点的文本*/
    this.elm = elm /*当前虚拟节点对应的真实dom节点*/
    this.ns = undefined /*当前节点的名字空间*/
    this.context = context /*当前组件节点对应的Vue实例*/
    this.fnContext = undefined /*函数式组件对应的Vue实例*/
    this.fnOptions = undefined
    this.fnScopeId = undefined
    this.key = data && data.key /*节点的key属性，被当作节点的标志，用以优化*/
    this.componentOptions = componentOptions /*组件的option选项*/
    this.componentInstance = undefined /*当前节点对应的组件的实例*/
    this.parent = undefined /*当前节点的父节点*/
    this.raw = false //简而言之就是是否为原生HTML或只是普通文本，innerHTML的时候为true，textContent的时候为false
    this.isStatic = false /*静态节点标志*/
    this.isRootInsert = true /*是否作为跟节点插入*/
    this.isComment = false /*是否为注释节点*/
    this.isCloned = false /*是否为克隆节点*/
    this.isOnce = false /*是否有v-once指令*/
    this.asyncFactory = asyncFactory
    this.asyncMeta = undefined
    this.isAsyncPlaceholder = false
  }

  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next */
  get child(): Component | void {
    return this.componentInstance
  }
}

export const createEmptyVNode = (text: string = '') => {
  const node = new VNode()
  node.text = text
  node.isComment = true
  return node
}

export function createTextVNode(val: string | number) {
  return new VNode(undefined, undefined, undefined, String(val))
}

// 优化的浅层克隆用于静态节点和槽节点，因为它们可以在多个渲染中重用，克隆它们可以避免DOM操作依赖于它们的elm引用时的错误。
export function cloneVNode(vnode: VNode): VNode {
  const cloned = new VNode(
    vnode.tag,
    vnode.data,
    // #7975
    // clone children array to avoid mutating original in case of cloning
    // a child.
    vnode.children && vnode.children.slice(),
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions,
    vnode.asyncFactory
  )
  cloned.ns = vnode.ns
  cloned.isStatic = vnode.isStatic
  cloned.key = vnode.key
  cloned.isComment = vnode.isComment
  cloned.fnContext = vnode.fnContext
  cloned.fnOptions = vnode.fnOptions
  cloned.fnScopeId = vnode.fnScopeId
  cloned.asyncMeta = vnode.asyncMeta
  cloned.isCloned = true
  return cloned
}
