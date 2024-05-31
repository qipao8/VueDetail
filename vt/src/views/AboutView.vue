<script>
export default {
  name: 'about',
  inject: {
    injectTest: {}
  }
}
</script>

<template>
  <div class="about">
    <h1>This is an about page {{injectTest}}</h1>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
