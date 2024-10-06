# vue 初始化过程分析

1. initGlobalAPI(Vue) [代码位置](..\vue-2.6.10\src\core\global-api\index.js)

```typescript
import config from "../config";
import { initUse } from "./use";
import { initMixin } from "./mixin";
import { initExtend } from "./extend";
import { initAssetRegisters } from "./assets";
import { set, del } from "../observer/index";
import { ASSET_TYPES } from "shared/constants";
import builtInComponents from "../components/index";
import { observe } from "core/observer/index";

import {
  warn,
  extend,
  nextTick,
  mergeOptions,
  defineReactive,
} from "../util/index";

export function initGlobalAPI(Vue: GlobalAPI) {
  // 定义config，不能直接替换，只能修改某个属性，否则报错
  const configDef = {};
  configDef.get = () => config;
  if (process.env.NODE_ENV !== "production") {
    configDef.set = () => {
      warn(
        "Do not replace the Vue.config object, set individual fields instead."
      );
    };
  }
  Object.defineProperty(Vue, "config", configDef);

  // 定义util
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive, // 定义响应式对象
  };

  Vue.set = set;
  Vue.delete = del;
  Vue.nextTick = nextTick;

  // 2.6 explicit observable API
  Vue.observable = <T>(obj: T): T => {
    observe(obj);
    return obj;
  };

  Vue.options = Object.create(null);
  ASSET_TYPES.forEach((type) => {
    Vue.options[type + "s"] = Object.create(null);
  });
  //   ASSET_TYPES = [
  //   'component',
  //   'directive',
  //   'filter'
  //  ]

  // 这用于标识“基本”构造函数，以扩展Weex的多实例场景中的所有普通对象组件
  Vue.options._base = Vue;

  // export function extend (to: Object, _from: ?Object): Object {
  //   for (const key in _from) {
  //     to[key] = _from[key]
  //   }
  //   return to
  // }
  // builtInComponents是keep-alive组件
  extend(Vue.options.components, builtInComponents);

  initUse(Vue);
  initMixin(Vue);
  initExtend(Vue);
  initAssetRegisters(Vue);
}
```
