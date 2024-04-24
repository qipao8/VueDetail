## defineProperty和Proxy
##### 区别：
1. defineProperty是监听对象属性变化，proxy是直接监听对象变化(优势主要在于属性的新增与删除)。
2. proxy兼容数组监听。