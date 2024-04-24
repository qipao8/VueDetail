let data = {
  a: 1,
  b: 2
}
let proxy = new Proxy(data, {})
proxy.a = 2
console.log(proxy.a, data.a)
