`Map`和`WeakMap`是ES6中提供的两种不同的数据结构，它们之间有一些区别。

1. 引用类型的键：在`Map`中，键可以是任意类型的值，包括基本数据类型和引用类型。而在`WeakMap`中，键必须是对象类型。如果键是基本数据类型，则会抛出错误。

2. 弱引用：`WeakMap`中的键是弱引用的，即当键所对应的对象没有被其他引用（即没有被内存以外的变量引用）时，该键值对会被垃圾回收。而`Map`中的键是强引用的，即使对象没有被其他引用，键值对也不会被垃圾回收。

3. 可迭代性：`Map`是可迭代的，可以使用`for...of`循环遍历其中的键值对。而`WeakMap`不是可迭代的，不能直接进行遍历。

4. 方法差异：虽然`WeakMap`和`Map`都有类似的方法，如`get`、`set`、`has`等，但`WeakMap`不支持`size`属性，也不能清空整个`WeakMap`，而`Map`可以通过`clear`方法清空所有键值对。

总的来说，`Map`适用于需要保留键值对且不希望被回收的情况，而`WeakMap`适用于需要临时保存对象并且不希望影响垃圾回收的情况。


一个常见的使用场景是在需要向对象添加额外数据但又不想影响对象本身的情况下。由于`WeakMap`的键是弱引用的，当对应的对象被销毁后，`WeakMap`中对应的键值对也会被自动清理，这有助于防止内存泄漏。

下面是一个简单的使用`WeakMap`的示例：

```javascript
let privateData = new WeakMap();

class Person {
    constructor(name) {
        privateData.set(this, { name: name });
    }

    getName() {
        return privateData.get(this).name;
    }
}

let person1 = new Person('Alice');
console.log(person1.getName()); // 输出 'Alice'

// 当不再引用person1时，privateData中的键值对也会被自动清理
```

在这个例子中，`privateData`是一个`WeakMap`，用于存储`Person`对象的私有数据，即使外部无法直接访问，保持了封装性。当不再需要`Person`对象时，该对象及其对应的私有数据会被自动清理，不会造成内存泄漏。