import Vue from "vue";
import App from "./App.vue";

import "./assets/main.css";
const render = (h) => {
  return h(App);
};
function addNumbers(a: number, b: number): number {
    return a + b;
}

// 测试
const result = addNumbers(5, 3);
console.log(result);
new Vue({
  render,
}).$mount("#app");
